import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const activation = await readFile(new URL("../supabase/activate-complaints.sql", import.meta.url), "utf8");
const verification = await readFile(new URL("../supabase/verify-complaints.sql", import.meta.url), "utf8");
const checks = result => Object.entries(result).filter(([name]) => name !== "policies");

test("installation verification handles an absent table and detects public grants and extra update privileges", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create function public.is_store_admin() returns boolean language sql as $$select false$$");
    const missing = (await db.query(verification)).rows[0];
    assert.equal(missing.table_installed, false);
    assert.equal(checks(missing).every(([, value]) => value === false), true);
    await db.exec(activation);
    const installed = (await db.query(verification)).rows[0];
    assert.equal(checks(installed).every(([, value]) => value === true), true);
    assert.deepEqual(installed.policies.map(policy => policy.name), ["complaints_admin_read", "complaints_admin_reply"]);
    await db.exec("grant select on complaints to public; grant update(submission) on complaints to authenticated; revoke insert on complaints from service_role; revoke usage on complaints_reference_seq from service_role");
    const unsafe = (await db.query(verification)).rows[0];
    assert.equal(unsafe.anonymous_has_no_table_access, false);
    assert.equal(unsafe.authenticated_can_update_only_reply_fields, false);
    assert.equal(unsafe.server_has_table_access, false);
    assert.equal(unsafe.server_has_reference_access, false);
    await db.exec("revoke select on complaints from public; grant select(submission) on complaints to anon");
    assert.equal((await db.query(verification)).rows[0].anonymous_has_no_column_access, false);
    await db.exec(activation);
    assert.equal(checks((await db.query(verification)).rows[0]).every(([, value]) => value === true), true);
  } finally { await db.close(); }
});

test("reinstalling complaints preserves existing submissions, responses and the next reference", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create function public.is_store_admin() returns boolean language sql as $$select false$$");
    await db.exec(activation);
    await db.query("insert into complaints(provider,submission,status,response,responded_at) values($1,$2,'answered','Respuesta conservada','2026-10-08T12:00:00Z')", [{ name: "Proveedor sintético" }, { detail: "Solicitud sintética" }]);
    const before = (await db.query("select * from complaints")).rows;
    await db.exec(activation);
    assert.deepEqual((await db.query("select * from complaints")).rows, before);
    assert.equal((await db.query("insert into complaints(provider,submission) values('{}','{}') returning reference::integer")).rows[0].reference, 2);
  } finally { await db.close(); }
});
