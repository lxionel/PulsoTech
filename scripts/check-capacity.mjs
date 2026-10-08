import fs from "node:fs/promises";
import { performance } from "node:perf_hooks";
import nextEnv from "@next/env";

// Bounded, read-only HTTP exercise. It does not execute browser JavaScript,
// open Realtime connections, create orders, submit complaints or authenticate.
const args = process.argv.slice(2);
const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
const execute = args.includes("--execute");
try {
  const known = new Set(["--execute", "--target", "--stages", "--report"]);
  for (let index = 0; index < args.length; index++) {
    if (!known.has(args[index])) throw new Error("Opción no admitida.");
    if (args[index] !== "--execute" && (!args[index + 1] || args[index + 1].startsWith("--"))) throw new Error("Falta el valor de una opción.");
    if (args[index] !== "--execute") index++;
  }
  const stages = (option("--stages") || "10,25,50,100").split(",").map(Number);
  if (stages.length > 4 || !stages.length || stages.some(n => !Number.isInteger(n) || n < 1 || n > 100)) throw new Error("Usa entre una y cuatro etapas, con 1 a 100 clientes HTTP cada una.");
  const target = new URL(option("--target") || "https://pulsotech.pages.dev/");
  if (target.protocol !== "https:" || target.username || target.password || target.search || target.hash || target.pathname !== "/") throw new Error("El destino debe ser un origen HTTPS sin ruta, credenciales ni parámetros.");
  const plan = { target: target.origin, stages, visitsPerClient: 1, timeoutMs: 10000,
    stopOn: "cualquier error HTTP o p95 superior a 3000 ms", scope: "HTTP estático y consultas públicas; sin JavaScript, Realtime, sesiones ni escrituras" };
  if (!execute) {
    console.log(JSON.stringify({ execute: false, plan }, null, 2));
    console.log("Añade --execute para ejecutar. Las etapas mayores deben probarse primero en un entorno equivalente con cuotas verificadas.");
  } else {
    nextEnv.loadEnvConfig(process.cwd());
    const source = await fs.readFile("src/lib/supabase.ts", "utf8");
    const api = process.env.NEXT_PUBLIC_SUPABASE_URL || source.match(/DEFAULT_SUPABASE_URL = "([^"]+)"/)[1];
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || source.match(/DEFAULT_SUPABASE_ANON_KEY = "([^"]+)"/)[1];
    let publicKey = key.startsWith("sb_publishable_");
    if (!publicKey && key.split(".").length === 3) publicKey = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "anon";
    if (!publicKey || new URL(api).protocol !== "https:") throw new Error("Solo se admite una clave pública y un proyecto HTTPS.");
    const columns = source.match(/const PRODUCT_METADATA_COLUMNS = "([^"]+)"/)[1];
    const productsUrl = new URL(`/rest/v1/products?select=${columns}&order=created_at.desc`, api);
    const settingsUrl = new URL("/rest/v1/store_settings?select=key,value&key=in.(brands,categories,whatsapp_number,commerce_settings,commerce_schema_version)", api);
    const prepare = await fetch(productsUrl, { headers: { apikey: key }, signal: AbortSignal.timeout(10000) });
    if (!prepare.ok) throw new Error("La consulta pública inicial falló; no se inició la carga.");
    const products = await prepare.json();
    if (!Array.isArray(products)) throw new Error("El catálogo inicial no es válido.");
    const product = products[0];
    const routes = [
      { name: "inicio", url: new URL("/", target) },
      { name: "catálogo", url: new URL("/catalogo/", target) },
      ...(product ? [{ name: "ficha HTML", url: new URL(`/producto/?id=${encodeURIComponent(product.id)}`, target) }] : []),
      { name: "galerías", url: new URL("/catalog-media/manifest.json", target) },
      { name: "productos API", url: productsUrl, api: true },
      { name: "ajustes públicos API", url: settingsUrl, api: true },
    ];
    const results = [];
    const quantile = (values, fraction) => values[Math.max(0, Math.ceil(values.length * fraction) - 1)] || 0;
    for (const clients of stages) {
      const measurements = [];
      await Promise.all(Array.from({ length: clients }, async (_, index) => {
        await new Promise(resolve => setTimeout(resolve, index * 20));
        for (const route of routes) {
          const start = performance.now();
          let bytes = 0, status = 0;
          try {
            const response = await fetch(route.url, { headers: route.api ? { apikey: key } : {}, signal: AbortSignal.timeout(10000), redirect: "error" });
            status = response.status;
            const reader = response.body?.getReader();
            if (reader) {
              while (true) {
                const part = await reader.read();
                if (part.done) break;
                bytes += part.value.byteLength;
                if (bytes > 5 * 1024 * 1024) { await reader.cancel(); status = 0; break; }
              }
            }
          } catch { status = 0; }
          measurements.push({ resource: route.name, ms: Math.round(performance.now() - start), bytes, status });
          if (status !== 200) break;
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }));
      const latencies = measurements.map(row => row.ms).sort((a, b) => a - b);
      const errors = measurements.filter(row => row.status !== 200 || row.bytes === 0).length;
      const result = { clients, completedVisits: measurements.filter(row => row.resource === routes.at(-1).name && row.status === 200).length,
        requests: measurements.length, errors, p50Ms: quantile(latencies, .5), p95Ms: quantile(latencies, .95), maxMs: latencies.at(-1),
        bytes: measurements.reduce((sum, row) => sum + row.bytes, 0), resources: routes.map(route => {
          const rows = measurements.filter(row => row.resource === route.name);
          return { resource: route.name, requests: rows.length, errors: rows.filter(row => row.status !== 200 || !row.bytes).length, p95Ms: quantile(rows.map(row => row.ms).sort((a, b) => a - b), .95) };
        }) };
      results.push(result); console.log(JSON.stringify(result));
      if (errors || result.p95Ms > 3000) { process.exitCode = 1; break; }
      if (clients !== stages.at(-1)) await new Promise(resolve => setTimeout(resolve, 3000));
    }
    const report = { date: new Date().toISOString(), plan, results, capacityCertified: false,
      limitation: "Una pasada HTTP desde una sola ubicación no demuestra capacidad sostenida ni valida la interacción en navegadores." };
    if (option("--report")) await fs.writeFile(option("--report"), JSON.stringify(report, null, 2), { flag: "wx" });
  }
} catch (failure) {
  // Never print request headers, keys, response rows or network exception URLs.
  console.error(failure instanceof Error && !execute ? failure.message : "La comprobación no se completó. No se modificaron datos de la tienda.");
  process.exitCode = 1;
}
