import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createRecoverySql, validateStoreSnapshot } from "../src/lib/store-backup.ts";

const db = new PGlite();
const owner = "11111111-1111-4111-8111-111111111111";
const ordinary = "22222222-2222-4222-8222-222222222222";
async function role(name, sub = owner, aal = "aal2") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)", [sub, JSON.stringify({ sub, aal })]);
  await db.exec(`set role ${name}`);
}
const sale = (id, color = "Negro") => ({ id, productName: "Untrusted name", customerName: "Private customer", customerPhone: "999888777", customerAddress: "Private address", notes: "Private notes", channel: "WhatsApp", date: "2026-10-10", timestamp: 1791637200000, quantity: 1, total: 100, deliveryStatus: "pending", selectedColor: color });
async function record(value) { return (await db.query("select public.record_sale($1::jsonb,'variant',100) result", [JSON.stringify(value)])).rows[0].result; }
let firstLink;
before(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key,email text); create table auth.mfa_factors(id text primary key,user_id uuid,status text,factor_type text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}')$$;
    grant usage on schema auth to anon,authenticated;
    insert into auth.users values('${owner}','recovery@example.invalid'),('${ordinary}','ordinary@example.invalid');`);
  await db.exec(await readFile(new URL("../supabase_schema.sql", import.meta.url), "utf8"));
  await db.exec(`insert into store_admins(user_id) values('${owner}'); insert into auth.mfa_factors values('totp','${owner}','verified','totp');`);
  for (const path of ["supabase/activate-mfa.sql", "supabase/activate-atomic-sales.sql", "supabase/activate-backups.sql", "supabase/activate-commerce.sql", "supabase/activate-shopping-experience.sql"]) await db.exec(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
  await role("authenticated");
});
after(() => db.close());
test("schema changes do not allocate legacy stock, but enforce complete variant totals", async () => {
  await db.exec(`insert into products(id,name,slug,price,stock_count,in_stock) values('legacy','Legacy','legacy',100,4,true)`);
  assert.deepEqual((await db.query("select stock_count,colors from products where id='legacy'")).rows[0], { stock_count: 4, colors: [] });
  const colors = [{ name: "Negro", stockCount: 1, images: ["/black.png"] }, { name: "Blanco", stockCount: 2, images: ["/white.png"] }];
  await db.query("insert into products(id,name,slug,price,stock_count,in_stock,colors) values('variant','Actual model','variant',100,3,true,$1::jsonb)", [JSON.stringify(colors)]);
  await assert.rejects(db.exec("update products set stock_count=4 where id='variant'"), /coincidir/);
  await assert.rejects(db.exec(`update products set colors='[{"name":"Negro","stockCount":1},{"name":"Blanco"}]' where id='variant'`), /Asigna/);
});
test("selling the last black unit cannot consume white stock or decrement twice", async () => {
  const result = await record(sale("VTA-black"));
  assert.equal(result.stock.stockCount, 2);
  assert.deepEqual(result.stock.colorStocks, [{ name: "Negro", stockCount: 0 }, { name: "Blanco", stockCount: 2 }]);
  assert.equal(result.sale.selectedColor, "Negro");
  assert.equal((await record(sale("VTA-black"))).replayed, true);
  await assert.rejects(record(sale("VTA-overdraw")), /color seleccionado/);
  const missing = sale("VTA-missing"); delete missing.selectedColor;
  await assert.rejects(record(missing), /color válido/);
  await assert.rejects(record(sale("VTA-invalid", "Verde")), /color válido/);
  assert.equal((await record(sale("VTA-white", "Blanco"))).stock.stockCount, 1);
});
test("link creation needs admin MFA; anonymous readers receive only three allowed fields", async () => {
  await role("authenticated", ordinary);
  await assert.rejects(db.exec("select create_order_tracking_link('VTA-black')"), /MFA/);
  await role("authenticated", owner, "aal1");
  await assert.rejects(db.exec("select create_order_tracking_link('VTA-black')"), /MFA/);
  await role("authenticated");
  firstLink = (await db.query("select create_order_tracking_link('VTA-black') result")).rows[0].result;
  assert.match(firstLink.code, /^[a-f0-9]{64}$/);
  await db.exec("select change_sale_status('VTA-black','prepared')");
  await role("anon", "");
  await assert.rejects(db.exec("select * from order_tracking_links"), /permission denied/);
  assert.equal((await db.query("select get_order_tracking($1) result", ["VTA-black"])).rows[0].result, null);
  assert.deepEqual((await db.query("select get_order_tracking($1) result", [firstLink.code])).rows[0].result, { productName: "Actual model", quantity: 1, status: "prepared" });
});
test("renewal, expiry and deletion revoke access, and backups restore the private link", async () => {
  await role("authenticated");
  const link = (await db.query("select create_order_tracking_link('VTA-black') result")).rows[0].result;
  assert.notEqual(link.code, firstLink.code);
  assert.equal((await db.query("select get_order_tracking($1) result", [firstLink.code])).rows[0].result, null);
  const snapshot = (await db.query("select export_store_backup() result")).rows[0].result;
  validateStoreSnapshot(snapshot);
  assert.equal(snapshot.tables.order_tracking_links.length, 1);
  assert.equal(JSON.stringify(snapshot).includes(link.code), false);
  await role("postgres");
  await db.exec("truncate products,store_settings,sale_operations,order_tracking_links");
  await db.exec(createRecoverySql(snapshot));
  await role("authenticated");
  assert.deepEqual((await db.query("select export_store_backup() result")).rows[0].result.tables, snapshot.tables);
  await role("postgres");
  await db.exec("update order_tracking_links set expires_at=now()-interval '1 second'");
  await role("anon", "");
  assert.equal((await db.query("select get_order_tracking($1) result", [link.code])).rows[0].result, null);
  await role("authenticated");
  await db.exec("select remove_sale_record('VTA-black')");
  assert.equal((await db.query("select get_order_tracking($1) result", [link.code])).rows[0].result, null);
  await role("postgres");
  assert.equal((await db.query("select count(*)::integer n from order_tracking_links")).rows[0].n, 0);
});

test("an older backup cannot restore over an existing private link", async () => {
  await role("postgres");
  await db.exec("truncate products,store_settings,sale_operations,order_tracking_links");
  await db.exec("insert into order_tracking_links values('VTA-orphan',repeat('a',64),now(),now()+interval '1 day')");
  const oldSnapshot = { format: "PulsoTech-operational-backup", version: 1, createdAt: new Date().toISOString(), tables: { products: [], store_settings: [], sale_operations: [], complaints: null } };
  await assert.rejects(db.exec(createRecoverySql(oldSnapshot)), /destino tiene enlaces/);
  await db.exec("rollback");
});
