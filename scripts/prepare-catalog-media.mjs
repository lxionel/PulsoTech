import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const configSource = await fs.readFile("src/lib/supabase.ts", "utf8");
const source = process.env.NEXT_PUBLIC_SUPABASE_URL || configSource.match(/DEFAULT_SUPABASE_URL = "([^"]+)"/)[1];
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || configSource.match(/DEFAULT_SUPABASE_ANON_KEY = "([^"]+)"/)[1];
const target = path.resolve("public/catalog-media");
await fs.mkdir(target, { recursive: true });
const manifest = { source, entries: [] };
const converted = new Map();
let originalBytes = 0;
let optimizedBytes = 0;

async function optimize(image) {
  if (typeof image !== "string") return "";
  const match = image.match(/^data:image\/(?:png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return image;
  const hash = createHash("sha256").update(image).digest("hex").slice(0, 24);
  if (converted.has(hash)) return converted.get(hash);
  const input = Buffer.from(match[1], "base64");
  const output = await sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const url = `/catalog-media/${hash}.webp`;
  await fs.writeFile(path.join(target, `${hash}.webp`), output);
  converted.set(hash, url);
  originalBytes += input.length;
  optimizedBytes += output.length;
  return url;
}

try {
  // Only anonymous, publicly readable product media is exported. Never use an admin key.
  if (!(key.startsWith("sb_publishable_") || key.split(".").length === 3 && JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "anon")) throw new Error("Public key required");
  const response = await fetch(`${source}/rest/v1/products?select=id,updated_at,images,colors`, { headers: { apikey: key }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("Catalog unavailable");
  const rows = await response.json();
  for (const row of rows) {
    const images = [];
    for (const image of row.images || []) images.push(await optimize(image));
    const colors = [];
    for (const color of row.colors || []) {
      const gallery = [];
      for (const image of color.images || []) gallery.push(await optimize(image));
      colors.push({ ...color, image: await optimize(color.image), ...(color.images !== undefined ? { images: gallery } : {}) });
    }
    manifest.entries.push({ id: String(row.id), updated_at: row.updated_at, images, colors });
  }
  console.log(`Public media: ${manifest.entries.length} products, ${converted.size} unique photos, ${Math.round(originalBytes / 1024)} KB → ${Math.round(optimizedBytes / 1024)} KB.`);
} catch {
  manifest.entries = [];
  console.warn("Public media unavailable during build; the store will use live Supabase photos.");
}
await fs.writeFile(path.join(target, "manifest.json"), JSON.stringify(manifest));
