import test from "node:test";
import assert from "node:assert/strict";
import { legacyProductIdentifier, resolvePublicProduct } from "../src/lib/product-routing.ts";

const visible = { id: "123456", slug: "audifonos-x", name: "Audífonos X", specs: { storeStatus: "live" } };
const hidden = { id: "234567", slug: "oculto", name: "Oculto", specs: { storeStatus: "draft" } };

test("legacy product paths accept IDs and encoded slugs, including the previous base path", () => {
  assert.equal(legacyProductIdentifier("/producto/123456/"), "123456");
  assert.equal(legacyProductIdentifier("/PulsoTech/producto/aud%C3%ADfonos-x/"), "audífonos-x");
  assert.equal(legacyProductIdentifier("/productos/123456/"), "123456");
  for (const path of ["/catalogo/", "/producto/", "/producto/x/otra/", "/producto/%zz/", "/producto/%2Fadmin/", "/producto/%5Cadmin/"]) {
    assert.equal(legacyProductIdentifier(path), null, path);
  }
});

test("an explicit ID opens only that model and never substitutes another through the slug", () => {
  assert.equal(resolvePublicProduct([visible], visible.id, "other"), visible);
  assert.equal(resolvePublicProduct([visible], "removed", visible.slug), null);
});

test("slug-only links remain compatible with IDs, names and accents", () => {
  for (const identifier of ["123456", "AUDIFONOS-X", " audifonos-x "]) {
    assert.equal(resolvePublicProduct([visible], null, identifier), visible);
  }
  assert.equal(resolvePublicProduct([{ ...visible, slug: "different" }], null, "audifonos-x")?.id, visible.id);
});

test("hidden or removed products cannot be revived, and catalog changes immediately invalidate an old match", () => {
  assert.equal(resolvePublicProduct([visible, hidden], hidden.id, hidden.slug), null);
  assert.equal(resolvePublicProduct([hidden], null, hidden.slug), null);
  assert.equal(resolvePublicProduct([visible], null, visible.slug), visible);
  assert.equal(resolvePublicProduct([], null, visible.slug), null);
  assert.equal(resolvePublicProduct([{ ...visible, specs: { storeStatus: "draft" } }], null, visible.slug), null);
});
