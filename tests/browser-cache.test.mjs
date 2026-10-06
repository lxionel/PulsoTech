import test from "node:test";
import assert from "node:assert/strict";
import { productForCache, cartForCache, restoreCart, persistBrowserValues } from "../src/lib/browser-cache.ts";
import { inspectCart } from "../src/lib/cart-stock.ts";

const photo = "data:image/png;base64," + "A".repeat(2 * 1024 * 1024);
const product = { id: "100234", name: "Modelo", slug: "modelo", subtitle: "", description: "", price: 100, brand: "Marca", category: "Audio", stockCount: 3, inStock: true, rating: 0, reviewsCount: 0, colors: [{ name: "Negro", hex: "#111", image: photo, images: [photo, "/cover.png"] }], images: [photo, "https://cdn.test/model.png"], specs: {}, tags: [], features: [] };

test("catalog and cart cache do not duplicate megabytes of photo data or mutate the original galleries", () => {
  const cached = productForCache(product);
  assert.ok(JSON.stringify(cached).length < 1000);
  assert.deepEqual(cached.images, ["https://cdn.test/model.png"]);
  assert.deepEqual(cached.colors[0].images, ["/cover.png"]);
  const cart = [{ product, selectedColor: product.colors[0], quantity: 2 }];
  const snapshot = cartForCache(cart);
  assert.ok(JSON.stringify(snapshot).length < 1500);
  assert.equal(snapshot[0].selectedColor.name, "Negro");
  assert.equal(snapshot[0].quantity, 2);
  assert.equal(product.images[0], photo);
  assert.equal(product.colors[0].image, photo);
  const live = inspectCart(snapshot, [product]);
  assert.equal(live.items[0].product.images[0], photo);
  assert.equal(live.items[0].selectedColor.image, photo);
  assert.equal(live.issues.size, 0);
});

test("a failed cache write does not stop independent favorites and preferences from saving", () => {
  const saved = new Map();
  const storage = { setItem: (key, value) => { if (key === "cart") throw Error("quota"); saved.set(key, value); } };
  assert.deepEqual(persistBrowserValues(storage, [["cart", "data"], ["favorites", "[]"], ["phone", "51902377567"]]), ["cart"]);
  assert.deepEqual([...saved], [["favorites", "[]"], ["phone", "51902377567"]]);
});

test("a damaged saved bag preserves valid products and merges duplicate color lines without crashing", () => {
  const model = productForCache(product);
  const line = { product: model, selectedColor: model.colors[0], quantity: 1 };
  const restored = restoreCart([null, {}, { ...line, quantity: -1 }, { ...line, product: { id: "broken" } }, line, { ...line, quantity: 2 }]);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].quantity, 3);
  assert.equal(restored[0].product.id, product.id);
  assert.equal(inspectCart(restored, [product]).issues.size, 0);
  for (const value of [null, "wrong", {}, Array(201).fill(line)]) assert.deepEqual(restoreCart(value), []);
  assert.equal(line.quantity, 1);
});
