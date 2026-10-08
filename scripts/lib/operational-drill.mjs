import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { verifyIsolatedRecovery } from "./recovery-drill.mjs";
import { addCartItem, inspectCheckout } from "../../src/lib/cart-stock.ts";
import { salesForAccounting } from "../../src/lib/sales-validation.ts";

/** Exercises application calculations and real SQL transactions only in the restored memory database. */
export function verifyIsolatedOperations(snapshot) {
  return verifyIsolatedRecovery(snapshot, async db => {
    const id = `QA-${randomUUID()}`;
    const ids = [0, 1, 2].map(() => `VTA-${randomUUID()}`);
    const original = (await db.query("select value from store_settings where key='sales_records'")).rows[0]?.value || [];
    await db.query("insert into products(id,name,slug,price,stock_count,in_stock) values($1,'Validación aislada',$1,100,3,true)", [id]);
    const black = { name: "Negro", hex: "#111111", image: "/qa.svg" };
    const product = { id, name: "Validación aislada", price: 100, stockCount: 3, inStock: true, colors: [black] };
    const items = addCartItem([], [product], id, black, 2).items;
    const coupon = { id: "qa", code: "QA10", discountType: "percentage", discountValue: 10, minPurchase: 50, isActive: true };
    const order = inspectCheckout(items, [product], coupon, [coupon]);
    assert.equal(order.issues.size, 0);
    assert.equal(order.total, 180);
    assert.equal(inspectCheckout(items, [product], coupon, [{ ...coupon, isActive: false }]).couponChanged, true);
    assert.equal(inspectCheckout(items, [{ ...product, price: 110 }], coupon, [coupon]).pricesChanged, true);
    const sale = { id: ids[0], productName: product.name, quantity: 2, total: order.total, customerName: "Validación aislada", channel: "WhatsApp", date: "2026-10-08", timestamp: 1791496800000, deliveryStatus: "pending", notes: "Color Negro" };
    const record = async (request, expectedPrice = 100) => (await db.query("select record_sale($1::jsonb,$2,$3::numeric) result", [JSON.stringify(request), id, expectedPrice])).rows[0].result;
    const stock = async () => (await db.query("select stock_count from products where id=$1", [id])).rows[0].stock_count;
    const first = await record(sale);
    assert.equal(first.stock.stockCount, 1);
    assert.equal(first.sale.total, order.total);
    assert.equal((await record(sale)).replayed, true);
    assert.equal(await stock(), 1);
    await assert.rejects(record({ ...sale, id: ids[1] }), /stock suficiente/);
    await assert.rejects(record({ ...sale, id: ids[1], quantity: 1, total: 100 }, 99), /precio cambió/);
    await db.query("select change_sale_status($1,'cancelled')", [sale.id]);
    assert.equal(await stock(), 1); // Cancellation does not imply physical return of the item.
    const cancelled = (await db.query("select value from store_settings where key='sales_records'")).rows[0].value;
    assert.equal(salesForAccounting(cancelled).some(row => row.id === sale.id), false);
    const competing = await Promise.allSettled(ids.slice(1).map(orderId => record({ ...sale, id: orderId, quantity: 1, total: 100 })));
    assert.equal(competing.filter(result => result.status === "fulfilled").length, 1);
    assert.equal(competing.filter(result => result.status === "rejected").length, 1);
    assert.equal(await stock(), 0);
    const history = (await db.query("select value from store_settings where key='sales_records'")).rows[0].value;
    assert.deepEqual(history.filter(row => !ids.includes(row.id)), original);
    return ["bolsa y descuento", "cupón retirado", "precio actualizado", "venta y stock", "reintento sin doble descuento", "stock insuficiente", "precio confirmado por SQL", "cancelación y contabilidad", "dos solicitudes de última unidad", "historial anterior intacto"];
  });
}
