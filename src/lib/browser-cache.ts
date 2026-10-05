import type { CartItem, Product, ProductColor } from "../types/index.ts";

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

/** One failed optional cache write must not prevent favorites or preferences from persisting. */
export function persistBrowserValues(storage: Pick<Storage, "setItem">, values: [string, string][]): string[] {
  const failed: string[] = [];
  for (const [key, value] of values) {
    try { storage.setItem(key, value); } catch { failed.push(key); }
  }
  return failed;
}
