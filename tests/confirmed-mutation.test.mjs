import test from "node:test";
import assert from "node:assert/strict";
import { createMutationQueue, confirmMutation } from "../src/lib/confirmed-mutation.ts";
import { validateCoupon } from "../src/lib/coupon-validation.ts";

test("failed cloud writes never commit local state or show a confirmed result", async () => {
  let commits = 0;
  await assert.rejects(confirmMutation(async () => false, () => commits++), /no se confirmaron/);
  await assert.rejects(confirmMutation(async () => { throw Error("offline"); }, () => commits++), /offline/);
  assert.equal(commits, 0);
  await confirmMutation(async () => true, () => commits++);
  assert.equal(commits, 1);
});

test("consecutive stock changes read the last confirmed quantity and continue after a rejected write", async () => {
  const enqueue = createMutationQueue();
  let stock = 2;
  const writes = [];
  const increase = () => enqueue(async () => {
    const next = stock + 1;
    await confirmMutation(async () => { await Promise.resolve(); writes.push(next); return true; }, () => { stock = next; });
  });
  const first = increase();
  const failed = enqueue(() => confirmMutation(async () => false, () => { stock = 100; }));
  const third = increase();
  await first;
  await assert.rejects(failed);
  await third;
  assert.deepEqual(writes, [3, 4]);
  assert.equal(stock, 4);
});

test("invalid coupons cannot silently become discounts or exceed one hundred percent", () => {
  const valid = { code: "PULSO10", discountType: "percentage", discountValue: 10, minPurchase: 0, isActive: true };
  validateCoupon(valid);
  for (const invalid of [{ ...valid, discountValue: 101 }, { ...valid, discountValue: 0 }, { ...valid, discountValue: NaN }, { ...valid, minPurchase: -1 }, { ...valid, code: "invalid code" }]) assert.throws(() => validateCoupon(invalid));
  validateCoupon({ ...valid, discountType: "fixed", discountValue: 150 });
});
