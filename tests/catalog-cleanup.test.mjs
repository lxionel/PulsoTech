import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pruneCatalogMedia } from "../scripts/lib/catalog-cleanup.mjs";

test("cleanup preserves general and color-only photos, referenced local originals, manifests and unrelated files", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "pulsotech-media-test-"));
  const names = ["1".repeat(24)+".jpg", "2".repeat(24)+".webp", "3".repeat(24)+".png", "4".repeat(24)+".gif", "5".repeat(24)+".jpg", "manual.jpg", "manifest.json"];
  try {
    await Promise.all(names.map(name => fs.writeFile(path.join(directory, name), "fixture")));
    await fs.mkdir(path.join(directory, "6".repeat(24)+".jpg"));
    const catalog = [{ images: [`/catalog-media/${names[0]}`], colors: [{ image: `/catalog-media/${names[1]}`, images: [`/catalog-media/${names[2]}`] }] }, { images: [`/catalog-media/${names[3]}`] }];
    assert.equal(await pruneCatalogMedia(directory, catalog), 1);
    const remaining = await fs.readdir(directory);
    for (const name of names.filter(name => name !== names[4])) assert.ok(remaining.includes(name), name);
    assert.ok(remaining.includes("6".repeat(24)+".jpg"));
    assert.equal(await pruneCatalogMedia(directory, catalog), 0);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
