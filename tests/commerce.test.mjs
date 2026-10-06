import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { DEFAULT_COMMERCE_SETTINGS, parseCommerceSettings, commerceRequirements, commerceSpecs, productCommerce, productRequirements, isStorefrontProduct } from "../src/lib/commerce.ts";
import { catalogProduct, exportableRow } from "../scripts/lib/catalog-snapshot.mjs";
import { safeJsonLd } from "../src/lib/store-seo.ts";

const product = { id: "p1", slug: "modelo", name: "Modelo", brand: "Marca", category: "Audio", description: "Descripción real", price: 100, stockCount: 2, inStock: true,
  colors: [{ name: "Negro", hex: "#000000", image: "https://example.com/real.jpg" }], images: [], specs: {}, features: [], tags: [], rating: 0, reviewsCount: 0 };
const commercial = { status: "live", warranty: "12 meses, defectos de fabricación", included: "Audífonos y cable", delivery: "", verified: true };
const ready = { ...product, specs: commerceSpecs(commercial) };
const config = { owner: "Negocio", ruc: "20123456789", address: "Dirección", email: "ventas@example.com", hours: "Lunes a viernes", deliveryArea: "Chimbote", deliveryCost: "Según zona", deliveryTime: "2 días", ordersEnabled: true };

test("legacy samples are demo, drafts are hidden and incomplete real products cannot be sold", () => {
  assert.equal(productCommerce(product).status, "demo");
  assert.equal(isStorefrontProduct(product, "preparation"), true);
  assert.equal(isStorefrontProduct(product, "live"), false);
  assert.equal(isStorefrontProduct({ ...ready, specs: { ...ready.specs, storeStatus: "draft" } }, "preparation"), false);
  assert.equal(isStorefrontProduct(ready, "live"), true);
  for (const key of ["storeWarranty", "storeIncluded", "storeVerified"]) {
    const invalid = { ...ready, specs: { ...ready.specs, [key]: "" } };
    assert.ok(productRequirements(invalid).length);
    assert.equal(isStorefrontProduct(invalid, "live"), false);
  }
  assert.equal(isStorefrontProduct({ ...ready, price: NaN }, "live"), false);
  assert.equal(isStorefrontProduct({ ...ready, colors: [], images: [] }, "live"), false);
});

test("commercial settings reject invented defaults and retain only public business fields", () => {
  assert.ok(commerceRequirements(DEFAULT_COMMERCE_SETTINGS).length >= 6);
  assert.deepEqual(commerceRequirements(parseCommerceSettings(config)), []);
  assert.deepEqual(parseCommerceSettings({ ...config, owner: " Negocio ", privateToken: "secret" }), config);
  assert.equal(parseCommerceSettings({ ordersEnabled: "true" }).ordersEnabled, false);
  assert.ok(commerceRequirements({ ...config, ruc: "123" }).includes("RUC de once dígitos"));
});

test("build snapshot excludes drafts and exports no private row fields or data URLs", () => {
  const row = { id: "p1", name: "Modelo", brand: "Marca", category: "Audio", description: "Descripción real", price: 100, colors: product.colors, specs: ready.specs, supplier_cost: 20, private_notes: "secret" };
  assert.equal(exportableRow({ ...row, specs: { ...row.specs, storeStatus: "draft" } }), false);
  assert.equal(exportableRow({ ...row, specs: {} }, true), false);
  assert.equal(exportableRow(row, true), true);
  const publicProduct = catalogProduct(row, { colors: product.colors, images: ["/catalog-media/photo.jpg"] });
  assert.equal(publicProduct.supplier_cost, undefined);
  assert.equal(publicProduct.private_notes, undefined);
  assert.deepEqual(publicProduct.images, ["/catalog-media/photo.jpg"]);
});

test("live ordering requires a complete operation and matching complaint-book identity; demo offers never become structured data", () => {
  const module = new URL("../src/lib/commerce.ts", import.meta.url).href;
  const seo = new URL("../src/lib/store-seo.ts", import.meta.url).href;
  const code = `import {canAcceptOrders} from ${JSON.stringify(module)}; import {productStructuredData} from ${JSON.stringify(seo)}; console.log(JSON.stringify([canAcceptOrders(${JSON.stringify(config)}), canAcceptOrders({...${JSON.stringify(config)}, ruc:'20999999999'}), productStructuredData(${JSON.stringify(product)}), productStructuredData(${JSON.stringify(ready)})]));`;
  const child = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", code], { encoding: "utf8", env: { ...process.env, NEXT_PUBLIC_STORE_MODE: "live", NEXT_PUBLIC_STORE_RUC: config.ruc, NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED: "true" } });
  assert.equal(child.status, 0, child.stderr);
  const [allowed, mismatched, demo, schema] = JSON.parse(child.stdout);
  assert.equal(allowed, true);
  assert.equal(mismatched, false);
  assert.equal(demo, null);
  assert.equal(schema.offers.price, 100);
  assert.equal(schema.aggregateRating, undefined);
  assert.ok(!safeJsonLd({ name: "</script><script>" }).includes("<"));
});
