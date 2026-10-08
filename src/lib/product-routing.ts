import type { Product } from "../types/index.ts";
import { isStorefrontProduct } from "./commerce.ts";

function nameSlug(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
}

/** An explicit product ID must never open a different model through its slug. */
export function resolvePublicProduct(products: readonly Product[], id: string | null, slug: string | null): Product | null {
  const visible = products.filter(isStorefrontProduct);
  if (id) return visible.find(product => product.id === id) || null;
  const identifier = slug?.trim().toLowerCase();
  if (!identifier) return null;
  return visible.find(product => product.id.toLowerCase() === identifier
    || product.slug.toLowerCase() === identifier || nameSlug(product.name) === identifier) || null;
}

/** Read legacy product paths without accepting unrelated or malformed URLs. */
export function legacyProductIdentifier(pathname: string): string | null {
  const match = pathname.match(/\/(?:producto|productos)\/([^/?#]+)\/?$/i);
  if (!match) return null;
  try {
    const identifier = decodeURIComponent(match[1]).trim();
    return identifier && !/[\/?#\\]/.test(identifier) ? identifier : null;
  } catch { return null; }
}
