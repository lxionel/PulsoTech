import fs from "node:fs/promises";
import nextEnv from "@next/env";
import { commerceRequirements, parseCommerceSettings, productRequirements, productCommerce, STORE_MODE } from "../src/lib/commerce.ts";
import { catalogProduct, exportableRow } from "./lib/catalog-snapshot.mjs";

nextEnv.loadEnvConfig(process.cwd());
const source = await fs.readFile("src/lib/supabase.ts", "utf8");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || source.match(/DEFAULT_SUPABASE_URL = "([^"]+)"/)[1];
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || source.match(/DEFAULT_SUPABASE_ANON_KEY = "([^"]+)"/)[1];
const publicKey = key.startsWith("sb_publishable_") || key.split(".").length === 3 && JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "anon";
if (!publicKey) throw new Error("Este control solo admite una clave pública anónima.");
const pending = [];
try {
  const request = async path => { const response = await fetch(url + path, { headers: { apikey: key }, signal: AbortSignal.timeout(15000) }); if (!response.ok) throw new Error("Consulta pública no disponible."); return response.json(); };
  const [rows, settings] = await Promise.all([request("/rest/v1/products?select=*"), request("/rest/v1/store_settings?select=key,value&key=in.(commerce_settings,commerce_schema_version)")]);
  const config = parseCommerceSettings(settings.find(row => row.key === "commerce_settings")?.value);
  if (settings.find(row => row.key === "commerce_schema_version")?.value !== 1) pending.push("Activar supabase/activate-commerce.sql");
  pending.push(...commerceRequirements(config));
  if (!config.ordersEnabled) pending.push("Habilitar pedidos después de probar la operación");
  const live = rows.filter(row => exportableRow(row, true));
  if (!live.length) pending.push("Publicar al menos un producto real verificado");
  for (const row of rows) {
    const product = catalogProduct(row, { colors: row.colors || [], images: row.images || [] });
    if (productCommerce(product).status === "live") pending.push(...productRequirements(product).map(item => `${product.id}: ${item}`));
  }
  if (process.env.NEXT_PUBLIC_STORE_MODE !== "live") pending.push("Publicar en modo ventas cuando completes los pendientes");
  if (process.env.NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED !== "true" || config.ruc !== process.env.NEXT_PUBLIC_STORE_RUC?.trim()) pending.push("Configurar y probar el Libro de Reclamaciones con el mismo RUC");
  console.log(`Productos reales revisados: ${live.length}. Modo de esta comprobación: ${process.env.NEXT_PUBLIC_STORE_MODE || STORE_MODE}.`);
  for (const item of new Set(pending)) console.log(`Pendiente: ${item}.`);
  if (!pending.length) console.log("Controles automáticos completos. Falta la prueba operativa de entrega, atención, respaldo y confirmación de pedidos.");
  process.exitCode = pending.length ? 1 : 0;
} catch { console.error("No se pudo comprobar la preparación. Revisa la conexión con Supabase; no se modificó ningún dato."); process.exitCode = 1; }
