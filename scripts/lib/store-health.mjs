import { isPublicSupabaseKey } from "../../src/lib/admin-auth.ts";

const MAX_BYTES = 2 * 1024 * 1024;
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const validProducts = rows => Array.isArray(rows) && rows.length <= 2 && rows.every(row => object(row)
  && ["string", "number"].includes(typeof row.id) && String(row.id).length > 0
  && typeof row.name === "string" && row.name.trim().length > 0
  && typeof row.price === "number" && Number.isFinite(row.price) && row.price >= 0
  && Number.isInteger(row.stock_count) && row.stock_count >= 0 && typeof row.in_stock === "boolean");

function origin(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Usa un origen HTTPS sin rutas, credenciales ni parámetros.");
  }
  return url.origin;
}

function imageSignature(bytes) {
  return bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
    || bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    || /^GIF8[79]a/.test(bytes.toString("ascii", 0, 6))
    || (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP")
    || (bytes.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(bytes.toString("ascii", 8, 64)));
}

async function readBounded(response, sample, signal) {
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const abort = () => { reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", abort, { once: true });
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (!sample && size > MAX_BYTES) throw new Error("size_limit");
      chunks.push(Buffer.from(sample ? value.subarray(0, Math.max(0, 64 - (size - value.byteLength))) : value));
      if (sample && size >= 64) break;
    }
    return Buffer.concat(chunks);
  } finally {
    signal.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
  }
}

/** Public GETs only; no sessions, orders, complaints or private tables. */
export async function checkStoreHealth({ target, api, key, fetchImpl = fetch, timeoutMs = 10000, retryDelayMs = 500 }) {
  const site = origin(target);
  const backend = origin(api);
  if (!isPublicSupabaseKey(key)) throw new Error("Solo se admite la clave pública de Supabase.");
  const checks = [];
  async function check(resource, url, kind, validate, apiRequest = false) {
    // Only our two validated origins may be contacted. Keys never reach the store.
    if (url.origin !== (apiRequest ? backend : site)) throw new Error("Destino no admitido.");
    for (let attempt = 1; attempt <= 2; attempt++) {
      let data;
      const started = performance.now();
      let status = 0, reason = "network", ok = false;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        // The explicit race also bounds a stalled response body, not only headers.
        await Promise.race([
          (async () => {
            const response = await fetchImpl(url, { method: "GET", redirect: "error", signal: controller.signal,
              headers: apiRequest ? { apikey: key } : kind === "image" ? { Range: "bytes=0-63" } : {} });
            status = response.status;
            if (response.redirected || (status !== 200 && !(kind === "image" && status === 206))) {
              await response.body?.cancel(); reason = "http"; return;
            }
            const type = response.headers.get("content-type") || "";
            if (!(kind === "html" ? type.includes("text/html") : kind === "json" ? type.includes("application/json") : type.startsWith("image/"))) {
              await response.body?.cancel(); reason = "content_type"; return;
            }
            const bytes = await readBounded(response, kind === "image", controller.signal);
            if (kind === "json") {
              try { data = JSON.parse(bytes.toString("utf8")); } catch { reason = "invalid_json"; return; }
            } else data = kind === "image" ? bytes : bytes.toString("utf8");
            ok = validate(data);
            reason = ok ? "ok" : "invalid_content";
          })(),
          new Promise((_, reject) => controller.signal.addEventListener("abort", () => reject(new Error("timeout")), { once: true })),
        ]);
      } catch (error) {
        reason = controller.signal.aborted ? "timeout" : error.message === "size_limit" ? "size_limit" : "network";
      } finally { clearTimeout(timer); }
      if (ok || attempt === 2) {
        checks.push({ resource, ok, status, reason, attempts: attempt, ms: Math.round(performance.now() - started) });
        return ok ? data : undefined;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
  const html = text => /<html[\s>]/i.test(text) && /<title>[^<]*PulsoTech[^<]*<\/title>/i.test(text);
  const [products, manifest] = await Promise.all([
    check("productos", new URL("/rest/v1/products?select=id,name,price,stock_count,in_stock&limit=2", backend), "json", validProducts, true),
    check("galerías", new URL("/catalog-media/manifest.json", site), "json", value => object(value) && value.source === backend
      && Array.isArray(value.entries) && value.entries.every(entry => object(entry) && typeof entry.id === "string"
        && Array.isArray(entry.images) && entry.images.every(image => typeof image === "string") && Array.isArray(entry.colors))),
    check("ajustes públicos", new URL("/rest/v1/store_settings?select=key,value&key=eq.commerce_schema_version&limit=1", backend), "json",
      rows => Array.isArray(rows) && rows.length === 1 && rows[0]?.key === "commerce_schema_version" && rows[0].value === 1, true),
    ...["/", "/catalogo/", "/bolsa/", "/favoritos/"].map(path => check(path, new URL(path, site), "html", html)),
  ]);
  if (products?.length) await check("ficha HTML", new URL(`/producto/?id=${encodeURIComponent(products[0].id)}`, site), "html", html);
  // Sample only generated files on this site. External originals are not fetched.
  const entry = manifest?.entries.find(row => products?.some(product => String(product.id) === row.id));
  const images = entry ? [...entry.images, ...entry.colors.flatMap(color => object(color) ? [color.image, ...(Array.isArray(color.images) ? color.images : [])] : [])] : [];
  const image = images.find(path => typeof path === "string" && /^\/catalog-media\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg|gif|avif)$/.test(path));
  if (image) await check("imagen de muestra", new URL(image, site), "image", imageSignature);
  return { checkedAt: new Date().toISOString(), target: site, ok: checks.every(row => row.ok),
    checks: checks.sort((a, b) => a.resource.localeCompare(b.resource)), imageSampled: Boolean(image),
    scope: "HTTP público y contenido; no ejecuta JavaScript ni comprueba compras, sesiones o todas las imágenes." };
}
