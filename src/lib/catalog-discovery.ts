import type { Product } from "../types/index.ts";

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

export function searchSuggestions(products: Product[], query: string, limit = 5): Product[] {
  if (!normalized(query)) return [];
  return products.filter((product) => matchesCatalogSearch(product, query)).sort((a, b) => Number(normalized(b.name).startsWith(normalized(query))) - Number(normalized(a.name).startsWith(normalized(query))) || a.name.localeCompare(b.name)).slice(0, limit);
}

export function matchesCatalogSearch(product: Product, query: string): boolean {
  const terms = normalized(query).split(/\s+/).filter(Boolean);
  const text = normalized([product.id, product.name, product.brand, product.subtitle, product.category, ...(product.tags || [])].join(" "));
  return terms.every((term) => text.includes(term));
}

export function relatedProducts(product: Product, products: Product[], limit = 3): Product[] {
  return products.filter((candidate) => candidate.id !== product.id && normalized(candidate.category) === normalized(product.category))
    .sort((a, b) => Number(b.inStock && b.stockCount > 0) - Number(a.inStock && a.stockCount > 0) || Math.abs(a.price - product.price) - Math.abs(b.price - product.price) || a.id.localeCompare(b.id)).slice(0, limit);
}

export function comparisonDifference(values: string[]): boolean {
  return new Set(values.map(normalized)).size > 1;
}
