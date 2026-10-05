import test from "node:test";
import assert from "node:assert/strict";
import { colorImages, productGallery, withColorImages, moveImage } from "../src/lib/product-media.ts";
import { parseStoreBackup } from "../src/lib/content-security.ts";

const black = { name: "Negro", hex: "#18181b", image: "/black-front.png", images: ["/black-front.png", "/black-side.png", "/black-case.png"] };
const white = { name: "Blanco", hex: "#fff", image: "/white-front.png", images: ["/white-front.png", "/white-case.png"] };
const product = { id: "100234", name: "Modelo", slug: "modelo", subtitle: "", description: "", price: 100, brand: "Marca", category: "Audífonos", stockCount: 0, inStock: false, rating: 0, reviewsCount: 0, colors: [black, white], images: ["/box.png", "/contents.png", "/manual.png"], specs: {}, features: [], tags: [] };

test("color galleries never include general photos or pictures belonging to other variants", () => {
  assert.deepEqual(productGallery(product, null, "/empty.svg"), product.images);
  assert.deepEqual(productGallery(product, 0, "/empty.svg"), black.images);
  assert.deepEqual(productGallery(product, 1, "/empty.svg"), white.images);
  assert.deepEqual(productGallery({ ...product, colors: [black, { ...white, image: "", images: [] }] }, 1, "/empty.svg"), ["/empty.svg"]);
  assert.deepEqual(productGallery({ ...product, images: [] }, null, "/empty.svg"), black.images);
});

test("legacy colors keep their photo and removing the last photo does not resurrect it", () => {
  const legacy = { name: "Negro", hex: "#111", image: "/legacy.png" };
  assert.deepEqual(colorImages(legacy), ["/legacy.png"]);
  assert.deepEqual(withColorImages(legacy, []), { ...legacy, image: "", images: [] });
  assert.deepEqual(colorImages({ ...legacy, images: [] }), []);
});

test("moving and removing photos keeps the legacy cover in sync without changing other galleries", () => {
  const reordered = withColorImages(black, moveImage(black.images, 2, 0));
  assert.equal(reordered.image, "/black-case.png");
  assert.deepEqual(reordered.images, ["/black-case.png", "/black-front.png", "/black-side.png"]);
  const removed = withColorImages(reordered, reordered.images.slice(1));
  assert.equal(removed.image, "/black-front.png");
  assert.deepEqual(black.images, ["/black-front.png", "/black-side.png", "/black-case.png"]);
  assert.deepEqual(withColorImages(white, [...white.images, white.images[0]]).images, white.images);
});

test("catalog backups retain all general and per-color photos and validate nested image sources", () => {
  assert.deepEqual(parseStoreBackup(JSON.stringify({ products: [product] })).products[0], product);
  for (const images of [["javascript:alert(1)"], ["data:text/html,test"], new Array(31).fill("/image.png"), "not-an-array"]) {
    assert.throws(() => parseStoreBackup(JSON.stringify({ products: [{ ...product, colors: [{ ...black, images }] }] })), /colores/);
  }
  assert.throws(() => parseStoreBackup(JSON.stringify({ products: [{ ...product, colors: [black, { ...white, name: " negro " }] }] })), /diferente/);
});
