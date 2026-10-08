import test from "node:test";
import assert from "node:assert/strict";
import { verifyIsolatedRecovery } from "../scripts/lib/recovery-drill.mjs";

test("a real-shaped snapshot restores locally, preserving timestamp instants and microseconds", async () => {
  const snapshot = {
    format: "PulsoTech-operational-backup", version: 1, createdAt: "2026-10-08T20:00:00Z",
    tables: {
      products: [{ id: "drill", name: "Modelo", slug: "modelo", price: 100, stock_count: 4, in_stock: true,
        created_at: "2026-10-08T15:00:00.123456-05:00", updated_at: "2026-10-08T21:30:00.123456+01:30" }],
      store_settings: [{ key: "brands", value: ["Marca"], updated_at: "2026-10-08T20:00:00Z" }],
      sale_operations: [], complaints: null,
    },
  };
  // Restore all nullable/default columns exactly as an operational backup exports them.
  const { PGlite } = await import("@electric-sql/pglite");
  const { readFile } = await import("node:fs/promises");
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email text); create table auth.mfa_factors(user_id uuid,status text,factor_type text); create function auth.uid() returns uuid language sql as $$select null::uuid$$; create function auth.jwt() returns jsonb language sql as $$select '{}'::jsonb$$;");
    await db.exec(await readFile(new URL("../supabase_schema.sql", import.meta.url), "utf8"));
    const original = snapshot.tables.products[0];
    await db.query("insert into products(id,name,slug,price,stock_count,in_stock,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,$8)", Object.values(original));
    snapshot.tables.products = (await db.query("select to_jsonb(p) row from products p")).rows.map(r => r.row);
    snapshot.tables.products[0].created_at = original.created_at;
    snapshot.tables.products[0].updated_at = original.updated_at;
  } finally { await db.close(); }
  const before = structuredClone(snapshot);
  assert.deepEqual(await verifyIsolatedRecovery(snapshot), { restored: true, exactTables: true, counts: { products: 1, sales: 0, operations: 0, complaints: 0 } });
  assert.deepEqual(snapshot, before);
});

test("recovery failures do not expose rows in their error messages", async () => {
  const snapshot = { format: "PulsoTech-operational-backup", version: 1, createdAt: "2026-10-08T20:00:00Z",
    tables: { products: [{ id: "x", name: "private-value", price: 100, stock_count: 1, in_stock: true, created_at: "invalid-private-date" }], store_settings: [], sale_operations: [], complaints: null } };
  await assert.rejects(verifyIsolatedRecovery(snapshot), error => !error.message.includes("private") && error.message.includes("aislada"));
});
