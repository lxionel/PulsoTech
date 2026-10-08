import test from "node:test";
import assert from "node:assert/strict";
import { verifyIsolatedOperations } from "../scripts/lib/operational-drill.mjs";

test("the operational rehearsal connects cart totals to SQL sales, retries, cancellation and last-unit requests", async () => {
  const snapshot = { format: "PulsoTech-operational-backup", version: 1, createdAt: "2026-10-08T20:00:00Z",
    tables: { products: [], store_settings: [], sale_operations: [], complaints: null } };
  const result = await verifyIsolatedOperations(snapshot);
  assert.equal(result.exactTables, true);
  assert.equal(result.checks.length, 10);
  assert.deepEqual(result.counts, { products: 0, sales: 0, operations: 0, complaints: 0 });
  assert.equal(snapshot.tables.products.length, 0);
});
