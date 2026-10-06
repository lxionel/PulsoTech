import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { verifyAdminAccess, isPublicSupabaseKey } from "../src/lib/admin-auth.ts";
import { normalizeSalesRecords } from "../src/lib/private-sales.ts";
import { attachCatalogMedia } from "../src/lib/catalog-media.ts";
import { parseCommerceSettings } from "../src/lib/commerce.ts";

const require = createRequire(import.meta.url);
let user = null;
let allowed = false;
let assuranceLevel = "aal2";
let options;
let salesValue = [];
let rpcError = null;
let rpcOverride;
let productWriteRows = [{ id: "audio" }];
let tableError = null;
const tableMutations = [];
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
    let productWrite = false;
    const query = {
      upsert: () => { tableMutations.push("upsert"); return query; },
      insert: () => { tableMutations.push("insert"); return query; },
      delete: () => query,
      update: (value) => { productWrite = table === "products"; tableMutations.push({ update: value }); return query; },
      eq: (field, value) => { tableMutations.push({ eq: [field, value] }); return query; }, neq: () => query, abortSignal: () => query,
      maybeSingle: () => { single = true; return query; },
      order: () => query, limit: () => query, range: () => query,
      select: () => query,
      in: (_column, keys) => { databaseCalls.push(keys); return query; },
      then: (resolve) => resolve({ data: productWrite ? productWriteRows : single ? table === "complaints" ? { id: "test" } : { value: salesValue } : [], error: tableError }),
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
  if (name === "./catalog-media") return { attachCatalogMedia };
  if (name === "./commerce") return { parseCommerceSettings };
  return require(name);
}, compiledModule, compiledModule.exports);
const api = compiledModule.exports;
const product = { id: "audio", name: "Modelo", price: 90, specs: {}, colors: [] };
const sale = { id: "VTA-test", productName: "Modelo", quantity: 1, total: 90, customerName: "Cliente", channel: "WhatsApp", date: "2026-10-04", timestamp: 1791090000000 };
const salesCommand = { kind: "create", sale, productId: "audio", expectedPrice: 90 };
const protectedOperations = [
  () => api.upsertProductToSupabase(product),
  () => api.createProductInSupabase(product),
  () => api.updateProductInSupabase(product),
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
  assert.deepEqual(databaseCalls, ["store_settings", ["brands", "categories", "whatsapp_number", "commerce_settings", "commerce_schema_version"]]);
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

test("new product codes are inserted rather than overwriting an existing product", async () => {
  user = { id: "administrator" }; allowed = true; assuranceLevel = "aal2";
  tableMutations.length = 0;
  assert.equal(await api.createProductInSupabase(product), true);
  assert.deepEqual(tableMutations, ["insert"]);
  tableError = { code: "23505", message: "Duplicate code" };
  try { assert.equal(await api.createProductInSupabase(product), false); }
  finally { tableError = null; }
});

test("editing a deleted product cannot recreate it or report a successful save", async () => {
  productWriteRows = [];
  try { assert.equal(await api.updateProductInSupabase(product), false); }
  finally { productWriteRows = [{ id: "audio" }]; }
});

test("manual stock edits use an expected quantity and fail when a concurrent sale changes it", async () => {
  tableMutations.length = 0;
  assert.equal(await api.updateStockInSupabase("audio", 3, 2), true);
  assert.ok(tableMutations.some((operation) => operation.eq?.[0] === "stock_count" && operation.eq[1] === 2));
  productWriteRows = [];
  try { assert.equal(await api.updateStockInSupabase("audio", 3, 2), false); }
  finally { productWriteRows = [{ id: "audio" }]; }
  tableMutations.length = 0;
  for (const invalid of [-1, 0.5, NaN, 1000001]) assert.equal(await api.updateStockInSupabase("audio", invalid, 2), false);
  assert.deepEqual(tableMutations, []);
});

test("database conversion retains general and color galleries without inventing missing stock or ratings", () => {
  const colors = [{ name: "Negro", hex: "#111", image: "/front.png", images: ["/front.png", "/side.png", "/case.png"] }];
  const original = { ...product, colors, images: ["/general1.png", "/general2.png", "/general3.png"], rating: 0, reviewsCount: 0, stockCount: 0 };
  const decoded = api.dbRowToProduct(api.productToDbRow(original));
  assert.deepEqual(decoded.colors, colors);
  assert.deepEqual(decoded.images, original.images);
  assert.equal(decoded.rating, 0);
  assert.equal(decoded.reviewsCount, 0);
  assert.equal(decoded.soundProfile, undefined);
  assert.equal(api.dbRowToProduct({ id: "missing" }).stockCount, 0);
});

test("renaming a group updates only classification fields and requires MFA", async () => {
  tableMutations.length = 0;
  assert.equal(await api.renameProductGroupInSupabase("brand", ["audio"], "Marca"), true);
  const change = tableMutations.find((operation) => operation.update).update;
  assert.equal(change.brand, "Marca");
  assert.equal("stock_count" in change, false);
  assert.equal("colors" in change, false);
  assuranceLevel = "aal1";
  databaseCalls.length = 0;
  try {
    assert.equal(await api.renameProductGroupInSupabase("category", ["audio"], "Audio"), false);
    assert.deepEqual(databaseCalls, []);
  } finally { assuranceLevel = "aal2"; }
});
