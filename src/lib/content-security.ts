import type { Product, SaleRecord } from "@/types";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const MAX_DATA_IMAGE_LENGTH = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 64;
const BAD_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function safeHttpUrl(value: string): URL | null {
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch { return null; }
}

function imageSignature(bytes: Uint8Array, type: string): boolean {
  const starts = (signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  if (type === "image/png") return starts([137, 80, 78, 71, 13, 10, 26, 10]);
  if (type === "image/jpeg") return starts([255, 216, 255]);
  if (type === "image/gif") return starts([71, 73, 70, 56, 55, 97]) || starts([71, 73, 70, 56, 57, 97]);
  return type === "image/webp" && starts([82, 73, 70, 70]) && [87, 69, 66, 80].every((byte, index) => bytes[index + 8] === byte);
}

/** Images are displayed as media, never as HTML or an arbitrary URL scheme. */
export function isSafeImageSource(value: unknown): value is string {
  if (typeof value !== "string" || !value || value !== value.trim()) return false;
  if (value.startsWith("data:")) {
    if (value.length > MAX_DATA_IMAGE_LENGTH) return false;
    const match = value.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match || match[2].length % 4 !== 0) return false;
    try {
      const length = match[2].length / 4 * 3 - (match[2].endsWith("==") ? 2 : match[2].endsWith("=") ? 1 : 0);
      const header = atob(match[2].slice(0, 16));
      return length <= MAX_IMAGE_BYTES && imageSignature(Uint8Array.from(header, (char) => char.charCodeAt(0)), match[1]);
    } catch { return false; }
  }
  if (value.length > 4096 || /[\u0000-\u001f\u007f\\]/.test(value)) return false;
  if (/^https?:\/\//i.test(value)) return safeHttpUrl(value) !== null;
  // Reject protocol-relative and encoded network paths as well as alternate schemes.
  try {
    const decoded = decodeURIComponent(value);
    return !decoded.startsWith("//") && !/[\u0000-\u001f\u007f\\:]/.test(decoded) && !/^[?#]/.test(decoded);
  } catch { return false; }
}

export function getProductVideoInfo(value?: string): { isYouTube: boolean; embedUrl: string } | null {
  if (!value?.trim()) return null;
  const url = safeHttpUrl(value.trim());
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (["youtu.be", "www.youtu.be"].includes(host)) id = url.pathname.slice(1);
  else if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
    id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:embed|v|shorts)\/([\w-]{11})\/?$/)?.[1] ?? null;
  } else return { isYouTube: false, embedUrl: url.href };
  return id && /^[\w-]{11}$/.test(id)
    ? { isYouTube: true, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` }
    : null;
}

export async function validateImageFile(file: File): Promise<void> {
  if (!IMAGE_TYPES.has(file.type)) throw new Error("Usa una imagen JPG, PNG, WebP o GIF. No se admiten archivos SVG o HTML.");
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error("La imagen debe pesar como máximo 2 MB.");
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!imageSignature(header, file.type)) throw new Error("El contenido del archivo no corresponde al formato de imagen indicado.");
}

export function csvCell(value: string | number): string {
  const text = String(value);
  // Quoting alone does not stop spreadsheet applications from evaluating formulas.
  const safe = /^[\s\u0000-\u001f\uFEFF]*[=+\-@＝＋－＠]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function text(value: unknown, max = 500, required = false): value is string {
  return typeof value === "string" && value.length <= max && (!required || value.trim().length > 0);
}
function number(value: unknown, max = 1e9, integer = false): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max && (!integer || Number.isSafeInteger(value));
}
function strings(value: unknown, maxItems = 100, maxLength = 500): value is string[] {
  return Array.isArray(value) && value.length <= maxItems && value.every((item) => text(item, maxLength));
}

export function validateProductContent(value: unknown): asserts value is Product {
  if (!record(value)) throw new Error("El respaldo contiene un producto con formato inválido.");
  const fields = ["name", "slug", "subtitle", "description", "brand", "category"];
  if (!text(value.id, 80, true) || !/^[\w-]+$/.test(value.id) || fields.some((key) => !text(value[key], key === "description" ? 10000 : 500)) || !text(value.name, 500, true)) {
    throw new Error("Revisa el código, nombre y textos del producto.");
  }
  if (!number(value.price) || !number(value.stockCount, 1e6, true) || typeof value.inStock !== "boolean" || !number(value.rating, 5) || !number(value.reviewsCount, 1e9, true) || (value.originalPrice !== undefined && !number(value.originalPrice))) {
    throw new Error("El precio, stock o valoración del producto no tiene un valor válido.");
  }
  if (["isFeatured", "isNew"].some((key) => value[key] !== undefined && typeof value[key] !== "boolean")) throw new Error("Las opciones del producto tienen un formato inválido.");
  if (!Array.isArray(value.colors) || value.colors.length > 30 || value.colors.some((color) => !record(color) || !text(color.name, 100, true) || !text(color.hex) || !/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color.hex) || (color.image !== "" && !isSafeImageSource(color.image)) || (color.images !== undefined && (!Array.isArray(color.images) || color.images.length > 30 || !color.images.every(isSafeImageSource))))) {
    throw new Error("Revisa los colores y las direcciones de sus imágenes.");
  }
  if (new Set(value.colors.map((color) => color.name.trim().toLocaleLowerCase())).size !== value.colors.length) throw new Error("Cada color debe tener un nombre diferente.");
  if (value.images !== undefined && (!Array.isArray(value.images) || value.images.length > 30 || !value.images.every(isSafeImageSource))) throw new Error("El producto contiene una dirección de imagen no admitida.");
  if (value.videoUrl !== undefined && value.videoUrl !== "" && (!text(value.videoUrl, 4096) || !getProductVideoInfo(value.videoUrl))) throw new Error("El video debe usar una dirección HTTP o HTTPS válida, o un enlace válido de YouTube.");
  if (!record(value.specs) || Object.entries(value.specs).some(([key, spec]) => BAD_KEYS.has(key) || key.length > 100 || (spec !== undefined && !text(spec, 1000)))) throw new Error("Las especificaciones del producto tienen un formato inválido.");
  if (!strings(value.features) || !strings(value.tags)) throw new Error("Las características y etiquetas deben ser listas de texto.");
  if (value.customSpecs !== undefined && (!Array.isArray(value.customSpecs) || value.customSpecs.length > 100 || value.customSpecs.some((spec) => !record(spec) || !text(spec.label, 200) || !text(spec.value, 1000)))) throw new Error("Las especificaciones adicionales tienen un formato inválido.");
  if (value.soundProfile !== undefined && (!record(value.soundProfile) || !text(value.soundProfile.type) || !text(value.soundProfile.description, 2000) || ["bass", "mid", "treble"].some((key) => !number((value.soundProfile as Record<string, unknown>)[key], 100)))) throw new Error("El perfil de sonido tiene un formato inválido.");
}

export interface StoreBackup { products: Product[]; brands?: string[]; categories?: string[]; sales?: SaleRecord[]; }

export function parseStoreBackup(raw: string): StoreBackup {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw new Error("El respaldo debe pesar como máximo 10 MB.");
  const value: unknown = JSON.parse(raw, (key, item: unknown) => {
    if (BAD_KEYS.has(key)) throw new Error("El respaldo contiene propiedades no admitidas.");
    return item;
  });
  if (!record(value) || (value.store !== undefined && value.store !== "PulsoTech") || !Array.isArray(value.products) || value.products.length > 1000) throw new Error("El archivo no tiene el formato de respaldo de PulsoTech o supera los 1000 productos.");
  const ids = new Set<string>();
  for (const product of value.products) {
    validateProductContent(product);
    if (ids.has(product.id)) throw new Error("El respaldo contiene códigos de producto duplicados.");
    ids.add(product.id);
  }
  for (const key of ["brands", "categories"] as const) {
    if (value[key] !== undefined && (!strings(value[key], 200, 100) || (value[key] as string[]).some((item) => !item.trim()))) throw new Error("Las marcas y categorías deben ser listas de nombres válidos.");
  }
  if (value.sales !== undefined && (!Array.isArray(value.sales) || value.sales.length > 10000 || value.sales.some((sale) => !record(sale) || !text(sale.id, 100, true) || !text(sale.productName, 500, true) || !number(sale.quantity, 1e6, true) || sale.quantity === 0 || !number(sale.total) || !text(sale.customerName) || !text(sale.date, 100) || !Number.isFinite(Date.parse(sale.date)) || !number(sale.timestamp, 8.64e15) || !["WhatsApp", "Presencial", "Web"].includes(String(sale.channel)) || ["notes", "paymentMethod", "customerPhone", "customerAddress", "trackingNumber"].some((key) => sale[key] !== undefined && !text(sale[key], 2000)) || (sale.deliveryStatus !== undefined && !["pending", "shipped", "delivered", "cancelled"].includes(String(sale.deliveryStatus)))))) throw new Error("El respaldo contiene registros de venta inválidos.");
  // Only catalogue fields are restored; configuration and authentication are never imported.
  return { products: value.products as Product[], brands: value.brands as string[] | undefined, categories: value.categories as string[] | undefined, sales: value.sales as SaleRecord[] | undefined };
}

export function restoreBackupLocally(storage: Pick<Storage, "getItem" | "setItem" | "removeItem">, backup: StoreBackup): void {
  const changes: [string, string][] = [["pulsotech_custom_products", JSON.stringify(backup.products)]];
  if (backup.brands?.length) changes.push(["pulsotech_custom_brands", JSON.stringify(backup.brands)]);
  if (backup.categories?.length) changes.push(["pulsotech_custom_categories", JSON.stringify(backup.categories)]);
  // A catalog restoration never creates a persistent cache of private customer data.
  const prior = changes.map(([key]) => [key, storage.getItem(key)] as const);
  let written = 0;
  try { for (const [key, value] of changes) { storage.setItem(key, value); written++; } }
  catch {
    // Restore the previous snapshot if the browser rejects any write (for example quota).
    for (const [key] of prior.slice(0, written)) storage.removeItem(key);
    for (const [key, value] of prior.slice(0, written)) { if (value !== null) storage.setItem(key, value); }
    throw new Error("No hay espacio para restaurar el respaldo. Se conservaron los datos anteriores.");
  }
}
