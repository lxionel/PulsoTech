import test from "node:test";
import assert from "node:assert/strict";
import { catalogPriceCeiling, matchesBrand, sortCatalog } from "../src/lib/catalog-filter.ts";

test("the price slider covers the actual catalog, including inexpensive and high priced products", () => {
  assert.equal(catalogPriceCeiling([{ price: 29 }, { price: 1199.9 }]), 1200);
  assert.equal(catalogPriceCeiling([{ price: 1.9 }]), 5);
  assert.equal(catalogPriceCeiling([]), 5);
  assert.equal(catalogPriceCeiling([{ price: NaN }, { price: -1 }, { price: 100 }]), 100);
});

test("a brand filter matches the brand exactly rather than another brand or the product name", () => {
  assert.equal(matchesBrand({ brand: " SONY " }, "sony"), true);
  assert.equal(matchesBrand({ brand: "Sony Ericsson", name: "Sony Headphones" }, "sony"), false);
  assert.equal(matchesBrand({ brand: "Huawei", name: "Compatible con Sony" }, "sony"), false);
  assert.equal(matchesBrand({ brand: "" }, "todas"), true);
});

test("featured and price sorting do not modify the original catalog or shuffle equal matches", () => {
  const products = [{ id: "a", price: 30 }, { id: "b", price: 100, isFeatured: true }, { id: "c", price: 50, isFeatured: true }, { id: "d", price: 30 }];
  assert.deepEqual(sortCatalog(products, "featured").map(p => p.id), ["b", "c", "a", "d"]);
  assert.deepEqual(sortCatalog(products, "price-asc").map(p => p.id), ["a", "d", "c", "b"]);
  assert.deepEqual(sortCatalog(products, "price-desc").map(p => p.id), ["b", "c", "a", "d"]);
  assert.deepEqual(products.map(p => p.id), ["a", "b", "c", "d"]);
});
