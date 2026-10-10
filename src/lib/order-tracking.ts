export const ORDER_STEPS = [
  { status: "pending", label: "Registrado" },
  { status: "prepared", label: "En preparación" },
  { status: "shipped", label: "En camino" },
  { status: "delivered", label: "Entregado" },
] as const;
export interface OrderTracking { productName: string; quantity: number; status: "pending" | "prepared" | "shipped" | "delivered" | "cancelled" }
export function parseOrderTracking(value: unknown): OrderTracking | null {
  if (value === null) return null;
  if (!value || typeof value !== "object") throw new Error("No pudimos comprobar el estado del pedido.");
  const row = value as Record<string, unknown>;
  if (Object.keys(row).some((key) => !["productName", "quantity", "status"].includes(key)) || typeof row.productName !== "string" || row.productName.length > 500 || !Number.isSafeInteger(row.quantity) || Number(row.quantity) < 1 || !["pending", "prepared", "shipped", "delivered", "cancelled"].includes(String(row.status))) throw new Error("No pudimos comprobar el estado del pedido.");
  return row as unknown as OrderTracking;
}
export function orderTrackingUrl(origin: string, basePath: string, code: string): string {
  if (!/^[a-f0-9]{64}$/.test(code)) throw new Error("Enlace de seguimiento inválido.");
  const url = new URL(`${basePath}/pedido/`, origin);
  url.hash = `codigo=${code}`;
  return url.href;
}
