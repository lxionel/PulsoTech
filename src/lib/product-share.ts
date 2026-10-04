export interface ShareableProduct {
  id: string;
  slug: string;
  name: string;
}

export interface ProductShareData {
  title: string;
  text: string;
  url: string;
}

export function buildProductShareData(product: ShareableProduct, currentPage: string): ProductShareData {
  const url = new URL(currentPage);
  // Keep the deployed host and base path; share only the product's identity.
  url.search = "";
  url.hash = "";
  url.searchParams.set("id", product.id);
  if (product.slug) url.searchParams.set("slug", product.slug);
  return {
    title: `${product.name} | PulsoTech`,
    text: `Mira este producto en PulsoTech: ${product.name}`,
    url: url.toString(),
  };
}

export function buildWhatsAppShareUrl(data: ProductShareData): string {
  const url = new URL("https://wa.me/");
  url.searchParams.set("text", `${data.text}\n${data.url}`);
  return url.toString();
}
