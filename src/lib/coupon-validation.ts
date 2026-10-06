import type { Coupon } from "../types/index.ts";

export function validateCoupon(coupon: Omit<Coupon, "id">): void {
  if (!/^[A-Z0-9_-]{1,40}$/i.test(coupon.code.trim())) throw new Error("Usa un código de hasta 40 letras, números, guiones o guiones bajos.");
  if (!["percentage", "fixed"].includes(coupon.discountType) || !Number.isFinite(coupon.discountValue) || coupon.discountValue <= 0 || (coupon.discountType === "percentage" && coupon.discountValue > 100)) throw new Error("El descuento debe ser mayor que cero y no superar el 100% si es porcentual.");
  if (!Number.isFinite(coupon.minPurchase) || coupon.minPurchase < 0) throw new Error("El monto mínimo no puede ser negativo.");
  if (typeof coupon.isActive !== "boolean") throw new Error("El estado del cupón no es válido.");
}

export function parseCoupons(value: unknown): Coupon[] {
  if (!Array.isArray(value) || value.length > 1000) throw new Error("La lista de cupones no es válida.");
  const ids = new Set<string>();
  const codes = new Set<string>();
  return value.map((item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !item.id || typeof item.code !== "string") throw new Error("Cupón inválido.");
    validateCoupon(item);
    const code = item.code.trim().toUpperCase();
    if (ids.has(item.id) || codes.has(code)) throw new Error("Cupones duplicados.");
    ids.add(item.id); codes.add(code);
    return { id: item.id, code, discountType: item.discountType, discountValue: item.discountValue, minPurchase: item.minPurchase, isActive: item.isActive };
  });
}
