import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const owner = "11111111-1111-4111-8111-111111111111";
const ordinary = "22222222-2222-4222-8222-222222222222";
const sql = await readFile(new URL("../supabase/activate-atomic-sales.sql", import.meta.url), "utf8");
const mfa = await readFile(new URL("../supabase/migrations/20261004000000_admin_mfa.sql", import.meta.url), "utf8");
const legacy = { id: "VTA-1001", productName: "Venta anterior", quantity: 1, total: 70,
  customerName: "Cliente anterior", channel: "WhatsApp", date: "2026-10-04", timestamp: 1791090000000 };
const sale = (id, quantity = 1) => ({ ...legacy, id, quantity, productName: "Nombre del navegador", total: 90 * quantity, deliveryStatus: "pending" });
async function role(name, userId = "", aal = "aal1") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [userId]);
  await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub: userId, aal })]);
  await db.exec(`set role ${name}`);
}
async function record(value, product = "audio", expectedPrice = 90) {
  return (await db.query("select public.record_sale($1::jsonb,$2,$3::numeric) as result", [JSON.stringify(value), product, expectedPrice])).rows[0].result;
}
async function history() { return (await db.query("select value from store_settings where key='sales_records'")).rows[0].value; }
async function stock(id = "audio") { return (await db.query("select stock_count, in_stock from products where id=$1", [id])).rows[0]; }

