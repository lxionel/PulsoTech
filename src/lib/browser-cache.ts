import type { CartItem, Product, ProductColor } from "../types/index.ts";
import { validateProductContent } from "./content-security.ts";

// Full galleries belong to Supabase, not repeated in every local catalog and cart entry.
function cacheImage(image: string): string {
  return typeof image === "string" && !/^data:/i.test(image) ? image : "";
}
function cacheColor(color: ProductColor): ProductColor {
  return { ...color, image: cacheImage(color.image), images: color.images?.map(cacheImage).filter(Boolean) };
}
export function productForCache(product: Product): Product {
  return { ...product, colors: product.colors.map(cacheColor), images: product.images?.map(cacheImage).filter(Boolean) };
}
export function cartForCache(items: CartItem[]): CartItem[] {
  return items.map((item) => ({ ...item, product: productForCache(item.product), selectedColor: cacheColor(item.selectedColor) }));
}

/** Old or damaged browser data cannot crash the bag or create duplicate color lines. */
export function restoreCart(value: unknown): CartItem[] {
  if (!Array.isArray(value) || value.length > 200) return [];
  const items = new Map<string, CartItem>();
  for (const item of value) {
    try {
      if (!item || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 1e6) continue;
      validateProductContent(item.product);
      const color = item.selectedColor;
      if (!color || typeof color.name !== "string" || !color.name.trim() || typeof color.hex !== "string" || typeof color.image !== "string") continue;
      const key = JSON.stringify([item.product.id, color.name]);
      const previous = items.get(key);
      const quantity = (previous?.quantity || 0) + item.quantity;
      if (quantity > 1e6) continue;
      items.set(key, { product: productForCache(item.product), selectedColor: cacheColor(color), quantity });
    } catch { /* Keep usable lines when another entry is malformed. */ }
  }
  return [...items.values()];
}

/** One failed optional cache write must not prevent favorites or preferences from persisting. */
export function persistBrowserValues(storage: Pick<Storage, "setItem">, values: [string, string][]): string[] {
  const failed: string[] = [];
  for (const [key, value] of values) {
    try { storage.setItem(key, value); } catch { failed.push(key); }
  }
  return failed;
}
