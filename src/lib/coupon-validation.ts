import type { Coupon } from "../types/index.ts";

export function validateCoupon(coupon: Omit<Coupon, "id">): void {
  if (!/^[A-Z0-9_-]{1,40}$/i.test(coupon.code.trim())) throw new Error("Usa un código de hasta 40 letras, números, guiones o guiones bajos.");
  if (!["percentage", "fixed"].includes(coupon.discountType) || !Number.isFinite(coupon.discountValue) || coupon.discountValue <= 0 || (coupon.discountType === "percentage" && coupon.discountValue > 100)) throw new Error("El descuento debe ser mayor que cero y no superar el 100% si es porcentual.");
  if (!Number.isFinite(coupon.minPurchase) || coupon.minPurchase < 0) throw new Error("El monto mínimo no puede ser negativo.");
}
