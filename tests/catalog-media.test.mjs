import test from "node:test";
import assert from "node:assert/strict";
import { attachCatalogMedia } from "../src/lib/catalog-media.ts";

const source = "https://example.supabase.co";
const live = { id: 123, updated_at: "2026-10-04T12:00:00Z", price: 85, stock_count: 2, name: "Auriculares" };
const colors = [{ name: "Negro", hex: "#111111", image: "/catalog-media/black.webp", images: ["/catalog-media/black.webp"] }];
const manifest = { source, entries: [{ id: "123", updated_at: live.updated_at, images: ["/catalog-media/general.webp"], colors }] };

test("optimized photos preserve live price, stock and exact color galleries", () => {
  assert.deepEqual(attachCatalogMedia(live, manifest, source), { ...live, colors, images: ["/catalog-media/general.webp"] });
  assert.equal(attachCatalogMedia({ ...live, price: 99, stock_count: 1 }, manifest, source).price, 99);
});

test("edited, new and deleted products never inherit outdated photos", () => {
  assert.equal(attachCatalogMedia({ ...live, updated_at: "new-version" }, manifest, source), null);
  assert.equal(attachCatalogMedia({ ...live, id: 456 }, manifest, source), null);
  assert.equal(attachCatalogMedia(live, { source, entries: [] }, source), null);
  assert.equal(attachCatalogMedia({ ...live, updated_at: undefined }, manifest, source), null);
});

test("another Supabase project or unavailable media always falls back to live photos", () => {
  assert.equal(attachCatalogMedia(live, manifest, "https://other.supabase.co"), null);
  assert.equal(attachCatalogMedia(live, null, source), null);
});
