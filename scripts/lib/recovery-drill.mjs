import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { PGlite } from "@electric-sql/pglite";
import { backupSummary, createRecoverySql, validateStoreSnapshot } from "../../src/lib/store-backup.ts";

/** Restore only into a new, in-memory database. Never opens a remote connection. */
export async function verifyIsolatedRecovery(snapshot, exercise) {
  validateStoreSnapshot(snapshot);
  const db = new PGlite();
  const owner = "11111111-1111-4111-8111-111111111111";
  try {
    await db.exec(`set timezone='UTC';
      create role anon; create role authenticated; create role service_role;
      create schema auth; create table auth.users(id uuid primary key,email text);
      create table auth.mfa_factors(id text primary key,user_id uuid,status text,factor_type text);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}')$$;
      grant usage on schema auth to anon,authenticated;
      insert into auth.users values('${owner}','recovery@example.invalid');
      insert into auth.mfa_factors values('totp','${owner}','verified','totp');`);
    const load = async path => db.exec(await readFile(new URL(`../../${path}`, import.meta.url), "utf8"));
    await load("supabase_schema.sql");
    await db.query("insert into store_admins(user_id) values($1)", [owner]);
    for (const path of ["supabase/activate-atomic-sales.sql", "supabase/activate-backups.sql"]) await load(path);
    if (snapshot.tables.store_settings.some(row => row.key === "commerce_schema_version")) await load("supabase/activate-commerce.sql");
    if (snapshot.tables.complaints !== null) await load("supabase/activate-complaints.sql");
    await db.exec(createRecoverySql(snapshot));
    await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)", [owner, JSON.stringify({ sub: owner, aal: "aal2" })]);
    await db.exec("set role authenticated");
    const restored = (await db.query("select export_store_backup() snapshot")).rows[0].snapshot;
    // PostgreSQL preserves instants, not the offset used to write them. Compare its
    // canonical timestamp representation without losing microsecond precision.
    const expected = structuredClone(snapshot.tables);
    for (const rows of Object.values(expected)) {
      for (const row of rows || []) {
        for (const column of ["created_at", "updated_at", "responded_at"]) {
          if (typeof row[column] === "string") row[column] = (await db.query("select to_jsonb($1::timestamptz) stamp", [row[column]])).rows[0].stamp;
        }
      }
    }
    const ordered = tables => Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name,
      rows === null ? null : [...rows].sort((a, b) => String(a.id ?? a.key).localeCompare(String(b.id ?? b.key))),
    ]));
    if (!isDeepStrictEqual(ordered(restored.tables), ordered(expected))) throw new Error("La recuperación no conserva todos los datos de la copia.");
    const checks = exercise ? await exercise(db) : undefined;
    return { restored: true, exactTables: true, counts: backupSummary(restored), ...(checks ? { checks } : {}) };
  } catch {
    // SQL errors and object diffs can contain private customer data or image bytes.
    throw new Error("No se pudo verificar la recuperación aislada. Los datos de la tienda no se modificaron.");
  } finally {
    await db.close();
  }
}
