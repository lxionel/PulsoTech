import type { Product, ProductColor } from "../types/index.ts";

export function hasColorStock(product: Pick<Product, "colors">): boolean {
  return product.colors.some((color) => color.stockCount !== undefined);
}

export function colorStockTotal(colors: ProductColor[]): number {
  if (!colors.length || colors.some((color) => !Number.isSafeInteger(color.stockCount) || color.stockCount! < 0 || color.stockCount! > 1e6)) {
    throw new Error("Asigna un stock entero entre 0 y 1 000 000 a cada color.");
  }
  const total = colors.reduce((sum, color) => sum + color.stockCount!, 0);
  if (total > 1e6) throw new Error("El stock total no puede superar 1 000 000 unidades.");
  return total;
}

export function stockForColor(product: Product, name?: string | null): number {
  if (!product.inStock || !Number.isSafeInteger(product.stockCount) || product.stockCount < 0) return 0;
  if (!hasColorStock(product) || !name) return product.stockCount;
  const color = product.colors.find((color) => color.name === name);
  return color && Number.isSafeInteger(color.stockCount) && color.stockCount! >= 0 ? Math.min(product.stockCount, color.stockCount!) : 0;
}
