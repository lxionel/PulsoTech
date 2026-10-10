import test from "node:test";
import assert from "node:assert/strict";
import { toggleComparisonSelection, resolveComparisonProducts } from "../src/lib/comparison.ts";

test("comparison selects three models and prevents a fourth selection", () => {
  let ids = toggleComparisonSelection([], "a");
  ids = toggleComparisonSelection(ids, "b");
  assert.deepEqual(ids, ["a", "b"]);
  ids = toggleComparisonSelection(ids, "c");
  assert.deepEqual(ids, ["a", "b", "c"]);
  assert.deepEqual(toggleComparisonSelection(ids, "d"), ids);
});

test("removing a selected model allows a replacement without losing the other", () => {
  const ids = toggleComparisonSelection(["a", "b"], "a");
  assert.deepEqual(toggleComparisonSelection(ids, "c"), ["b", "c"]);
});

test("comparison resolves live stock and price changes while retaining selection order", () => {
  const first = { id: "a", price: 90, stockCount: 2 };
  const second = { id: "b", price: 150, stockCount: 3 };
  const updated = { ...first, price: 85, stockCount: 0 };
  const selected = resolveComparisonProducts(["a", "b"], [second, updated]);
  assert.deepEqual(selected, [updated, second]);
});

test("deleted models do not remain in the comparison or block a new selection", () => {
  const selected = resolveComparisonProducts(["a", "b"], [{ id: "b" }]);
  const ids = selected.map((product) => product.id);
  assert.deepEqual(toggleComparisonSelection(ids, "c"), ["b", "c"]);
});

test("duplicate IDs and empty additions cannot create extra comparison columns", () => {
  assert.deepEqual(toggleComparisonSelection(["a", "a"], "b"), ["a", "b"]);
  assert.deepEqual(toggleComparisonSelection(["a"], ""), ["a"]);
  assert.deepEqual(resolveComparisonProducts(["a", "a", "b"], [{ id: "a" }, { id: "b" }]).map((product) => product.id), ["a", "b"]);
});
