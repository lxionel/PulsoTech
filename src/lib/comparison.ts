import type { Product } from "@/types";

export const COMPARISON_LIMIT = 2;

export function toggleComparisonSelection(ids: string[], id: string): string[] {
  const selected = Array.from(new Set(ids)).slice(0, COMPARISON_LIMIT);
  if (selected.includes(id)) return selected.filter((selectedId) => selectedId !== id);
  if (!id || selected.length === COMPARISON_LIMIT) return selected;
  return [...selected, id];
}

export function resolveComparisonProducts(ids: string[], products: Product[]): Product[] {
  return Array.from(new Set(ids)).slice(0, COMPARISON_LIMIT).flatMap((id) => {
    const product = products.find((item) => item.id === id);
    return product ? [product] : [];
  });
}
