import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { commerceSpecs } from "../src/lib/commerce.ts";
import { withColorImages, productGallery } from "../src/lib/product-media.ts";

const db = new PGlite();
const sql = await readFile(new URL("../supabase/activate-commerce.sql", import.meta.url), "utf8");
before(async () => {
  await db.exec(`create role anon; create role authenticated;
    create function public.is_store_admin() returns boolean language sql stable as $$select current_setting('test.admin',true) = 'yes'$$;
    create function public.is_store_admin_account() returns boolean language sql stable as $$select public.is_store_admin()$$;
    create function public.record_sale(jsonb,text,numeric) returns jsonb language sql as $$select '{}'::jsonb$$;
    create function public.export_store_backup() returns jsonb language sql as $$select '{}'::jsonb$$;
    create table products(id text primary key, specs jsonb, stock_count integer);
    create table store_settings(key text primary key, value jsonb, updated_at timestamptz);
    create table sale_operations(id text primary key);
    alter table products enable row level security; alter table store_settings enable row level security;
    grant select on products, store_settings to anon, authenticated;
    grant insert, update, delete on products, store_settings to authenticated;
    create policy products_public_read on products for select using(true);
    create policy products_admin_write on products for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
    create policy settings_admin_write on store_settings for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
    insert into products values ('old','{}',3),('draft','{"storeStatus":"draft"}',4),('real','{"storeStatus":"live"}',5);
    insert into store_settings values ('sales_records','[{"customerName":"Privado"}]',now()),('commerce_settings','{"owner":"Negocio"}',now());`);
  await db.exec(sql);
});
after(async () => { await db.close(); });

test("anonymous readers cannot discover drafts or private sales, but can read configured business data", async () => {
  await db.exec("set role anon");
  assert.deepEqual((await db.query("select id from products order by id")).rows.map(r => r.id), ["old", "real"]);
  assert.equal((await db.query("select * from products where id='draft'")).rows.length, 0);
  assert.equal((await db.query("select * from store_settings where key='sales_records'")).rows.length, 0);
  assert.equal((await db.query("select value from store_settings where key='commerce_settings'")).rows[0].value.owner, "Negocio");
  await db.exec("reset role");
});

test("installation is repeatable, preserves stock and restricts administrator writes", async () => {
  await db.exec(sql);
  assert.deepEqual((await db.query("select stock_count from products order by id")).rows.map(r => r.stock_count), [4, 3, 5]);
  await db.exec("set role authenticated");
  await assert.rejects(db.query("select export_store_backup()"), /MFA requerido/);
  await assert.rejects(db.query("insert into products values ('unauthorized','{}',1)"), /row-level security/);
  await db.query("select set_config('test.admin','yes',false)");
  assert.equal((await db.query("select * from products where id='draft'")).rows.length, 1);
  await db.query("update products set stock_count=stock_count where id='draft'");
  const backup = (await db.query("select export_store_backup() snapshot")).rows[0].snapshot;
  assert.ok(backup.tables.store_settings.some(row => row.key === "commerce_settings"));
  assert.ok(backup.tables.store_settings.some(row => row.key === "sales_records"));
  await db.exec("reset role");
});

test("the visibility switch hides and restores a product with the already-installed policy", async () => {
  await db.query("select set_config('test.admin','yes',false)");
  await db.exec("set role authenticated");
  await db.query("update products set specs=$1::jsonb where id='real'", [JSON.stringify(commerceSpecs({ visible: false, warranty: "", included: "", delivery: "" }))]);
  await db.exec("reset role; set role anon");
  assert.equal((await db.query("select id from products where id='real'")).rows.length, 0);
  await db.exec("reset role; set role authenticated");
  await db.query("update products set specs=$1::jsonb where id='real'", [JSON.stringify(commerceSpecs({ visible: true, warranty: "", included: "", delivery: "" }))]);
  await db.exec("reset role; set role anon");
  assert.equal((await db.query("select stock_count from products where id='real'")).rows[0].stock_count, 5);
  await db.exec("reset role");
});

test("an open product form cannot undo a concurrent stock change or replace newer galleries", async () => {
  await db.exec("reset role; alter table products add column updated_at timestamptz, add column images jsonb, add column colors jsonb");
  const color = withColorImages({ name: "Negro", hex: "#111", image: "" }, ["/black-front.png", "/black-side.png"]);
  const white = withColorImages({ name: "Blanco", hex: "#fff", image: "" }, ["/white-front.png"]);
  await db.query("update products set updated_at=$1, images=$2, colors=$3 where id='real'", ["2026-10-06T12:00:00Z", JSON.stringify(["/general.png"]), JSON.stringify([color, white])]);
  const opened = (await db.query("select * from products where id='real'")).rows[0];
  await db.exec("set role authenticated");
  await db.query("update products set stock_count=stock_count-1, updated_at=$1 where id='real'", ["2026-10-06T12:01:00Z"]);
  const stale = await db.query("update products set stock_count=$1,images=$2 where id='real' and stock_count=$3 and updated_at=$4 returning id", [opened.stock_count, JSON.stringify(["/old-draft.png"]), opened.stock_count, opened.updated_at]);
  assert.equal(stale.rows.length, 0);
  const afterSale = (await db.query("select * from products where id='real'")).rows[0];
  assert.equal(afterSale.stock_count, 4);
  assert.deepEqual(afterSale.images, ["/general.png"]);
  await db.query("update products set images=$1, updated_at=$2 where id='real'", [JSON.stringify(["/newer-photo.png"]), "2026-10-06T12:02:00Z"]);
  const stalePhotos = await db.query("update products set images=$1 where id='real' and stock_count=$2 and updated_at=$3 returning id", [JSON.stringify(["/old-draft.png"]), afterSale.stock_count, afterSale.updated_at]);
  assert.equal(stalePhotos.rows.length, 0);
  const refreshed = (await db.query("select * from products where id='real'")).rows[0];
  const saved = await db.query("update products set images=$1, updated_at=$2 where id='real' and stock_count=$3 and updated_at=$4 returning *", [JSON.stringify(["/approved-photo.png"]), "2026-10-06T12:03:00Z", refreshed.stock_count, refreshed.updated_at]);
  assert.equal(saved.rows.length, 1);
  assert.equal(saved.rows[0].stock_count, 4);
  assert.deepEqual(productGallery(saved.rows[0], 0, "/empty.png"), ["/black-front.png", "/black-side.png"]);
  assert.deepEqual(productGallery(saved.rows[0], 1, "/empty.png"), ["/white-front.png"]);
  await db.exec("reset role");
});
