import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { backupSummary, createRecoverySql, decryptStoreBackup, encryptStoreBackup, validateStoreSnapshot } from "../src/lib/store-backup.ts";

const owner = "11111111-1111-4111-8111-111111111111";
const ordinary = "22222222-2222-4222-8222-222222222222";
const password = "Una clave privada de prueba 123";
const schema = await readFile(new URL("../supabase_schema.sql", import.meta.url), "utf8");
const atomic = await readFile(new URL("../supabase/activate-atomic-sales.sql", import.meta.url), "utf8");
const backups = await readFile(new URL("../supabase/activate-backups.sql", import.meta.url), "utf8");
const complaints = await readFile(new URL("../supabase/activate-complaints.sql", import.meta.url), "utf8");
const source = new PGlite();
const target = new PGlite();
let snapshot, encrypted;
const sale = { id: "VTA-restored", productName: "Modelo", quantity: 2, total: 180, channel: "WhatsApp", customerName: "Cliente O'Hara", date: "2026-10-04", timestamp: 1791090000000, customerPhone: "999888777", notes: "Texto '); drop table products; --", deliveryStatus: "pending" };
async function role(db, name, userId = owner, aal = "aal2") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)", [userId, JSON.stringify({ sub: userId, aal })]);
  await db.exec(`set role ${name}`);
}
async function setup(db) {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key, email text);
    create table auth.mfa_factors(id text primary key,user_id uuid,status text,factor_type text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}')$$;
    grant usage on schema auth to anon,authenticated;
    insert into auth.users values ('${owner}','admin@example.com'),('${ordinary}','ordinary@example.com');
    insert into auth.mfa_factors values ('totp','${owner}','verified','totp');`);
  await db.exec(schema);
  await db.query("insert into public.store_admins(user_id) values ($1)", [owner]);
  await db.exec(atomic);
  await db.exec(backups);
}
before(async () => {
  await setup(source); await setup(target);
  await source.exec("insert into products(id,name,slug,price,stock_count,in_stock) values('audio','Modelo','modelo',90,5,true); insert into store_settings(key,value) values('brands','[\"Xiaomi\"]'),('whatsapp_number','\"51999999999\"'),('internal_secret','\"not-exported\"')");
  await role(source, "authenticated");
  await source.query("select record_sale($1::jsonb,'audio',90)", [JSON.stringify(sale)]);
  snapshot = (await source.query("select export_store_backup() result")).rows[0].result;
  encrypted = await encryptStoreBackup(snapshot, password);
});
after(async () => { await source.close(); await target.close(); });

test("the private snapshot uses database rows, includes exact stock and replay identities, and excludes Auth and unknown settings", () => {
  validateStoreSnapshot(snapshot);
  assert.deepEqual(backupSummary(snapshot), { products: 1, sales: 1, operations: 1, complaints: 0 });
  assert.equal(snapshot.tables.products[0].stock_count, 3);
  assert.equal(snapshot.tables.complaints, null);
  assert.equal(snapshot.tables.sale_operations[0].id, sale.id);
  assert.equal(JSON.stringify(snapshot).includes("not-exported"), false);
  assert.equal(JSON.stringify(snapshot).includes("admin@example.com"), false);
  assert.equal(snapshot.tables.store_settings.find((s) => s.key === "sales_records").value[0].customerName, sale.customerName);
});
test("guests, unrelated accounts and administrators without MFA cannot export private data", async () => {
  for (const [name, userId, aal] of [["anon", "", "aal1"], ["authenticated", ordinary, "aal2"], ["authenticated", owner, "aal1"]]) {
    await role(source, name, userId, aal);
    await assert.rejects(source.exec("select export_store_backup()"), /permission denied|MFA requerido/);
  }
  await role(source, "authenticated");
});
test("encryption hides customer data, decrypts without losing fields, and uses a fresh salt and nonce for each copy", async () => {
  assert.equal(encrypted.includes(sale.customerName), false);
  assert.equal(encrypted.includes(sale.customerPhone), false);
  assert.equal(encrypted.includes(password), false);
  assert.deepEqual(await decryptStoreBackup(encrypted, password), snapshot);
  assert.notEqual(await encryptStoreBackup(snapshot, password), encrypted);
});
test("wrong passwords, corrupted files, unsupported versions and malicious KDF parameters fail before recovery", async () => {
  await assert.rejects(decryptStoreBackup(encrypted, "Contraseña incorrecta 123"), /incorrecta|alterado/);
  const changed = JSON.parse(encrypted);
  changed.payload = (changed.payload[0] === "A" ? "B" : "A") + changed.payload.slice(1);
  await assert.rejects(decryptStoreBackup(JSON.stringify(changed), password), /incorrecta|alterado/);
  await assert.rejects(decryptStoreBackup(JSON.stringify({ ...changed, iterations: 1e15 }), password), /no admitido/);
  await assert.rejects(decryptStoreBackup(JSON.stringify({ ...changed, version: 2 }), password), /no admitido/);
  await assert.rejects(encryptStoreBackup(snapshot, "short"), /12/);
});
test("a recovery drill restores sales and exact inventory without replaying sales or decrementing twice", async () => {
  const decoded = await decryptStoreBackup(encrypted, password);
  await target.exec(createRecoverySql(decoded));
  await role(target, "authenticated");
  const result = (await target.query("select record_sale($1::jsonb,'audio',90) result", [JSON.stringify(sale)])).rows[0].result;
  assert.equal(result.replayed, true);
  assert.equal(result.stock.stockCount, 3);
  assert.equal(result.records.length, 1);
  assert.deepEqual((await target.query("select export_store_backup() result")).rows[0].result.tables, snapshot.tables);
});
test("recovery refuses a populated destination and a modified snapshot rather than replacing active data", async () => {
  await role(target, "postgres");
  await assert.rejects(target.exec(createRecoverySql(snapshot)), /destino debe estar vacío/);
  await target.exec("rollback");
  assert.equal((await target.query("select stock_count from products")).rows[0].stock_count, 3);
  const bad = structuredClone(snapshot);
  bad.tables.products[0].stock_count = -1;
  assert.throws(() => createRecoverySql(bad), /Inventario/);
  bad.tables.products[0].stock_count = 3;
  bad.tables.products[0].executable_column = "malicious";
  assert.throws(() => createRecoverySql(bad), /Registros/);
  const duplicate = structuredClone(snapshot);
  duplicate.tables.sale_operations.push(duplicate.tables.sale_operations[0]);
  assert.throws(() => createRecoverySql(duplicate), /duplicados/);
});
test("installed complaints are included and their identity sequence resumes after recovery", async () => {
  await role(source, "postgres"); await source.exec(complaints);
  await source.exec("insert into complaints(reference,provider,submission) overriding system value values(15,'{\"name\":\"PulsoTech\"}','{\"detail\":\"Reclamo privado\"}')");
  await source.exec(backups); // repeat installation preserves records
  await role(source, "authenticated");
  const current = (await source.query("select export_store_backup() result")).rows[0].result;
  assert.equal(backupSummary(current).complaints, 1);
  const fresh = new PGlite();
  try {
    await setup(fresh); await fresh.exec(complaints);
    await fresh.exec(createRecoverySql(await decryptStoreBackup(await encryptStoreBackup(current, password), password)));
    const next = await fresh.query("insert into complaints(provider,submission) values('{}','{}') returning reference");
    assert.equal(next.rows[0].reference, 16);
  } finally { await fresh.close(); }
});
