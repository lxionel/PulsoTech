import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { DEFAULT_COMMERCE_SETTINGS, parseCommerceSettings, commerceRequirements, commerceSpecs, productCommerce, productRequirements, isStorefrontProduct } from "../src/lib/commerce.ts";
import { catalogProduct, exportableRow } from "../scripts/lib/catalog-snapshot.mjs";
import { productStructuredData, safeJsonLd } from "../src/lib/store-seo.ts";

const product = { id: "p1", slug: "modelo", name: "Modelo", brand: "Marca", category: "Audio", description: "Descripción real", price: 100, stockCount: 2, inStock: true,
  colors: [{ name: "Negro", hex: "#000000", image: "https://example.com/real.jpg" }], images: [], specs: {}, features: [], tags: [], rating: 0, reviewsCount: 0 };
const commercial = { visible: true, warranty: "12 meses, defectos de fabricación", included: "Audífonos y cable", delivery: "" };
const ready = { ...product, specs: commerceSpecs(commercial) };
const config = { owner: "Negocio", ruc: "20123456789", address: "Dirección", email: "ventas@example.com", hours: "Lunes a viernes", deliveryArea: "Chimbote", deliveryCost: "Según zona", deliveryTime: "2 días", ordersEnabled: true };

test("one visibility setting preserves existing products and keeps hidden products protected", () => {
  assert.equal(productCommerce(product).visible, true);
  assert.equal(isStorefrontProduct(product), true);
  assert.equal(isStorefrontProduct({ ...product, specs: { storeStatus: "demo" } }), true);
  const hidden = { ...ready, specs: commerceSpecs({ ...commercial, visible: false }) };
  assert.equal(hidden.specs.storeStatus, "draft");
  assert.equal(isStorefrontProduct(hidden), false);
  assert.equal(productStructuredData(hidden, true), null);
  assert.deepEqual(productCommerce(ready), commercial);
  assert.equal(ready.specs.storeVerified, undefined);
  for (const key of ["storeWarranty", "storeIncluded"]) {
    const invalid = { ...ready, specs: { ...ready.specs, [key]: "" } };
    assert.ok(productRequirements(invalid).length);
    assert.equal(isStorefrontProduct(invalid), true);
    assert.equal(productStructuredData(invalid, true), null);
  }
  assert.equal(productStructuredData({ ...ready, price: NaN }, true), null);
  assert.equal(productStructuredData({ ...ready, colors: [], images: [] }, true), null);
});

test("commercial settings reject invented defaults and retain only public business fields", () => {
  assert.ok(commerceRequirements(DEFAULT_COMMERCE_SETTINGS).length >= 6);
  assert.deepEqual(commerceRequirements(parseCommerceSettings(config)), []);
  assert.deepEqual(parseCommerceSettings({ ...config, owner: " Negocio ", privateToken: "secret" }), config);
  assert.equal(parseCommerceSettings({ ordersEnabled: "true" }).ordersEnabled, false);
  assert.ok(commerceRequirements({ ...config, ruc: "123" }).includes("RUC de once dígitos"));
});

test("build snapshot follows visibility and exports no private row fields or data URLs", () => {
  const row = { id: "p1", name: "Modelo", brand: "Marca", category: "Audio", description: "Descripción real", price: 100, colors: product.colors, specs: ready.specs, supplier_cost: 20, private_notes: "secret" };
  assert.equal(exportableRow({ ...row, specs: { ...row.specs, storeStatus: "draft" } }), false);
  assert.equal(exportableRow({ ...row, specs: {} }), true);
  assert.equal(exportableRow(row), true);
  const publicProduct = catalogProduct(row, { colors: product.colors, images: ["/catalog-media/photo.jpg"] });
  assert.equal(publicProduct.supplier_cost, undefined);
  assert.equal(publicProduct.private_notes, undefined);
  assert.deepEqual(publicProduct.images, ["/catalog-media/photo.jpg"]);
});

test("the general order switch works without deployment modes and still checks business identity", () => {
  const module = new URL("../src/lib/commerce.ts", import.meta.url).href;
  const seo = new URL("../src/lib/store-seo.ts", import.meta.url).href;
  const code = `import {canAcceptOrders} from ${JSON.stringify(module)}; import {productStructuredData} from ${JSON.stringify(seo)}; console.log(JSON.stringify([canAcceptOrders(${JSON.stringify(config)}), canAcceptOrders({...${JSON.stringify(config)}, ruc:'20999999999'}), productStructuredData(${JSON.stringify(product)},true), productStructuredData(${JSON.stringify(ready)},true), canAcceptOrders({...${JSON.stringify(config)},ordersEnabled:false}), canAcceptOrders({...${JSON.stringify(config)},email:''})]));`;
  const child = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", code], { encoding: "utf8", env: { ...process.env, NEXT_PUBLIC_STORE_MODE: "preparation", NEXT_PUBLIC_STORE_RUC: config.ruc, NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED: "true" } });
  assert.equal(child.status, 0, child.stderr);
  const [allowed, mismatched, incomplete, schema, paused, missingDetails] = JSON.parse(child.stdout);
  assert.equal(allowed, true);
  assert.equal(mismatched, false);
  assert.equal(incomplete, null);
  assert.equal(paused, false);
  assert.equal(missingDetails, false);
  assert.equal(schema.offers.price, 100);
  assert.equal(schema.aggregateRating, undefined);
  assert.ok(!safeJsonLd({ name: "</script><script>" }).includes("<"));
});
