import type { MetadataRoute } from "next";
import { STORE_INDEXABLE } from "@/data/storefront";
import { STORE_URL } from "@/lib/store-seo";

export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", ...(!STORE_INDEXABLE ? { disallow: "/" } : { allow: "/", disallow: ["/Lionel260606/", "/bolsa/", "/favoritos/", "/producto/", "/pedido/"] }) }, sitemap: `${STORE_URL}/sitemap.xml` };
}
