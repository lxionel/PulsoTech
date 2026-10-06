import test from "node:test";
import assert from "node:assert/strict";
import { availableStock, addCartItem, setCartQuantity, inspectCart, inspectCheckout, cartQuantityLimit, cartTotals } from "../src/lib/cart-stock.ts";

const black = { name: "Negro", hex: "#111", image: "/black.svg" };
const white = { name: "Blanco", hex: "#fff", image: "/white.svg" };
const product = { id: "audio", name: "Audífono A", stockCount: 3, inStock: true, price: 90, colors: [black, white] };
const line = (color, quantity, model = product) => ({ product: model, selectedColor: color, quantity });

test("adding different colors shares the model stock and preserves existing lines", () => {
  const original = [line(black, 2)];
  const result = addCartItem(original, [product], product.id, white, 2);
  assert.deepEqual(result.items.map((item) => item.quantity), [2, 1]);
  assert.match(result.notice, /Se añadieron 1/);
  assert.equal(original.length, 1);
  assert.equal(original[0].quantity, 2);
  const full = addCartItem(result.items, [product], product.id, black, 1);
  assert.equal(full.items, result.items);
  assert.match(full.notice, /todas las unidades/);
});

test("repeated additions respect the current cart and do not mutate prior state", () => {
  const first = addCartItem([], [product], product.id, black, 2);
  const second = addCartItem(first.items, [product], product.id, black, 2);
  assert.equal(first.items[0].quantity, 2);
  assert.equal(second.items[0].quantity, 3);
});

test("quantity changes account for other colors, cap increases and support removal", () => {
  const items = [line(black, 1), line(white, 1)];
  assert.equal(cartQuantityLimit(items, [product], product.id, black.name), 2);
  const increased = setCartQuantity(items, [product], product.id, black.name, 20);
  assert.equal(increased.items[0].quantity, 2);
  assert.match(increased.notice, /se ajustó a 2/);
  const removed = setCartQuantity(increased.items, [product], product.id, white.name, 0);
  assert.equal(removed.items.length, 1);
});

test("invalid quantities and stock values cannot create purchasable units", () => {
  for (const quantity of [0, -1, 1.5, NaN, Infinity]) {
    assert.equal(addCartItem([], [product], product.id, black, quantity).items.length, 0);
  }
  for (const quantity of [-1, 1.5, NaN, Infinity]) {
    const items = [line(black, 1)];
    assert.equal(setCartQuantity(items, [product], product.id, black.name, quantity).items, items);
  }
  for (const stockCount of [-1, NaN, Infinity, undefined]) assert.equal(availableStock({ ...product, stockCount }), 0);
  assert.equal(availableStock({ ...product, inStock: false }), 0);
});

test("restored carts use live prices and detect stock reductions across colors", () => {
  const original = [line(black, 2), line(white, 1)];
  const live = { ...product, price: 100, stockCount: 2 };
  const checked = inspectCart(original, [live]);
  assert.equal(checked.pricesChanged, true);
  assert.equal(checked.items[0].product.price, 100);
  assert.equal(checked.issues.size, 2);
  assert.equal(original[0].product.price, 90);
  assert.equal(checked.items[0].quantity, 2);
  assert.match(checked.issues.get("audio:Blanco"), /entre todos los colores/);
});

test("removed models, removed colors and out of stock models block checkout", () => {
  const items = [line(white, 1)];
  assert.match(inspectCart(items, []).issues.get("audio:Blanco"), /ya no está disponible/);
  assert.match(inspectCart(items, [{ ...product, colors: [black] }]).issues.get("audio:Blanco"), /color/);
  assert.match(inspectCart(items, [{ ...product, stockCount: 0 }]).issues.get("audio:Blanco"), /agotado/);
  assert.match(inspectCart(items, [{ ...product, inStock: false }]).issues.get("audio:Blanco"), /agotado/);
  assert.equal(addCartItem([], [], product.id, black, 1).items.length, 0);
  assert.equal(addCartItem([], [{ ...product, colors: [black] }], product.id, white, 1).items.length, 0);
});

test("a corrected cart validates with current totals and coupon thresholds", () => {
  const items = inspectCart([line(black, 2)], [{ ...product, price: 100, stockCount: 2 }]).items;
  assert.equal(inspectCart(items, [items[0].product]).issues.size, 0);
  assert.equal(inspectCart(items, [items[0].product]).pricesChanged, false);
  const coupon = { isActive: true, minPurchase: 200, discountType: "percentage", discountValue: 10 };
  assert.deepEqual(cartTotals(items, coupon), { subtotal: 200, discountAmount: 20, total: 180 });
  assert.equal(cartTotals([line(black, 1)], coupon).discountAmount, 0);
  assert.equal(cartTotals(items, { ...coupon, isActive: false }).discountAmount, 0);
  assert.equal(cartTotals(items, { ...coupon, discountType: "fixed", discountValue: 500 }).total, 0);
});

test("checkout checks fresh coupon terms and requires a review when the offer changed or was withdrawn", () => {
  const items = [line(black, 2)];
  const coupon = { id: "discount", code: "OFERTA", isActive: true, minPurchase: 100, discountType: "percentage", discountValue: 10 };
  const unchanged = inspectCheckout(items, [product], coupon, [coupon]);
  assert.equal(unchanged.couponChanged, false);
  assert.equal(unchanged.total, 162);
  for (const replacement of [[], [{ ...coupon, isActive: false }], [{ ...coupon, code: "OTRO" }]]) {
    const checked = inspectCheckout(items, [product], coupon, replacement);
    assert.equal(checked.couponChanged, true);
    assert.equal(checked.coupon, null);
    assert.equal(checked.total, 180);
  }
  const reduced = inspectCheckout(items, [product], coupon, [{ ...coupon, discountValue: 5 }]);
  assert.equal(reduced.couponChanged, true);
  assert.equal(reduced.total, 171);
  const threshold = inspectCheckout(items, [product], coupon, [{ ...coupon, minPurchase: 200 }]);
  assert.equal(threshold.couponChanged, true);
  assert.equal(threshold.discountAmount, 0);
  assert.equal(inspectCheckout(reduced.items, [product], reduced.coupon, [reduced.coupon]).couponChanged, false);
});

test("amounts use whole cents so discounted totals agree with the displayed amounts", () => {
  const items = [line(black, 3, { ...product, price: 0.1 })];
  const coupon = { isActive: true, minPurchase: 0, discountType: "percentage", discountValue: 15 };
  assert.deepEqual(cartTotals(items, coupon), { subtotal: 0.3, discountAmount: 0.05, total: 0.25 });
  assert.deepEqual(cartTotals([line(black, 3, { ...product, price: 19.99 })], coupon), { subtotal: 59.97, discountAmount: 9, total: 50.97 });
  for (const price of [NaN, Infinity, -10, 0]) assert.equal(inspectCart([line(black, 1)], [{ ...product, price }]).issues.size, 1);
});
