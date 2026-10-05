import type { ProductColor } from "../types/index.ts";

export interface CatalogMediaManifest {
  source: string;
  entries: { id: string; updated_at: string; images: string[]; colors: ProductColor[] }[];
}

/** Media is reusable only for the exact live version. Prices and stock always come from the live row. */
export function attachCatalogMedia<T extends { id: string | number; updated_at?: string }>(row: T, manifest: CatalogMediaManifest | null, source: string): (T & { images: string[]; colors: ProductColor[] }) | null {
  if (!manifest || manifest.source !== source || !row.updated_at || !Array.isArray(manifest.entries)) return null;
  const media = manifest.entries.find((entry) => entry.id === String(row.id) && entry.updated_at === row.updated_at);
  if (!media || !Array.isArray(media.images) || !Array.isArray(media.colors)) return null;
  return { ...row, images: media.images, colors: media.colors };
}
