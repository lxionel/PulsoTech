import test from "node:test";
import assert from "node:assert/strict";
import { createPrivateSalesStore, normalizeSalesRecords } from "../src/lib/private-sales.ts";
import { parseStoreBackup, restoreBackupLocally } from "../src/lib/content-security.ts";

const sale = { id: "VTA-1001", productName: "Audífono", quantity: 1, total: 80,
  customerName: "Cliente", customerPhone: "999000000", customerAddress: "Dirección privada",
  channel: "WhatsApp", date: "04/10/2026, 00:00", timestamp: 1791090000000 };
const command = { kind: "create", sale, productId: "audio", expectedPrice: 80 };
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

test("a failed history read cannot write sales; an empty confirmed history can be edited", async () => {
  let response = null;
  let writes = 0;
  const store = createPrivateSalesStore({ read: async () => response,
    mutate: async () => { writes++; return { ok: true, records: [sale], sale }; } });
  assert.equal(await store.execute(command), null);
  assert.equal(await store.load(), false);
  assert.equal(await store.execute(command), null);
  assert.equal(writes, 0);
  response = [];
  assert.equal(await store.load(), true);
  assert.equal((await store.execute(command)).ok, true);
  assert.deepEqual(store.getState().records, [sale]);
  assert.equal(writes, 1);
  response = [];
  await store.load();
  assert.deepEqual(store.getState().records, []);
});

test("an uncertain save preserves confirmed records and requires reading the server before retrying", async () => {
  let writes = 0;
  let response = [sale];
  const next = { ...sale, id: "VTA-next" };
  const store = createPrivateSalesStore({ read: async () => response,
    mutate: async () => { writes++; return { ok: false, uncertain: true, message: "No confirmado" }; } });
  await store.load();
  assert.equal(await store.execute({ ...command, sale: next }), null);
  assert.deepEqual(store.getState().records, [sale]);
  assert.equal(store.getState().ready, false);
  assert.equal(await store.execute({ ...command, sale: next }), null);
  assert.equal(writes, 1);
  // The transaction might have committed before the connection lost its response.
  response = [next, sale];
  await store.load();
  assert.deepEqual(store.getState().records, [next, sale]);
});

test("double clicks cannot send duplicate writes and success waits for the transaction receipt", async () => {
  const pending = deferred();
  let writes = 0;
  const store = createPrivateSalesStore({ read: async () => [], mutate: async () => { writes++; return pending.promise; } });
  await store.load();
  const first = store.execute(command);
  assert.equal(store.getState().saving, true);
  assert.deepEqual(store.getState().records, []);
  assert.equal(await store.execute(command), null);
  assert.equal(await store.load(), false);
  assert.equal(writes, 1);
  pending.resolve({ ok: true, records: [sale], sale });
  assert.equal((await first).ok, true);
  assert.deepEqual(store.getState().records, [sale]);
});

test("late private responses cannot repopulate memory or notify listeners after leaving the panel", async () => {
  for (const action of ["read", "write"]) {
    const pending = deferred();
    const store = createPrivateSalesStore({ read: async () => action === "read" ? pending.promise : [sale], mutate: async () => pending.promise });
    let notifications = 0;
    store.subscribe(() => { notifications++; });
    let request;
    if (action === "read") request = store.load();
    else { await store.load(); request = store.execute({ kind: "clear" }); }
    const before = notifications;
    store.dispose();
    pending.resolve(action === "read" ? [sale] : { ok: true, records: [] });
    assert.equal(await request, action === "read" ? false : null);
    assert.deepEqual(store.getState().records, []);
    assert.equal(notifications, before);
  }
});

test("invalid quantities, amounts and server records never become a successful sale or empty history", async () => {
  let writes = 0;
  const store = createPrivateSalesStore({ read: async () => [sale], mutate: async () => { writes++; return { ok: true, records: [sale], sale }; } });
  await store.load();
  for (const invalid of [{ ...sale, quantity: 1.2 }, { ...sale, total: Infinity }, { ...sale, timestamp: Infinity, date: "invalid" }, { ...sale, customerPhone: {} }]) {
    assert.equal(await store.execute({ ...command, sale: invalid }), null);
  }
  assert.equal(writes, 0);
  assert.equal(normalizeSalesRecords([sale])[0].id, "VTA-1001");
  const broken = createPrivateSalesStore({ read: async () => [{}], mutate: async () => ({ ok: true, records: [] }) });
  assert.equal(await broken.load(), false);
  assert.equal(broken.getState().ready, false);
});

test("a definite stock rejection retains the form's editable state and the last confirmed history", async () => {
  const store = createPrivateSalesStore({ read: async () => [sale],
    mutate: async () => ({ ok: false, uncertain: false, message: "No hay stock suficiente" }) });
  await store.load();
  assert.equal(await store.execute(command), null);
  assert.equal(store.getState().ready, true);
  assert.equal(store.getState().saving, false);
  assert.deepEqual(store.getState().records, [sale]);
});

test("targeted changes accept the current server history rather than overwriting orders from another tab", async () => {
  const other = { ...sale, id: "VTA-other-tab" };
  const sent = [];
  const store = createPrivateSalesStore({ read: async () => [sale], mutate: async (action) => {
    sent.push(action);
    return { ok: true, records: [{ ...sale, deliveryStatus: "shipped" }, other] };
  } });
  await store.load();
  await store.execute({ kind: "status", id: sale.id, status: "shipped" });
  assert.deepEqual(sent, [{ kind: "status", id: sale.id, status: "shipped" }]);
  assert.deepEqual(store.getState().records.map((record) => record.id), [sale.id, other.id]);
});

test("restoring a catalog containing private sales never writes customer data to browser storage", () => {
  const backup = parseStoreBackup(JSON.stringify({ products: [], sales: [{ ...sale, date: "2026-10-04T05:00:00Z" }] }));
  const entries = new Map([["pulsotech_sales_records", "old-recovery-copy"]]);
  const writes = [];
  restoreBackupLocally({ getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => { writes.push([key, value]); entries.set(key, value); },
    removeItem: (key) => entries.delete(key) }, backup);
  assert.deepEqual(writes, [["pulsotech_custom_products", "[]"]]);
  assert.equal(entries.get("pulsotech_sales_records"), "old-recovery-copy");
});
