import type { Product } from "../types/index.ts";
import { productCommerce, productRequirements, STORE_MODE } from "./commerce.ts";

export const STORE_URL = (process.env.NEXT_PUBLIC_STORE_URL || "https://pulsotech.pages.dev").replace(/\/$/, "");
export function productStructuredData(product: Product) {
  if (STORE_MODE !== "live" || productCommerce(product).status !== "live" || productRequirements(product).length) return null;
  return {
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description,
    sku: product.id, brand: { "@type": "Brand", name: product.brand },
    image: (product.images?.length ? product.images : product.colors.flatMap(color => color.images?.length ? color.images : color.image ? [color.image] : [])).filter(image => !image.startsWith("data:")).map(image => new URL(image, STORE_URL).href),
    offers: { "@type": "Offer", url: `${STORE_URL}/productos/${encodeURIComponent(product.id)}/`, priceCurrency: "PEN", price: product.price,
      availability: product.inStock && product.stockCount > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };
}
export function safeJsonLd(value: unknown): string { return JSON.stringify(value).replace(/</g, "\\u003c"); }