before(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key, email text);
    create table auth.mfa_factors(id text primary key,user_id uuid,status text,factor_type text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}')$$;
    grant usage on schema auth to anon,authenticated;
    create table products(id text primary key,name text,price numeric,stock_count integer,in_stock boolean,updated_at timestamptz);
    create table store_settings(key text primary key,value jsonb,updated_at timestamptz);
    insert into auth.users values ('${owner}','lioneldavora1@gmail.com'),('${ordinary}','customer@example.com');
    create table store_admins(user_id uuid primary key references auth.users(id),created_at timestamptz not null default now());
    insert into store_admins(user_id) values ('${owner}');
    insert into products values ('audio','Nombre real',90,3,true,now()),('other','Otro',90,1,true,now());
  `);
  await db.exec(mfa);
  await db.query("insert into auth.mfa_factors values ('totp',$1,'verified','totp')", [owner]);
  await db.query("insert into store_settings values ('sales_records',$1::jsonb,now())", [JSON.stringify([legacy])]);
  await db.exec(sql);
});
after(async () => { await db.close(); });

test("installation is repeatable, preserves historical sales and stock, and removes permissive policies", async () => {
  await role("postgres");
  await db.exec("create policy unsafe_sales_cache on store_settings for all using(true) with check(true); create policy unsafe_operations on sale_operations for all using(true) with check(true)");
  await db.exec(sql);
  assert.deepEqual(await history(), [legacy]);
  assert.deepEqual(await stock(), { stock_count: 3, in_stock: true });
  assert.equal((await db.query("select count(*)::int n from pg_policies where policyname like 'unsafe%'")).rows[0].n, 0);
});

test("guests, non-admins, password-only admins and stale MFA cannot invoke private transactions", async () => {
  await role("anon");
  await assert.rejects(record(sale("VTA-guest")), /permission denied/);
  for (const [userId, aal] of [[ordinary,"aal2"],[owner,"aal1"]]) {
    await role("authenticated", userId, aal);
    await assert.rejects(record(sale("VTA-denied")), /MFA requerido/);
    for (const call of ["select change_sale_status('VTA-1001','shipped')", "select remove_sale_record('VTA-1001')", "select clear_sale_records()", "select lock_sales_history()", "select * from sale_operations"]) await assert.rejects(db.exec(call), /MFA requerido|permission denied/);
    assert.equal((await db.query("select value from store_settings where key='sales_records'")).rows.length, 0);
  }
  await role("postgres");
  await db.exec("update auth.mfa_factors set status='unverified'");
  await role("authenticated", owner, "aal2");
  await assert.rejects(record(sale("VTA-stale")), /MFA requerido/);
  await role("postgres");
  await db.exec("update auth.mfa_factors set status='verified'");
});

test("even the verified administrator cannot overwrite raw sales or forge idempotency metadata", async () => {
  await role("authenticated", owner, "aal2");
  assert.equal((await db.query("update store_settings set value='[]' where key='sales_records' returning key")).rows.length, 0);
  assert.equal((await db.query("delete from store_settings where key='sales_records' returning key")).rows.length, 0);
  await assert.rejects(db.exec("insert into store_settings values ('sales_records','[]',now()) on conflict(key) do update set value='[]'"), /row-level security/);
  await assert.rejects(db.exec("insert into sale_operations values ('VTA-forged','hash',null,now())"), /permission denied/);
  assert.deepEqual(await history(), [legacy]);
  await db.exec("insert into store_settings values ('brands','[\"Marca\"]',now())");
});

test("confirmed catalog orders decrement stock once and preserve previous records", async () => {
  await role("authenticated", owner, "aal2");
  const request = sale("VTA-order", 2);
  const first = await record(request);
  assert.equal(first.sale.productName, "Nombre real");
  assert.equal(first.records.length, 2);
  assert.deepEqual(first.stock, { id: "audio", stockCount: 1, inStock: true });
  assert.equal(first.replayed, false);
  const replay = await record(request);
  assert.equal(replay.replayed, true);
  assert.deepEqual(await stock(), { stock_count: 1, in_stock: true });
  assert.equal((await history()).filter((item) => item.id === request.id).length, 1);
  await assert.rejects(record({ ...request, quantity: 1 }), /otro registro/);
});

test("invalid inputs, missing products, price changes and insufficient stock leave both records untouched", async () => {
  await role("authenticated", owner, "aal2");
  const prior = await history();
  for (const request of [{ ...sale("VTA-invalid"), quantity: -1 }, { ...sale("VTA-invalid"), quantity: 0.5 }, { ...sale("VTA-invalid"), total: -1 }, { ...sale("VTA-invalid"), total: 1.001 }, { ...sale("VTA-invalid"), total: "90" }, { ...sale("VTA-invalid"), customerPhone: {} }, { ...sale("VTA-invalid"), role: "admin" }]) await assert.rejects(record(request), /válid|datos|campos|cantidad|importe/);
  await assert.rejects(record(sale("VTA-missing"), "missing"), /no está disponible/);
  await assert.rejects(record(sale("VTA-price"), "audio", 89), /precio cambió/);
  await assert.rejects(record(sale("VTA-stock", 2)), /stock suficiente/);
  assert.deepEqual(await history(), prior);
  assert.deepEqual(await stock(), { stock_count: 1, in_stock: true });
});

test("a failure after stock update rolls back the entire transaction, including retry identity", async () => {
  await role("postgres");
  await db.exec(`create function reject_history_write() returns trigger language plpgsql as $$begin raise exception 'simulated history failure'; end$$;
    create trigger reject_history before update on store_settings for each row when(new.key='sales_records') execute function reject_history_write();`);
  await role("authenticated", owner, "aal2");
  const prior = await history();
  await assert.rejects(record(sale("VTA-rollback")), /simulated history failure/);
  assert.deepEqual(await history(), prior);
  assert.deepEqual(await stock(), { stock_count: 1, in_stock: true });
  await role("postgres");
  assert.equal((await db.query("select count(*)::int n from sale_operations where id='VTA-rollback'")).rows[0].n, 0);
  await db.exec("drop trigger reject_history on store_settings; drop function reject_history_write()");
});

test("two submitted orders for the last unit allow only one sale and keep stock at zero", async () => {
  await role("authenticated", owner, "aal2");
  const results = await Promise.allSettled([record(sale("VTA-last-a")), record(sale("VTA-last-b"))]);
  assert.equal(results.filter((item) => item.status === "fulfilled").length, 1);
  assert.equal(results.filter((item) => item.status === "rejected").length, 1);
  assert.deepEqual(await stock(), { stock_count: 0, in_stock: false });
  assert.equal((await history()).filter((item) => item.id.startsWith("VTA-last-")).length, 1);
});

test("manual orders do not affect inventory and targeted status changes retain other orders", async () => {
  await role("authenticated", owner, "aal2");
  const result = await record(sale("VTA-manual"), null, null);
  assert.equal(result.stock, null);
  assert.equal(result.sale.productName, "Nombre del navegador");
  const count = (await history()).length;
  await db.query("select change_sale_status($1,$2)", ["VTA-manual", "delivered"]);
  assert.equal((await history()).find((item) => item.id === "VTA-manual").deliveryStatus, "delivered");
  assert.equal((await history()).length, count);
  await assert.rejects(db.exec("select change_sale_status('VTA-manual','invalid')"), /no es válido/);
  await assert.rejects(db.exec("select change_sale_status('missing','delivered')"), /no existe/);
  assert.deepEqual(await stock(), { stock_count: 0, in_stock: false });
});

test("removing or clearing orders cannot replay an already deducted sale", async () => {
  await role("authenticated", owner, "aal2");
  await db.exec("select remove_sale_record('VTA-order')");
  await assert.rejects(record(sale("VTA-order", 2)), /retirada/);
  await db.exec("select clear_sale_records()");
  assert.deepEqual(await history(), []);
  await assert.rejects(record(sale("VTA-manual"), null, null), /retirada/);
  await assert.rejects(record(legacy, "other", 90), /retirada/);
  assert.deepEqual(await stock(), { stock_count: 0, in_stock: false });
});
