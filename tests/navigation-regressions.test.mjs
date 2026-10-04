import test from "node:test";
import assert from "node:assert/strict";
import { lockBodyScroll } from "../src/lib/body-scroll-lock.ts";
import { isAudioCategory, matchesProductCategory } from "../src/lib/categories.ts";

test("closing filters cannot unlock a page with an open cart", () => {
  const body = { style: { overflow: "auto" } };
  const closeCart = lockBodyScroll(body);
  const closeFilters = lockBodyScroll(body);
  closeFilters();
  assert.equal(body.style.overflow, "hidden");
  closeCart();
  assert.equal(body.style.overflow, "auto");
});

test("switching from favorites to cart restores scroll after the last panel closes", () => {
  const body = { style: { overflow: "" } };
  const closeFavorites = lockBodyScroll(body);
  const closeCart = lockBodyScroll(body);
  closeFavorites();
  assert.equal(body.style.overflow, "hidden");
  closeCart();
  assert.equal(body.style.overflow, "");
});

test("repeated cleanup and reopening do not leave a stale scroll lock", () => {
  const body = { style: { overflow: "scroll" } };
  const close = lockBodyScroll(body);
  close();
  close();
  const closeAgain = lockBodyScroll(body);
  assert.equal(body.style.overflow, "hidden");
  closeAgain();
  assert.equal(body.style.overflow, "scroll");
});

test("audio category URLs work with accents, case and alternate product labels", () => {
  for (const selected of ["audífonos", "audifonos", "AUDÍFONOS", "audio", "auriculares"]) {
    assert.equal(isAudioCategory(selected), true);
    assert.equal(matchesProductCategory("Audífonos Inalámbricos", selected), true);
    assert.equal(matchesProductCategory("Auriculares de diadema", selected), true);
    assert.equal(matchesProductCategory("Smartwatches", selected), false);
  }
});

test("the audio section excludes products without a category", () => {
  assert.equal(matchesProductCategory("", "audífonos"), false);
  assert.equal(matchesProductCategory("", "todos"), true);
});

test("other sections match their products without including arbitrary accessories", () => {
  assert.equal(matchesProductCategory("Smartwatches", "relojes"), true);
  assert.equal(matchesProductCategory("Baterías externas", "cargadores"), true);
  assert.equal(matchesProductCategory("Teclados", "Periféricos PC"), true);
  assert.equal(matchesProductCategory("Accesorios", "cargadores"), false);
  assert.equal(matchesProductCategory("Accesorios", "Periféricos PC"), false);
});
