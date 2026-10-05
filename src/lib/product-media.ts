import type { Product, ProductColor } from "../types/index.ts";

export const MAX_GALLERY_IMAGES = 30;

export function uniqueImages(images: string[]): string[] {
  return [...new Set(images.filter((image) => typeof image === "string" && image.trim()))];
}

/** Legacy single-photo colors remain readable. An explicit gallery owns its order. */
export function colorImages(color?: ProductColor): string[] {
  if (!color) return [];
  return color.images !== undefined ? uniqueImages(color.images) : uniqueImages([color.image]);
}

export function withColorImages(color: ProductColor, images: string[]): ProductColor {
  const gallery = uniqueImages(images);
  return { ...color, images: gallery, image: gallery[0] || "" };
}

export function productGallery(product: Pick<Product, "images" | "colors">, colorIndex: number | null, placeholder: string): string[] {
  const images = colorIndex === null ? uniqueImages(product.images || []) : colorImages(product.colors[colorIndex]);
  // General photos may fall back to the first variant; a chosen color never falls back to another one.
  if (images.length) return images;
  if (colorIndex === null) {
    const first = colorImages(product.colors[0]);
    if (first.length) return first;
  }
  return [placeholder];
}

export function moveImage(images: string[], from: number, to: number): string[] {
  if (from < 0 || to < 0 || from >= images.length || to >= images.length) return images;
  const next = [...images];
  const [image] = next.splice(from, 1);
  next.splice(to, 0, image);
  return next;
}
