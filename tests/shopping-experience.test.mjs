import test from "node:test";
import assert from "node:assert/strict";
import { addCartItem, inspectCart, cartQuantityLimit } from "../src/lib/cart-stock.ts";
import { hasColorStock, colorStockTotal, stockForColor } from "../src/lib/variant-stock.ts";
import { validateProductContent } from "../src/lib/content-security.ts";
import { parseProductFaq, serializeProductFaq } from "../src/lib/product-faq.ts";
import { searchSuggestions, relatedProducts, comparisonDifference } from "../src/lib/catalog-discovery.ts";
import { parseOrderTracking, orderTrackingUrl } from "../src/lib/order-tracking.ts";

const product = { id: "100000", name: "Audífonos Ágiles", slug: "audifonos", subtitle: "", brand: "Marca", category: "Audio", description: "", price: 100, stockCount: 4, inStock: true, rating: 0, reviewsCount: 0, colors: [{ name: "Negro", hex: "#111111", image: "", stockCount: 3 }, { name: "Blanco", hex: "#ffffff", image: "", stockCount: 1 }], specs: {}, features: [], tags: [] };
test("separate color stock caps each variant without consuming another color", () => {
  let items = addCartItem([], [product], product.id, product.colors[0], 9).items;
  assert.equal(items[0].quantity, 3);
  items = addCartItem(items, [product], product.id, product.colors[1], 9).items;
  assert.equal(items[1].quantity, 1);
  assert.equal(cartQuantityLimit(items, [product], product.id, "Blanco"), 1);
  assert.equal(inspectCart(items, [product]).issues.size, 0);
  const changed = { ...product, stockCount: 3, colors: [product.colors[0], { ...product.colors[1], stockCount: 0 }] };
  assert.equal(stockForColor(changed, "Blanco"), 0);
  assert.match(inspectCart(items, [changed]).issues.get(`${product.id}:Blanco`), /0 unidades de Blanco/);
});
test("legacy stock stays shared and invalid variant inventories are rejected", () => {
  const legacy = { ...product, colors: product.colors.map((color) => { const result = { ...color }; delete result.stockCount; return result; }) };
  assert.equal(hasColorStock(legacy), false);
  assert.equal(cartQuantityLimit([{ product: legacy, selectedColor: legacy.colors[0], quantity: 3 }], [legacy], product.id, "Blanco"), 1);
  assert.equal(colorStockTotal(product.colors), 4);
  assert.throws(() => colorStockTotal([{ ...product.colors[0], stockCount: 1.5 }]), /entero/);
  validateProductContent(product);
  assert.throws(() => validateProductContent({ ...product, stockCount: 5 }), /suma/);
  assert.throws(() => validateProductContent({ ...product, colors: [product.colors[0], legacy.colors[1]] }), /suma/);
});
test("search handles accents and words; related models use the category and closest price", () => {
  const products = [product, { ...product, id: "near", price: 110 }, { ...product, id: "far", price: 800 }, { ...product, id: "other", category: "Cargadores", price: 101 }];
  assert.deepEqual(searchSuggestions(products, "agiles marca").map((p) => p.id), products.map((p) => p.id));
  assert.deepEqual(relatedProducts(product, products).map((p) => p.id), ["near", "far"]);
  assert.equal(comparisonDifference(["Con ANC", " con anc "]), false);
  assert.equal(comparisonDifference(["Sin ANC", "Con ANC"]), true);
});
test("questions remain optional and incomplete answers cannot be published", () => {
  assert.deepEqual(parseProductFaq(product), []);
  const rows = [{ question: "¿Qué incluye?", answer: "Contenido confirmado por el administrador." }];
  assert.deepEqual(parseProductFaq({ specs: { storeFaq: serializeProductFaq(rows) } }), rows);
  assert.throws(() => serializeProductFaq([{ question: "¿Compatible?", answer: "" }]), /Completa/);
  assert.deepEqual(parseProductFaq({ specs: { storeFaq: '{"invalid":true}' } }), []);
});
test("private order URLs keep the token out of requests and reject personal data in responses", () => {
  const code = "a".repeat(64);
  const url = new URL(orderTrackingUrl("https://example.com", "/PulsoTech", code));
  assert.equal(url.pathname, "/PulsoTech/pedido/");
  assert.equal(url.search, "");
  assert.equal(url.hash, `#codigo=${code}`);
  assert.throws(() => orderTrackingUrl(url.origin, "", "VTA-123"), /inválido/);
  assert.deepEqual(parseOrderTracking({ productName: "Modelo", quantity: 1, status: "prepared" }), { productName: "Modelo", quantity: 1, status: "prepared" });
  assert.throws(() => parseOrderTracking({ productName: "Modelo", quantity: 1, status: "pending", customerPhone: "private" }));
});
