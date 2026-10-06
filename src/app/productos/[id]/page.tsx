import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import ProductQueryClient from "@/components/ProductQueryClient";
import { STORE_INDEXABLE } from "@/data/storefront";
import { productStructuredData, safeJsonLd, STORE_URL } from "@/lib/store-seo";

export const dynamicParams = false;
export function generateStaticParams() {
  // A reserved 404 path lets an empty static catalog build without inventing products.
  return PRODUCTS.length ? PRODUCTS.map(product => ({ id: product.id })) : [{ id: "sin-productos" }];
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return { title: "Producto no encontrado | PulsoTech", robots: { index: false } };
  const url = `${STORE_URL}/productos/${encodeURIComponent(id)}/`;
  const image = product.images?.[0] || product.colors[0]?.image;
  return { title: `${product.name} | PulsoTech`, description: product.subtitle || product.description.slice(0, 160),
    alternates: { canonical: url }, robots: { index: STORE_INDEXABLE, follow: STORE_INDEXABLE },
    openGraph: { type: "website", locale: "es_PE", siteName: "PulsoTech", title: product.name, description: product.subtitle || product.description.slice(0, 160), url,
      ...(image && !image.startsWith("data:") ? { images: [{ url: new URL(image, STORE_URL).href, alt: product.name }] } : {}) },
  };
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) notFound();
  const structured = productStructuredData(product, STORE_INDEXABLE);
  return <>{structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structured) }} />}<ProductQueryClient initialId={id} /></>;
}
