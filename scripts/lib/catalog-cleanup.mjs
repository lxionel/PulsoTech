import fs from "node:fs/promises";
import path from "node:path";

/** Only delete generated photos absent from a successfully prepared current catalog. */
export async function pruneCatalogMedia(directory, catalog) {
  const retained = new Set();
  const retain = (value) => {
    const match = typeof value === "string" && value.match(/^\/catalog-media\/([a-f0-9]{24}\.(?:jpg|jpeg|png|webp|gif))$/);
    if (match) retained.add(match[1]);
  };
  for (const product of catalog) {
    (product.images || []).forEach(retain);
    for (const color of product.colors || []) {
      retain(color.image);
      (color.images || []).forEach(retain);
    }
  }
  let removed = 0;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !/^[a-f0-9]{24}\.(?:jpg|jpeg|png|webp|gif)$/.test(entry.name) || retained.has(entry.name)) continue;
    await fs.unlink(path.join(directory, entry.name));
    removed++;
  }
  return removed;
}
