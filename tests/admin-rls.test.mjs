import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const ownerId = "11111111-1111-4111-8111-111111111111";
const ordinaryId = "22222222-2222-4222-8222-222222222222";
const migration = await readFile(new URL("../supabase/migrations/20261003_admin_security.sql", import.meta.url), "utf8");
const activation = await readFile(new URL("../supabase/activate-admin.sql", import.meta.url), "utf8");
const mfaActivation = await readFile(new URL("../supabase/activate-mfa.sql", import.meta.url), "utf8");
const mfaMigration = await readFile(new URL("../supabase/migrations/20261004000000_admin_mfa.sql", import.meta.url), "utf8");

async function role(name, userId = "", aal = "aal1") {
  await db.exec("reset role;");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId]);
  await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ sub: userId, aal })]);
  await db.exec(`set role ${name};`);
}

before(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key, email text unique);
    create table auth.mfa_factors(id text primary key, user_id uuid references auth.users, status text, factor_type text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)$$;
    grant usage on schema auth to anon, authenticated;
    create table public.products(id text primary key, name text, price numeric, stock_count integer);
    create table public.store_settings(key text primary key, value jsonb);
    insert into auth.users values ('${ordinaryId}', 'customer@example.com');
    insert into public.products values ('audio', 'Modelo real', 90, 3);
    insert into public.store_settings values ('brands', '["Marca A"]'), ('coupons', '[]'), ('sales_records', '[{"customerName":"Cliente de prueba"}]'), ('private_setting', '"privado"');
    alter table public.products enable row level security;
    create policy unsafe_legacy_access on public.products for all using (true) with check (true);
    grant all on public.products, public.store_settings to anon, authenticated;
  `);
  await db.exec(migration);
});
after(async () => { await db.close(); });

test("activation without the owner's Auth account rolls back without changing data or permissions", async () => {
  await role("postgres");
  const before = (await db.query("select policyname from pg_policies order by policyname")).rows;
  await assert.rejects(db.exec(activation), /Crea primero la cuenta/);
  await db.exec("rollback;");
  assert.deepEqual((await db.query("select policyname from pg_policies order by policyname")).rows, before);
  assert.equal((await db.query("select count(*)::int as count from products")).rows[0].count, 1);
});

test("MFA upgrade without an authorized administrator rolls back all policy and function changes", async () => {
  await role("postgres");
  const before = (await db.query("select policyname from pg_policies order by policyname")).rows;
  await assert.rejects(db.exec(mfaActivation), /Activa primero tu cuenta/);
  await db.exec("rollback;");
  assert.deepEqual((await db.query("select policyname from pg_policies order by policyname")).rows, before);
  assert.equal((await db.query("select to_regprocedure('public.is_store_admin_account()') as function")).rows[0].function, null);
});

test("owner activation is repeatable and preserves existing products and private sales", async () => {
  await role("postgres");
  await db.query("insert into auth.users values ($1, $2)", [ownerId, "lioneldavora1@gmail.com"]);
  await db.exec(activation);
  await db.exec(activation);
  await db.exec(mfaActivation);
  await db.exec(mfaMigration);
  assert.deepEqual((await db.query("select user_id from store_admins")).rows, [{ user_id: ownerId }]);
  assert.equal((await db.query("select count(*)::int as count from products")).rows[0].count, 1);
  assert.equal((await db.query("select count(*)::int as count from store_settings where key='sales_records'")).rows[0].count, 1);
  await db.query("insert into auth.mfa_factors values ('totp', $1, 'verified', 'totp')", [ownerId]);
});

test("anonymous visitors can read the catalog but cannot read sales or write any store data", async () => {
  await role("anon");
  assert.equal((await db.query("select id from products")).rows.length, 1);
  assert.deepEqual((await db.query("select key from store_settings order by key")).rows.map((row) => row.key), ["brands", "coupons"]);
  assert.equal((await db.query("select public.is_store_admin() as allowed")).rows[0].allowed, false);
  for (const sql of ["insert into products values ('forged','Malicioso',1,100)", "update products set price=1", "delete from products", "update store_settings set value='null'", "truncate products"]) {
    await assert.rejects(db.exec(sql), /permission denied/);
  }
});

test("ordinary authenticated accounts cannot read private data, edit products or self-promote", async () => {
  await role("authenticated", ordinaryId);
  assert.equal((await db.query("select public.is_store_admin() as allowed")).rows[0].allowed, false);
  assert.equal((await db.query("select value from store_settings where key='sales_records'")).rows.length, 0);
  assert.equal((await db.query("select user_id from store_admins")).rows.length, 0);
  await assert.rejects(db.exec("insert into products values ('forged','Malicioso',1,100)"), /row-level security/);
  assert.equal((await db.query("update products set price=1 where id='audio' returning id")).rows.length, 0);
  assert.equal((await db.query("delete from products where id='audio' returning id")).rows.length, 0);
  await assert.rejects(db.query("insert into store_admins(user_id) values ($1)", [ordinaryId]), /permission denied/);
  await assert.rejects(db.exec("update store_admins set user_id=auth.uid()"), /permission denied/);
  await assert.rejects(db.exec("insert into store_settings values ('sales_records','[]') on conflict(key) do update set value='[]'"), /row-level security/);
});

test("the authorized administrator can manage inventory and sales but cannot grant browser admin roles", async () => {
  await role("authenticated", ownerId, "aal2");
  assert.equal((await db.query("select public.is_store_admin() as allowed")).rows[0].allowed, true);
  assert.equal((await db.query("select value from store_settings where key='sales_records'")).rows.length, 1);
  assert.equal((await db.query("update products set price=100,stock_count=2 where id='audio' returning price")).rows[0].price, "100");
  await db.exec("insert into products values ('second','Otro modelo',120,1)");
  assert.equal((await db.query("delete from products where id='second' returning id")).rows.length, 1);
  await db.exec("update store_settings set value='[]' where key='sales_records'");
  await assert.rejects(db.query("insert into store_admins(user_id) values ($1)", [ordinaryId]), /permission denied/);
  await assert.rejects(db.exec("truncate products"), /permission denied/);
});

test("direct database calls with only the owner's password cannot read sales or modify inventory", async () => {
  await role("authenticated", ownerId, "aal1");
  assert.equal((await db.query("select public.is_store_admin_account() as member")).rows[0].member, true);
  assert.equal((await db.query("select public.is_store_admin() as allowed")).rows[0].allowed, false);
  assert.equal((await db.query("select value from store_settings where key='sales_records'")).rows.length, 0);
  assert.equal((await db.query("update products set price=1 where id='audio' returning id")).rows.length, 0);
  assert.equal((await db.query("delete from products where id='audio' returning id")).rows.length, 0);
  await assert.rejects(db.exec("insert into products values ('bypass','Intento sin MFA',1,100)"), /row-level security/);
  await assert.rejects(db.exec("insert into store_settings values ('sales_records','[]') on conflict(key) do update set value='[]'"), /row-level security/);
});

test("aal2 for a non-admin and stale aal2 after removing a verified factor both remain denied", async () => {
  await role("authenticated", ordinaryId, "aal2");
  assert.equal((await db.query("select public.is_store_admin() as allowed")).rows[0].allowed, false);
  await role("postgres");
  await db.exec("update auth.mfa_factors set status='unverified' where id='totp'");
  await role("authenticated", ownerId, "aal2");
  assert.equal((await db.query("select public.is_store_admin() as allowed")).rows[0].allowed, false);
  assert.equal((await db.query("select value from store_settings where key='sales_records'")).rows.length, 0);
  assert.equal((await db.query("update products set price=1 returning id")).rows.length, 0);
  await role("postgres");
  await db.exec("delete from auth.mfa_factors where id='totp'");
  await role("authenticated", ownerId, "aal2");
  assert.equal((await db.query("select public.is_store_admin() as allowed")).rows[0].allowed, false);
});

test("revoking a role immediately removes writes and private reads for its existing session", async () => {
  await role("postgres");
  await db.query("delete from public.store_admins where user_id=$1", [ownerId]);
  await role("authenticated", ownerId);
  assert.equal((await db.query("select public.is_store_admin() as allowed")).rows[0].allowed, false);
  assert.equal((await db.query("select value from store_settings where key='sales_records'")).rows.length, 0);
  assert.equal((await db.query("update products set price=1 where id='audio' returning id")).rows.length, 0);
});

test("complaints remain private and only the verified administrator can record a response", async () => {
  await role("postgres");
  await db.exec("create role service_role bypassrls;");
  const sql = await readFile(new URL("../supabase/activate-complaints.sql", import.meta.url), "utf8");
  await db.exec(sql);
  await db.exec("create policy unsafe_legacy_complaint_read on public.complaints for select to authenticated using (true)");
  await db.exec(sql);
  await db.query("insert into public.store_admins(user_id) values ($1) on conflict do nothing", [ownerId]);
  await db.query("insert into auth.mfa_factors values ('totp',$1,'verified','totp')", [ownerId]);
  await role("service_role");
  await db.exec(`insert into complaints(provider, submission) values ('{"name":"Proveedor"}', '{"email":"private@example.com"}')`);
  await role("anon");
  await assert.rejects(db.exec("select * from complaints"), /permission denied/);
  await assert.rejects(db.exec("insert into complaints(provider,submission) values ('{}','{}')"), /permission denied/);
  for (const [id, assurance] of [[ordinaryId, "aal2"], [ownerId, "aal1"]]) {
    await role("authenticated", id, assurance);
    assert.equal((await db.query("select * from complaints")).rows.length, 0);
    assert.equal((await db.query("update complaints set response='forged' returning id")).rows.length, 0);
  }
  await role("authenticated", ownerId, "aal2");
  assert.equal((await db.query("select * from complaints")).rows.length, 1);
  assert.equal((await db.query("update complaints set status='answered',response='Respuesta' returning id")).rows.length, 1);
  await assert.rejects(db.exec("update complaints set submission='{}'"), /permission denied/);
  await assert.rejects(db.exec("delete from complaints"), /permission denied/);
});
