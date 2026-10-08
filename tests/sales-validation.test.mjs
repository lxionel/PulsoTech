import test from "node:test";
import assert from "node:assert/strict";
import { salesForAccounting, prepareSaleValues, customerWhatsAppNumber } from "../src/lib/sales-validation.ts";

test("customer WhatsApp links add Peru for local numbers and preserve international prefixes", () => {
  assert.equal(customerWhatsAppNumber("902 377 567"), "51902377567");
  assert.equal(customerWhatsAppNumber("+51 (902) 377-567"), "51902377567");
  assert.equal(customerWhatsAppNumber("51902377567"), "51902377567");
  assert.equal(customerWhatsAppNumber("+1 (202) 555-0123"), "12025550123");
  for (const value of ["", "123", "phone: 902377567", "++51902377567", "000000000", "000000000000", "1234567890123456"]) assert.equal(customerWhatsAppNumber(value), null);
});

const input = { quantity: 2, customTotal: "", unitPrice: 19.99, date: "2026-10-06", time: "00:05" };

test("sale amounts follow quantity or an explicit total and retain midnight and historic dates", () => {
  const result = prepareSaleValues(input);
  assert.equal(result.total, 39.98);
  assert.equal(result.date.getHours(), 0);
  assert.equal(result.date.getMinutes(), 5);
  assert.equal(prepareSaleValues({ ...input, customTotal: "35.50" }).total, 35.5);
  assert.equal(prepareSaleValues({ ...input, date: "2024-02-29" }).date.getDate(), 29);
});

test("invalid totals and fractional quantities cannot be silently converted into another sale", () => {
  for (const customTotal of ["-1", "0", "1x", "Infinity", "1000000001", "0.001"]) assert.throws(() => prepareSaleValues({ ...input, customTotal }));
  for (const quantity of [0, -1, 1.5, NaN, Infinity, 1000001]) assert.throws(() => prepareSaleValues({ ...input, quantity }));
});

test("impossible dates and times are rejected rather than rolled into another month or day", () => {
  for (const date of ["", "2026-02-29", "2026-04-31", "2026-13-01", "2026-10-00"]) assert.throws(() => prepareSaleValues({ ...input, date }));
  for (const time of ["", "24:00", "12:60", "invalid"]) assert.throws(() => prepareSaleValues({ ...input, time }));
});

test("cancellation removes revenue and sold units from accounting while preserving the full history", () => {
  const records = [{ id: "pending", total: 100, quantity: 1, deliveryStatus: "pending" }, { id: "delivered", total: 200, quantity: 2, deliveryStatus: "delivered" }, { id: "cancelled", total: 500, quantity: 5, deliveryStatus: "cancelled" }, { id: "legacy", total: 50, quantity: 1 }];
  const active = salesForAccounting(records);
  assert.deepEqual(active.map((sale) => sale.id), ["pending", "delivered", "legacy"]);
  assert.equal(active.reduce((total, sale) => total + sale.total, 0), 350);
  assert.equal(active.reduce((total, sale) => total + sale.quantity, 0), 4);
  assert.equal(records.length, 4);
});
