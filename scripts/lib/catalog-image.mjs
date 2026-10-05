import sharp from "sharp";

export const CATALOG_IMAGE_VERSION = "full-photo-v2";

/** Keep compact originals intact; large photos retain their proportions and transparency. */
export async function prepareCatalogImage(input) {
  const photo = sharp(input, { limitInputPixels: 40_000_000 });
  const metadata = await photo.metadata();
  const needsResize = Math.max(metadata.width || 0, metadata.height || 0) > 2400;
  const needsRotation = metadata.orientation && metadata.orientation !== 1;
  if (["jpeg", "webp", "gif"].includes(metadata.format) && !needsResize && !needsRotation) {
    return { data: input, extension: metadata.format === "jpeg" ? "jpg" : metadata.format };
  }
  // Animated images keep their frames rather than being flattened into one photo.
  if ((metadata.pages || 1) > 1) return { data: input, extension: metadata.format };
  const data = await photo.rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
  return { data, extension: "webp" };
}
