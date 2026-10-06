import type { Product } from "../types/index.ts";

export function catalogPriceCeiling(products: readonly Pick<Product, "price">[]): number {
  const highest = products.reduce((maximum, product) => Number.isFinite(product.price) && product.price >= 0 ? Math.max(maximum, product.price) : maximum, 0);
  return Math.max(5, Math.ceil(highest / 5) * 5);
}

export function matchesBrand(product: Pick<Product, "brand">, brand: string): boolean {
  return brand === "todas" || product.brand?.trim().toLocaleLowerCase() === brand.trim().toLocaleLowerCase();
}

export function sortCatalog(products: readonly Product[], order: "featured" | "price-asc" | "price-desc"): Product[] {
  return [...products].sort((a, b) => order === "price-asc" ? a.price - b.price
    : order === "price-desc" ? b.price - a.price
    : Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
}
