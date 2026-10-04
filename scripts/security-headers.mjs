import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import nextEnv from "@next/env";

const TURNSTILE = "https://challenges.cloudflare.com";
const DEFAULT_DATABASE = "https://upovmpudzgtafobtxnfr.supabase.co";
const CSP_META = /<meta\s+[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi;

export function inlineScriptHashes(html) {
  const hashes = new Set();
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\bsrc\s*=/i.test(script[1])) continue;
    const type = script[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
    if (type && !["module", "text/javascript", "application/javascript"].includes(type.toLowerCase())) continue;
    // HTML parsing normalizes CRLF/CR to LF before CSP checks the script text.
    hashes.add(`'sha256-${createHash("sha256").update(script[2].replace(/\r\n?/g, "\n"), "utf8").digest("base64")}'`);
  }
  return [...hashes].sort();
}
export function securityPolicy(hashes, databaseUrl = DEFAULT_DATABASE, forMeta = false) {
  const url = new URL(databaseUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Configura NEXT_PUBLIC_SUPABASE_URL como un origen HTTPS sin credenciales ni ruta.");
  if (!hashes.length || hashes.some((hash) => !/^'sha256-[A-Za-z0-9+/]{43}='$/.test(hash))) throw new Error("Faltan huellas válidas de los scripts estáticos.");
  const directives = [
    "default-src 'self'",
    `script-src 'self' ${TURNSTILE} ${[...new Set(hashes)].sort().join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' ${url.origin} ${url.origin.replace(/^https:/, "wss:")} ${TURNSTILE}`,
    `frame-src ${TURNSTILE} https://www.youtube-nocookie.com`,
    "media-src 'self' blob: https:",
    "worker-src 'self' blob:",
    "object-src 'none'", "base-uri 'self'", "form-action 'self'",
    ...(!forMeta ? ["frame-ancestors 'none'"] : []),
    "upgrade-insecure-requests",
  ];
  return directives.join("; ") + ";";
}
export function addCspMeta(html, policy) {
  const clean = html.replace(CSP_META, "");
  if (!/<head\b[^>]*>/i.test(clean)) throw new Error("Una página exportada no tiene cabecera HTML.");
  return clean.replace(/<head\b[^>]*>/i, (head) => `${head}<meta http-equiv="Content-Security-Policy" content="${policy.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"/>`);
}
export function hostingHeaders(policy, basePath = "") {
  if (basePath && !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(basePath)) throw new Error("Prefijo de despliegue inválido.");
  const roots = [...new Set(["", basePath])];
  const result = [
    "# Generado desde el HTML de este build. Publicar siempre junto con estos archivos.",
    "/*",
    `  Content-Security-Policy: ${policy}`,
    "  X-Content-Type-Options: nosniff",
    "  X-Frame-Options: DENY",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    // Avoid preloading or extending to subdomains which may be independently hosted.
    "  Strict-Transport-Security: max-age=31536000",
    ...roots.flatMap((root) => [
      "", `${root}/Lionel260606`, "  Cache-Control: no-store", "  X-Robots-Tag: noindex, nofollow",
      "", `${root}/Lionel260606/*`, "  Cache-Control: no-store", "  X-Robots-Tag: noindex, nofollow",
    ]),
    "",
  ].join("\n");
  if (result.split("\n").some((line) => line.length > 2000)) throw new Error("Una cabecera supera el límite de Cloudflare Pages. Revisa las huellas; no publiques una configuración truncada.");
  return result;
}
async function htmlFiles(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) files.push(...await htmlFiles(path));
    else if (item.isFile() && item.name.endsWith(".html")) files.push(path);
  }
  return files.sort();
}
export async function secureStaticExport(directory, { databaseUrl = DEFAULT_DATABASE, basePath = "" } = {}) {
  const files = await htmlFiles(directory);
  if (!files.length) throw new Error("Primero genera la exportación estática de Next.js.");
  const pages = await Promise.all(files.map(async (file) => ({ file, html: await readFile(file, "utf8") })));
  const hashes = [...new Set(pages.flatMap((page) => inlineScriptHashes(page.html)))];
  const policy = securityPolicy(hashes, databaseUrl);
  const metaPolicy = securityPolicy(hashes, databaseUrl, true);
  const headers = hostingHeaders(policy, basePath); // validate BEFORE modifying any page
  for (const page of pages) await writeFile(page.file, addCspMeta(page.html, metaPolicy), "utf8");
  await writeFile(join(directory, "_headers"), headers, "utf8");
  return { pages: pages.length, hashes: hashes.length };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    nextEnv.loadEnvConfig(process.cwd(), false);
    const result = await secureStaticExport(resolve("out"), {
      databaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_DATABASE,
      basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/PulsoTech",
    });
    process.stdout.write(`Protección estática preparada: ${result.pages} páginas, ${result.hashes} huellas. Las cabeceras HTTP requieren un alojamiento compatible.\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : "No se pudieron generar las cabeceras."}\n`);
    process.exitCode = 1;
  }
}
