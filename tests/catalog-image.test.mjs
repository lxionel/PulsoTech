import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { prepareCatalogImage } from "../scripts/lib/catalog-image.mjs";

test("small JPEG photos retain their exact original bytes without a second lossy compression", async () => {
  const original = await sharp({ create: { width: 225, height: 225, channels: 3, background: "#dddddd" } }).jpeg({ quality: 90 }).toBuffer();
  const photo = await prepareCatalogImage(original);
  assert.equal(photo.extension, "jpg");
  assert.deepEqual(photo.data, original);
  const metadata = await sharp(photo.data).metadata();
  assert.equal(metadata.width, 225);
  assert.equal(metadata.height, 225);
});

test("wide photos retain the whole composition and original resolution below the upper limit", async () => {
  const original = await sharp({ create: { width: 1974, height: 797, channels: 3, background: "#354954" } }).png().toBuffer();
  const photo = await prepareCatalogImage(original);
  const metadata = await sharp(photo.data).metadata();
  assert.equal(metadata.width, 1974);
  assert.equal(metadata.height, 797);
  assert.equal(photo.extension, "webp");
});

test("very large photos resize proportionally and transparent backgrounds stay transparent", async () => {
  const original = await sharp({ create: { width: 3000, height: 1000, channels: 4, background: { r: 20, g: 40, b: 60, alpha: 0.5 } } }).png().toBuffer();
  const photo = await prepareCatalogImage(original);
  const metadata = await sharp(photo.data).metadata();
  assert.equal(metadata.width, 2400);
  assert.equal(metadata.height, 800);
  assert.equal(metadata.hasAlpha, true);
  const { data } = await sharp(photo.data).raw().toBuffer({ resolveWithObject: true });
  assert.ok(Math.abs(data[3] - 128) <= 1);
});

test("camera orientation is applied before fitting the photo", async () => {
  const original = await sharp({ create: { width: 200, height: 400, channels: 3, background: "#555555" } }).withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const photo = await prepareCatalogImage(original);
  const metadata = await sharp(photo.data).metadata();
  assert.equal(metadata.width, 400);
  assert.equal(metadata.height, 200);
  assert.ok(!metadata.orientation || metadata.orientation === 1);
});
