import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { STORE_MODE, isStorefrontProduct } from "@/lib/commerce";
import { STORE_URL } from "@/lib/store-seo";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  if (STORE_MODE !== "live") return [];
  return ["/", "/catalogo/", "/garantia-y-entregas/"].map(path => ({ url: STORE_URL + path })).concat(PRODUCTS.filter(p => isStorefrontProduct(p)).map(p => ({ url: `${STORE_URL}/productos/${encodeURIComponent(p.id)}/` })));
}
