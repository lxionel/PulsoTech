import test from "node:test";
import assert from "node:assert/strict";
import { buildProductShareData, buildWhatsAppShareUrl } from "../src/lib/product-share.ts";

const product = { id: "100234", slug: "redmi-buds", name: "Redmi Buds" };

test("shared links retain the deployed base path and point to the current product", () => {
  const data = buildProductShareData(product, "https://example.com/PulsoTech/producto/?id=old&utm_source=ad#foto");
  const url = new URL(data.url);
  assert.equal(url.origin, "https://example.com");
  assert.equal(url.pathname, "/PulsoTech/producto/");
  assert.deepEqual([...url.searchParams.entries()], [["id", product.id], ["slug", product.slug]]);
  assert.equal(url.hash, "");
  assert.match(data.title, /Redmi Buds/);
});

test("local links work without a production prefix", () => {
  const url = new URL(buildProductShareData(product, "http://localhost:3000/producto/?slug=old").url);
  assert.equal(url.origin, "http://localhost:3000");
  assert.equal(url.pathname, "/producto/");
  assert.equal(url.searchParams.get("id"), product.id);
});

test("special characters are encoded and products without a slug still have a valid ID link", () => {
  const special = { ...product, id: "sku & 7", slug: "audífonos + diadema" };
  const url = new URL(buildProductShareData(special, "https://example.com/producto/").url);
  assert.equal(url.searchParams.get("id"), special.id);
  assert.equal(url.searchParams.get("slug"), special.slug);
  const noSlug = new URL(buildProductShareData({ ...product, slug: "" }, url.toString()).url);
  assert.equal(noSlug.searchParams.has("slug"), false);
  assert.equal(noSlug.searchParams.get("id"), product.id);
});

test("WhatsApp sharing opens recipient selection with the model and its exact link", () => {
  const data = buildProductShareData(product, "https://example.com/producto/");
  const url = new URL(buildWhatsAppShareUrl(data));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/");
  assert.equal(url.searchParams.get("text"), `${data.text}\n${data.url}`);
});

test("static product links retain their canonical path without adding query identifiers", () => {
  const current = `https://example.com/productos/${encodeURIComponent(product.id)}/?campaign=test#gallery`;
  assert.equal(buildProductShareData(product, current).url, `https://example.com/productos/${encodeURIComponent(product.id)}/`);
});
