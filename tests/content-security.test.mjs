import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { MAX_BACKUP_BYTES, MAX_IMAGE_BYTES, isSafeImageSource, getProductVideoInfo, validateImageFile, csvCell, parseStoreBackup, restoreBackupLocally } from "../src/lib/content-security.ts";

const product = {
  id: "100123", name: "Modelo de prueba", slug: "modelo", subtitle: "", description: "",
  price: 100, brand: "Marca", category: "Audífonos", inStock: true, stockCount: 2,
  rating: 0, reviewsCount: 0, colors: [{ name: "Negro", hex: "#111", image: "/images/modelo.png" }],
  specs: { audioType: "earbuds", ancEnabled: "no" }, features: [], tags: [],
};
const backup = (model = product) => JSON.stringify({ store: "PulsoTech", products: [model], brands: ["Marca"], categories: ["Audífonos"] });
const pngHeader = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);

test("media URLs reject executable schemes, disguised network paths and credentials", () => {
  for (const unsafe of ["javascript:alert(1)", "data:text/html;base64,PHNjcmlwdD4=", "data:image/svg+xml,<svg/>", "//host.test/image.png", "/%2fhost.test/image.png", "\\host.test\\a.png", "https://u:p@host.test/a.png", "https://host.test\n/a.png", "file:///a.png", null, {}]) {
    assert.equal(isSafeImageSource(unsafe), false, String(unsafe));
  }
  for (const safe of ["/images/modelo.svg", "images/modelo.png", "https://cdn.test/photo.jpg?q=1", `data:image/png;base64,${Buffer.from(pngHeader).toString("base64")}`]) assert.equal(isSafeImageSource(safe), true);
  assert.equal(isSafeImageSource("data:image/png;base64,PGh0bWw+PC9odG1sPg=="), false);
});

test("YouTube embeds only use exact provider hosts and eleven character IDs", () => {
  for (const url of ["https://youtu.be/abcdefghijk", "https://www.youtube.com/watch?feature=share&v=abcdefghijk", "https://m.youtube.com/shorts/abcdefghijk", "https://www.youtube-nocookie.com/embed/abcdefghijk"]) {
    assert.equal(getProductVideoInfo(url)?.embedUrl, "https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0");
  }
  assert.equal(getProductVideoInfo("https://fake.test/youtube.com/watch?v=abcdefghijk")?.isYouTube, false);
  for (const url of ["javascript:alert(1)", "data:text/html,test", "https://www.youtube.com/watch?v=bad", "https://user:pw@youtube.com/watch?v=abcdefghijk"]) assert.equal(getProductVideoInfo(url), null);
  assert.deepEqual(getProductVideoInfo("https://cdn.test/demo.mp4"), { isYouTube: false, embedUrl: "https://cdn.test/demo.mp4" });
});

const decodeImage = async file => {
  const image = sharp(Buffer.from(await file.arrayBuffer()));
  const { info } = await image.raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height };
};

test("image uploads check size, allowed MIME and matching file signature before decoding", async () => {
  await assert.rejects(validateImageFile(new File(["<html>"], "photo.png", { type: "image/png" })), /contenido/);
  await assert.rejects(validateImageFile(new File(["<svg/>"], "photo.svg", { type: "image/svg+xml" })), /SVG/);
  await assert.rejects(validateImageFile(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.png", { type: "image/png" })), /2 MB/);
});

test("image uploads reject truncated photos with a valid signature and preserve valid originals", async () => {
  await assert.rejects(validateImageFile(new File([pngHeader], "broken.png", { type: "image/png" }), decodeImage), /sin daños/);
  for (const format of ["png", "jpeg", "webp", "gif"]) {
    const data = await sharp({ create: { width: 1200, height: 800, channels: 3, background: "white" } }).toFormat(format).toBuffer();
    const file = new File([data], `original.${format}`, { type: `image/${format}` });
    await validateImageFile(file, decodeImage);
    assert.deepEqual(Buffer.from(await file.arrayBuffer()), data);
  }
});

test("image uploads enforce the same pixel limit as publication", async () => {
  const file = new File([pngHeader], "large.png", { type: "image/png" });
  await assert.rejects(validateImageFile(file, async () => ({ width: 8000, height: 8000 })), /40 megapíxeles/);
  await assert.rejects(validateImageFile(file, async () => ({ width: 0, height: 800 })), /dimensiones/);
  await validateImageFile(file, async () => ({ width: 8000, height: 5000 }));
});

test("backup validation rejects corrupt product fields, duplicated IDs and unsafe media", () => {
  assert.deepEqual(parseStoreBackup(backup()).products, [product]);
  for (const invalid of [{ ...product, price: -1 }, { ...product, stockCount: 0.5 }, { ...product, name: {} }, { ...product, colors: [null] }, { ...product, features: [null] }, { ...product, images: ["data:text/html,a"] }, { ...product, specs: { battery: {} } }, { ...product, videoUrl: "javascript:alert(1)" }]) assert.throws(() => parseStoreBackup(backup(invalid)));
  assert.throws(() => parseStoreBackup(JSON.stringify({ products: [product, product] })), /duplicados/);
  assert.throws(() => parseStoreBackup('{"products":[],"__proto__":{"admin":true}}'), /propiedades/);
  assert.throws(() => parseStoreBackup(backup() + " ".repeat(MAX_BACKUP_BYTES)), /10 MB/);
  assert.throws(() => parseStoreBackup(JSON.stringify({ products: [], sales: [{ id: "sale", customerName: {}, quantity: 2 }] })), /venta/);
  const parsed = parseStoreBackup(JSON.stringify({ products: [product], supabaseKey: "not-imported", authenticated: true }));
  assert.equal("supabaseKey" in parsed, false);
  assert.equal("authenticated" in parsed, false);
});

test("a failed multi-field restoration restores the entire previous snapshot", () => {
  const values = new Map([["pulsotech_custom_products", "old-products"], ["pulsotech_custom_brands", "old-brands"], ["unrelated", "preserved"]]);
  const original = new Map(values);
  let failed = false;
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (key === "pulsotech_custom_categories" && !failed) { failed = true; throw new Error("QuotaExceededError"); }
      values.set(key, value);
    },
    removeItem: (key) => values.delete(key),
  };
  assert.throws(() => restoreBackupLocally(storage, parseStoreBackup(backup())), /conservaron/);
  assert.deepEqual(values, original);
  restoreBackupLocally(storage, parseStoreBackup(backup()));
  assert.deepEqual(JSON.parse(values.get("pulsotech_custom_products")), [product]);
  assert.equal(values.get("unrelated"), "preserved");
  const denied = { ...storage, setItem: () => { throw new Error("Storage denied"); } };
  const beforeDenied = new Map(values);
  assert.throws(() => restoreBackupLocally(denied, parseStoreBackup(backup())));
  assert.deepEqual(values, beforeDenied);
});

test("CSV text remains a single quoted cell and spreadsheet formulas are neutralized", () => {
  for (const formula of ["=1+1", "+SUM(1,2)", "-1+1", "@SUM(1)", " \t=HYPERLINK(1)", "\tanything", "＝1+1"]) assert.ok(csvCell(formula).startsWith('"\''));
  assert.equal(csvCell('Nombre, "modelo"'), '"Nombre, ""modelo"""');
  assert.equal(csvCell("Cliente #1"), '"Cliente #1"');
  assert.equal(csvCell(100.25), '"100.25"');
});
