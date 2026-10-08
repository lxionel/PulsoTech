import type { SaleRecord } from "../types/index.ts";

/** Local nine-digit customer numbers use Peru; international numbers keep their prefix. */
export function customerWhatsAppNumber(value: string): string | null {
  const input = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(input)) return null;
  const digits = input.replace(/\D/g, "");
  if (!input.startsWith("+") && /^[1-9]\d{8}$/.test(digits)) return `51${digits}`;
  return /^[1-9]\d{7,14}$/.test(digits) && (input.startsWith("+") || digits.length >= 10) ? digits : null;
}

export function salesForAccounting(records: SaleRecord[]): SaleRecord[] {
  return records.filter((sale) => sale.deliveryStatus !== "cancelled");
}

export function prepareSaleValues(input: { quantity: number; customTotal: string; unitPrice: number; date: string; time: string }) {
  if (!Number.isSafeInteger(input.quantity) || input.quantity < 1 || input.quantity > 1e6) throw new Error("La cantidad debe ser un número entero mayor que cero.");
  const amount = input.customTotal.trim() ? Number(input.customTotal) : input.unitPrice * input.quantity;
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1e9) throw new Error("Ingresa un total válido mayor que cero.");
  const total = Math.round((amount + Number.EPSILON) * 100) / 100;
  if (total <= 0) throw new Error("El total mínimo es S/ 0.01.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) throw new Error("Revisa la fecha y hora de la venta.");
  const [year, month, day] = input.date.split("-").map(Number);
  const [hours, minutes] = input.time.split(":").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  if (year < 2000 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hours || date.getMinutes() !== minutes) throw new Error("Revisa la fecha y hora de la venta.");
  return { total, date };
}
