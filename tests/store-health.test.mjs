import test from "node:test";
import assert from "node:assert/strict";
import { checkStoreHealth } from "../scripts/lib/store-health.mjs";

const target = "https://shop.example";
const api = "https://project.supabase.co";
const key = "sb_publishable_test_only";
const product = { id: 12, name: "Auriculares", price: 100, stock_count: 4, in_stock: true };
const manifest = { source: api, entries: [{ id: "12", images: ["/catalog-media/photo.webp"], colors: [] }] };
const json = value => new Response(JSON.stringify(value), { headers: { "content-type": "application/json" } });
function healthy(url) {
  if (url.pathname === "/rest/v1/products") return json([product]);
  if (url.pathname === "/rest/v1/store_settings") return json([{ key: "commerce_schema_version", value: 1 }]);
  if (url.pathname.endsWith("manifest.json")) return json(manifest);
  if (url.pathname.endsWith(".webp")) return new Response("RIFF0000WEBP" + "x".repeat(64), { status: 206, headers: { "content-type": "image/webp" } });
  return new Response("<!doctype html><html><head><title>PulsoTech</title></head><body></body></html>", { headers: { "content-type": "text/html" } });
}
const run = fetchImpl => checkStoreHealth({ target, api, key, fetchImpl, retryDelayMs: 0, timeoutMs: 100 });

test("health reads only public GET resources, segregates keys and samples a local image", async () => {
  const calls = [];
  const report = await run(async (url, init) => {
    calls.push(url);
    assert.equal(init.method, "GET");
    assert.equal(init.redirect, "error");
    assert.equal(init.headers.apikey, url.origin === api ? key : undefined);
    if (url.origin === api) assert.ok(["/rest/v1/products", "/rest/v1/store_settings"].includes(url.pathname));
    if (url.pathname.endsWith(".webp")) assert.equal(init.headers.Range, "bytes=0-63");
    return healthy(url);
  });
  assert.equal(report.ok, true);
  assert.equal(report.imageSampled, true);
  assert.equal(calls.length, 9);
  assert.ok(!JSON.stringify(report).includes(key));
  assert.ok(!JSON.stringify(report).includes(product.name));
});

test("empty catalogs and incomplete prelaunch merchant details are not outages", async () => {
  const report = await run(async url => url.pathname === "/rest/v1/products" ? json([]) : healthy(url));
  assert.equal(report.ok, true);
  assert.equal(report.imageSampled, false);
  assert.equal(report.checks.length, 7);
});

test("HTTP 200 with malformed JSON, wrong schema or HTML fallback is unhealthy", async () => {
  for (const response of [() => new Response("{", { headers: { "content-type": "application/json" } }),
    () => json([{ ...product, price: "100" }]),
    () => new Response("<html>error</html>", { headers: { "content-type": "text/html" } })]) {
    const report = await run(async url => url.pathname === "/rest/v1/products" ? response() : healthy(url));
    assert.equal(report.ok, false);
    assert.equal(report.checks.find(row => row.resource === "productos").attempts, 2);
  }
});

test("a transient failed request is retried once; healthy resources are not retried", async () => {
  let home = 0, products = 0;
  const report = await run(async url => {
    if (url.pathname === "/rest/v1/products") products++;
    if (url.pathname === "/" && ++home === 1) return new Response(null, { status: 503 });
    return healthy(url);
  });
  assert.equal(report.ok, true);
  assert.equal(home, 2);
  assert.equal(products, 1);
});

test("branded HTML is required and redirects cannot produce a healthy page", async () => {
  for (const response of [() => new Response("<html><title>Other store</title></html>", { headers: { "content-type": "text/html" } }),
    () => new Response(null, { status: 302, headers: { location: "https://elsewhere.example" } })]) {
    const report = await run(async url => url.pathname === "/bolsa/" ? response() : healthy(url));
    assert.equal(report.ok, false);
    assert.equal(report.checks.find(row => row.resource === "/bolsa/").attempts, 2);
  }
});

test("wrong-project manifests fail, while a newer live catalog uses its supported fallback", async () => {
  const wrong = await run(async url => url.pathname.endsWith("manifest.json") ? json({ ...manifest, source: "https://other.supabase.co" }) : healthy(url));
  assert.equal(wrong.ok, false);
  const fresh = await run(async url => url.pathname === "/rest/v1/products" ? json([{ ...product, id: 13 }]) : healthy(url));
  assert.equal(fresh.ok, true);
  assert.equal(fresh.imageSampled, false);
});

test("images with a valid content type but invalid bytes fail; external originals are never requested", async () => {
  const bad = await run(async url => url.pathname.endsWith(".webp") ? new Response("not an image", { headers: { "content-type": "image/webp" } }) : healthy(url));
  assert.equal(bad.ok, false);
  const external = await run(async url => {
    assert.ok([target, api].includes(url.origin));
    return url.pathname.endsWith("manifest.json") ? json({ ...manifest, entries: [{ ...manifest.entries[0], images: ["https://outside.example/photo.webp", "/catalog-media/../secret.webp"] }] }) : healthy(url);
  });
  assert.equal(external.ok, true);
  assert.equal(external.imageSampled, false);
});

test("timeouts include stalled response bodies and do not expose exception content", async () => {
  let cancelled = 0;
  const report = await checkStoreHealth({ target, api, key, timeoutMs: 10, retryDelayMs: 0, fetchImpl: async url => {
    if (url.pathname === "/bolsa/") return new Response(new ReadableStream({ start() {}, cancel() { cancelled++; } }), { headers: { "content-type": "text/html" } });
    if (url.pathname === "/favoritos/") throw new Error("private-secret-customer-data");
    return healthy(url);
  } });
  assert.equal(report.ok, false);
  assert.equal(report.checks.find(row => row.resource === "/bolsa/").reason, "timeout");
  assert.equal(cancelled, 2);
  assert.ok(!JSON.stringify(report).includes("private-secret"));
});

test("oversized response bodies are cancelled and rejected", async () => {
  let cancelled = 0;
  const report = await run(async url => url.pathname === "/bolsa/" ? new Response(new ReadableStream({
    pull(controller) { controller.enqueue(new Uint8Array(1024 * 1024)); }, cancel() { cancelled++; },
  }), { headers: { "content-type": "text/html" } }) : healthy(url));
  assert.equal(report.ok, false);
  assert.equal(report.checks.find(row => row.resource === "/bolsa/").reason, "size_limit");
  assert.equal(cancelled, 2);
});

test("service keys and credential-bearing origins are rejected before any network request", async () => {
  for (const config of [{ key: "sb_secret_test" }, { target: "http://shop.example" }, { api: "https://user:password@project.supabase.co" }, { target: "https://shop.example/?token=secret" }]) {
    await assert.rejects(() => checkStoreHealth({ target, api, key, ...config, fetchImpl() { assert.fail("Unexpected network"); } }));
  }
});
