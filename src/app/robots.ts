import type { MetadataRoute } from "next";
import { STORE_MODE } from "@/lib/commerce";
import { STORE_URL } from "@/lib/store-seo";

export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", ...(STORE_MODE === "preparation" ? { disallow: "/" } : { allow: "/", disallow: ["/Lionel260606/", "/bolsa/", "/favoritos/", "/producto/"] }) }, sitemap: `${STORE_URL}/sitemap.xml` };
}
