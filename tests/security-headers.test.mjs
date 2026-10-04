import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addCspMeta, hostingHeaders, inlineScriptHashes, secureStaticExport, securityPolicy } from "../scripts/security-headers.mjs";

const hash = (text) => `'sha256-${createHash("sha256").update(text).digest("base64")}'`;
const bootstrap = "self.__next_f.push([0]);";
const html = (script) => `<html><head><meta charset="utf-8"/><script src="/_next/static/main.js"></script></head><body><script>${script}</script><script type="application/ld+json">{"name":"PulsoTech"}</script></body></html>`;

test("static inline scripts are authorized by their exact content; injected or modified scripts are not", () => {
  const hashes = inlineScriptHashes(html(bootstrap));
  assert.deepEqual(hashes, [hash(bootstrap)]);
  const csp = securityPolicy(hashes);
  const scripts = csp.split(";").find((line) => line.trim().startsWith("script-src "));
  assert.equal(scripts.includes(hash(bootstrap)), true);
  assert.equal(scripts.includes(hash("alert(document.cookie)")), false);
  assert.equal(scripts.includes("unsafe-inline"), false);
  assert.equal(scripts.includes("unsafe-eval"), false);
  assert.equal(scripts.includes("https://challenges.cloudflare.com"), true);
  assert.equal(scripts.includes("https:"), true); // only the explicitly allowed provider
  assert.equal(scripts.includes("https: "), false);
  assert.equal(csp.includes("script-src-attr 'none'"), true);
  assert.equal(csp.includes("object-src 'none'"), true);
  assert.deepEqual(inlineScriptHashes(html("const x = 1;\r\nconst y = 2;")), [hash("const x = 1;\nconst y = 2;")]);
});
test("the connection policy permits the configured database and realtime without unrelated origins", () => {
  const policy = securityPolicy([hash(bootstrap)], "https://test-project.supabase.co");
  const connect = policy.split(";").find((line) => line.trim().startsWith("connect-src"));
  assert.equal(connect.includes("https://test-project.supabase.co"), true);
  assert.equal(connect.includes("wss://test-project.supabase.co"), true);
  assert.equal(connect.includes("upovmpudzgtafobtxnfr"), false);
  assert.equal(connect.includes("*"), false);
  for (const bad of ["http://test.supabase.co", "https://user:secret@test.supabase.co", "https://test.supabase.co/path", "https://test.supabase.co/?x=y"]) assert.throws(() => securityPolicy([hash(bootstrap)], bad), /origen HTTPS/);
});
test("hosting headers block embedding, sniffing and unused device permissions and mark administration as private", () => {
  const headers = hostingHeaders(securityPolicy([hash(bootstrap)]), "/PulsoTech");
  for (const required of ["frame-ancestors 'none'", "X-Frame-Options: DENY", "X-Content-Type-Options: nosniff", "Referrer-Policy:", "Permissions-Policy:", "Strict-Transport-Security:", "/Lionel260606/*", "/PulsoTech/Lionel260606/*", "Cache-Control: no-store", "X-Robots-Tag: noindex, nofollow"]) assert.equal(headers.includes(required), true);
  assert.equal(headers.includes("includeSubDomains"), false);
  assert.equal(headers.includes("preload"), false);
  assert.equal(headers.includes("Access-Control-Allow-Origin: *"), false);
  assert.equal(securityPolicy([hash(bootstrap)], undefined, true).includes("frame-ancestors"), false);
  assert.throws(() => hostingHeaders(securityPolicy([hash(bootstrap)]), "/path\nInjected: value"), /inválido/);
  const large = Array.from({ length: 40 }, (_, i) => hash(`script-${i}`));
  assert.throws(() => hostingHeaders(securityPolicy(large)), /supera el límite/);
});
test("postbuild protects every exported page, preserves bootstrap and CSS, and can run twice without duplicate policies", async () => {
  const directory = await mkdtemp(join(tmpdir(), "pulso-headers-"));
  try {
    await mkdir(join(directory, "Lionel260606"));
    await writeFile(join(directory, "index.html"), html(bootstrap));
    const other = "self.__next_f.push([1, 'admin']);";
    await writeFile(join(directory, "Lionel260606", "index.html"), html(other));
    await writeFile(join(directory, "ignored.txt"), "retain this asset");
    assert.deepEqual(await secureStaticExport(directory, { basePath: "/PulsoTech" }), { pages: 2, hashes: 2 });
    const first = await readFile(join(directory, "index.html"), "utf8");
    const cspPosition = first.indexOf('http-equiv="Content-Security-Policy"');
    assert.ok(cspPosition > first.indexOf("<head>") && cspPosition < first.indexOf("<script"));
    assert.equal(first.includes(bootstrap), true);
    assert.deepEqual(inlineScriptHashes(first), [hash(bootstrap)]);
    const headers = await readFile(join(directory, "_headers"), "utf8");
    assert.equal(headers.includes(hash(bootstrap)), true);
    assert.equal(headers.includes(hash(other)), true);
    await secureStaticExport(directory, { basePath: "/PulsoTech" });
    assert.equal(await readFile(join(directory, "index.html"), "utf8"), first);
    assert.equal(await readFile(join(directory, "ignored.txt"), "utf8"), "retain this asset");
    assert.equal((first.match(/http-equiv="Content-Security-Policy"/g) ?? []).length, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("a malformed export fails instead of emitting a weaker or partial policy", () => {
  assert.throws(() => addCspMeta("<html>no head</html>", "default-src 'self'"), /cabecera/);
  assert.throws(() => securityPolicy([]), /huellas/);
  assert.throws(() => securityPolicy(["'unsafe-inline'"]), /huellas/);
});
