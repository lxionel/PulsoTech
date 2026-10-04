import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { verifyAdminAccess, isPublicSupabaseKey } from "../src/lib/admin-auth.ts";
import { normalizeSalesRecords } from "../src/lib/private-sales.ts";

const require = createRequire(import.meta.url);
let user = null;
let allowed = false;
let assuranceLevel = "aal2";
let options;
let salesValue = [];
let rpcError = null;
let rpcOverride;
const databaseCalls = [];
const client = {
  auth: {
    getUser: async () => ({ data: { user }, error: null }),
    mfa: {
      listFactors: async () => ({ data: { all: [{ id: "totp", factor_type: "totp", status: "verified" }] }, error: null }),
      getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: assuranceLevel, nextLevel: "aal2" }, error: null }),
    },
  },
  rpc: async (name, parameters) => {
    if (name === "is_store_admin" || name === "is_store_admin_account") return { data: allowed, error: null };
    databaseCalls.push(name);
    return { data: rpcOverride ?? (name === "record_sale" ? {
      records: [parameters.p_sale], sale: parameters.p_sale,
      stock: parameters.p_product_id ? { id: parameters.p_product_id, stockCount: 1, inStock: true } : null,
    } : { records: [] }), error: rpcError };
  },
  from: (table) => {
    databaseCalls.push(table);
    let single = false;
    const query = {
      upsert: () => query, delete: () => query, update: () => query,
      eq: () => query, neq: () => query, abortSignal: () => query,
      maybeSingle: () => { single = true; return query; },
      order: () => query, limit: () => query, range: () => query,
      select: () => query,
      in: (_column, keys) => { databaseCalls.push(keys); return query; },
      then: (resolve) => resolve({ data: single ? table === "complaints" ? { id: "test" } : { value: salesValue } : [], error: null }),
    };
    return query;
  },
};
const source = ts.transpileModule(readFileSync(new URL("../src/lib/supabase.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const compiledModule = { exports: {} };
new Function("require", "module", "exports", source)((name) => {
  if (name === "@supabase/supabase-js") return { createClient: (_url, _key, config) => { options = config; return client; } };
  if (name === "./admin-auth") return { verifyAdminAccess, isPublicSupabaseKey };
  if (name === "./private-sales") return { normalizeSalesRecords };
  return require(name);
}, compiledModule, compiledModule.exports);
const api = compiledModule.exports;
const product = { id: "audio", name: "Modelo", price: 90, specs: {}, colors: [] };
const sale = { id: "VTA-test", productName: "Modelo", quantity: 1, total: 90, customerName: "Cliente", channel: "WhatsApp", date: "2026-10-04", timestamp: 1791090000000 };
const salesCommand = { kind: "create", sale, productId: "audio", expectedPrice: 90 };
const protectedOperations = [
  () => api.upsertProductToSupabase(product),
  () => api.deleteProductFromSupabase("audio"),
  () => api.updateStockInSupabase("audio", 1),
  () => api.saveStoreSettingsToSupabase("brands", ["Marca"]),
  () => api.fetchSalesRecordsFromSupabase(),
  () => api.fetchStoreBackup().catch(() => null),
  async () => (await api.executeSalesCommand(salesCommand)).ok,
  async () => (await api.executeSalesCommand({ kind: "status", id: sale.id, status: "shipped" })).ok,
  async () => (await api.executeSalesCommand({ kind: "remove", id: sale.id })).ok,
  async () => (await api.executeSalesCommand({ kind: "clear" })).ok,
  () => api.saveCouponsToSupabase([]),
  () => api.clearAllProductsFromSupabase(),
  () => api.fetchComplaintsForAdmin(),
  () => api.saveComplaintResponse("11111111-1111-4111-8111-111111111111", "answered", "Respuesta registrada"),
];

test("every private read or write stops before contacting tables for guests and non-admin users", async () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  try {
    for (const account of [null, { id: "ordinary", user_metadata: { role: "admin" } }]) {
      user = account;
      allowed = false;
      databaseCalls.length = 0;
      for (const operation of protectedOperations) assert.ok(!(await operation()));
      assert.deepEqual(databaseCalls, []);
    }
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
});

test("an authorized account can reach private operations with a genuine persisted session", async () => {
  user = { id: "administrator" };
  allowed = true;
  databaseCalls.length = 0;
  for (const operation of protectedOperations) assert.ok(await operation());
  assert.equal(databaseCalls.length, protectedOperations.length);
  assert.equal(options.auth.persistSession, true);
  assert.equal(options.auth.autoRefreshToken, true);
  assert.equal(options.auth.storageKey, "pulsotech-admin-auth");
});

test("every private operation blocks a password-only administrator before contacting tables", async () => {
  const originalError = console.error;
  console.error = () => {};
  user = { id: "administrator" };
  allowed = true;
  assuranceLevel = "aal1";
  databaseCalls.length = 0;
  try {
    for (const operation of protectedOperations) assert.ok(!(await operation()));
    assert.deepEqual(databaseCalls, []);
  } finally { assuranceLevel = "aal2"; console.error = originalError; }
});

test("the public settings request cannot fetch sales or other private settings", async () => {
  databaseCalls.length = 0;
  await api.fetchStoreSettingsFromSupabase();
  assert.deepEqual(databaseCalls, ["store_settings", ["brands", "categories", "whatsapp_number"]]);
});

test("a corrupt private sales value is reported as a failed read rather than an empty history", async () => {
  user = { id: "administrator" };
  allowed = true;
  assuranceLevel = "aal2";
  salesValue = {};
  try { assert.equal(await api.fetchSalesRecordsFromSupabase(), null); }
  finally { salesValue = []; }
});

test("missing transactions and definite errors do not fall back to bulk history writes", async () => {
  user = { id: "administrator" }; allowed = true; assuranceLevel = "aal2";
  for (const code of ["PGRST202", "PT409", "42501"]) {
    databaseCalls.length = 0;
    rpcError = { code, message: "Stock insuficiente" };
    try {
      const result = await api.executeSalesCommand(salesCommand);
      assert.equal(result.ok, false);
      assert.equal(result.uncertain, false);
      assert.deepEqual(databaseCalls, ["record_sale"]);
    } finally { rpcError = null; }
  }
});

test("a missing stock receipt cannot be reported as a successful catalog sale", async () => {
  rpcOverride = { records: [sale], sale, stock: null };
  try {
    const result = await api.executeSalesCommand(salesCommand);
    assert.equal(result.ok, false);
    assert.equal(result.uncertain, true);
  } finally { rpcOverride = undefined; }
});

test("a missing backup function or network failure cannot produce a successful or cached export", async () => {
  user = { id: "administrator" }; allowed = true; assuranceLevel = "aal2";
  for (const [code, message] of [["PGRST202", /activate-backups.sql/], ["unexpected", /No se pudo/]]) {
    databaseCalls.length = 0;
    rpcError = { code, message: "Failure" };
    try {
      await assert.rejects(api.fetchStoreBackup(), message);
      assert.deepEqual(databaseCalls, ["export_store_backup"]);
    } finally { rpcError = null; }
  }
});
