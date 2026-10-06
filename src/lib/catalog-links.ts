import { PRODUCTS } from "@/data/products";

const builtIds = new Set(PRODUCTS.map(product => product.id));
export function productHref(product: { id: string; slug: string }): string {
  return builtIds.has(product.id) ? `/productos/${encodeURIComponent(product.id)}/`
    : `/producto/?${new URLSearchParams({ id: product.id, slug: product.slug })}`;
}
