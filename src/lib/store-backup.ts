// Shared by the browser and the offline recovery tool. No Storage or network access.
export const MAX_OPERATIONAL_BACKUP_BYTES = 50 * 1024 * 1024;
const ITERATIONS = 600000;
type Row = Record<string, unknown>;
export interface StoreSnapshot {
  format: "PulsoTech-operational-backup";
  version: 1;
  createdAt: string;
  tables: { products: Row[]; store_settings: Row[]; sale_operations: Row[]; complaints: Row[] | null; order_tracking_links?: Row[] };
}
const productColumns = "id name slug subtitle description price original_price brand category in_stock stock_count is_featured is_new rating reviews_count video_url colors images custom_specs specs sound_profile features tags created_at updated_at".split(" ");
const complaintColumns = "id reference created_at provider submission status response responded_at".split(" ");
const settingKeys = ["brands", "categories", "whatsapp_number", "coupons", "sales_records", "commerce_settings", "commerce_schema_version"];
const isRow = (value: unknown): value is Row => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const json = (value: unknown) => JSON.stringify(value);
function rows(value: unknown, key: string, columns: string[], max: number): asserts value is Row[] {
  if (!Array.isArray(value) || value.length > max) throw new Error("Cantidad de registros no admitida.");
  const ids = new Set();
  for (const row of value) {
    if (!isRow(row) || Object.keys(row).some((column) => !columns.includes(column)) ||
        typeof row[key] !== "string" || !row[key] || ids.has(row[key])) throw new Error("Registros inválidos o duplicados.");
    ids.add(row[key]);
  }
}
export function validateStoreSnapshot(value: unknown): asserts value is StoreSnapshot {
  if (!isRow(value) || value.format !== "PulsoTech-operational-backup" || value.version !== 1 ||
      typeof value.createdAt !== "string" || !Number.isFinite(Date.parse(value.createdAt)) || !isRow(value.tables) ||
      Object.keys(value).some((key) => !["format", "version", "createdAt", "tables"].includes(key)) ||
      Object.keys(value.tables).some((key) => !["products", "store_settings", "sale_operations", "complaints", "order_tracking_links"].includes(key))) throw new Error("Formato de copia no admitido.");
  const tables = value.tables;
  rows(tables.products, "id", productColumns, 10000);
  rows(tables.store_settings, "key", ["key", "value", "updated_at"], settingKeys.length);
  rows(tables.sale_operations, "id", ["id", "request_hash", "product_id", "created_at"], 100000);
  if (tables.order_tracking_links !== undefined) {
    rows(tables.order_tracking_links, "sale_id", ["sale_id", "token_hash", "created_at", "expires_at"], 10000);
    if (tables.order_tracking_links.some((row) => typeof row.token_hash !== "string" || !/^[a-f0-9]{64}$/.test(row.token_hash) || typeof row.created_at !== "string" || !Number.isFinite(Date.parse(row.created_at)) || typeof row.expires_at !== "string" || !Number.isFinite(Date.parse(row.expires_at)))) throw new Error("Enlaces de seguimiento inválidos.");
  }
  if (tables.products.some((p) => typeof p.name !== "string" || typeof p.price !== "number" || !Number.isFinite(p.price) || p.price < 0 ||
      !Number.isSafeInteger(p.stock_count) || Number(p.stock_count) < 0 || typeof p.in_stock !== "boolean")) throw new Error("Inventario inválido.");
  for (const setting of tables.store_settings) {
    if (!settingKeys.includes(String(setting.key)) || !Object.hasOwn(setting, "value")) throw new Error("Configuración no admitida.");
    if (setting.key === "commerce_settings" && (!isRow(setting.value) || Object.entries(setting.value).some(([key, value]) =>
      key === "ordersEnabled" ? typeof value !== "boolean" : !["owner", "ruc", "address", "email", "hours", "deliveryArea", "deliveryCost", "deliveryTime"].includes(key) || typeof value !== "string" || value.length > 500))) throw new Error("Configuración comercial inválida.");
    if (setting.key === "commerce_schema_version" && setting.value !== 1) throw new Error("Versión comercial no admitida.");
    if (setting.key === "sales_records") {
      rows(setting.value, "id", ["id", "productName", "quantity", "total", "channel", "customerName", "date", "timestamp", "paymentMethod", "notes", "customerPhone", "customerAddress", "deliveryStatus", "trackingNumber", "selectedColor"], 10000);
      if (setting.value.some((sale) => !Number.isSafeInteger(sale.quantity) || Number(sale.quantity) < 1 || typeof sale.total !== "number" || !Number.isFinite(sale.total) || sale.total < 0)) throw new Error("Ventas inválidas.");
    }
  }
  if (tables.sale_operations.some((o) => typeof o.request_hash !== "string" || !/^(retired|[a-f0-9]{64})$/.test(o.request_hash) ||
      (o.product_id !== null && typeof o.product_id !== "string"))) throw new Error("Identidades de ventas inválidas.");
  if (tables.complaints !== null) {
    rows(tables.complaints, "id", complaintColumns, 10000);
    if (tables.complaints.some((c) => !Number.isSafeInteger(c.reference) || Number(c.reference) < 1 || !isRow(c.provider) || !isRow(c.submission) ||
        !["pending", "in_review", "answered"].includes(String(c.status)) || typeof c.response !== "string")) throw new Error("Reclamos inválidos.");
  }
  if (new TextEncoder().encode(json(value)).length > MAX_OPERATIONAL_BACKUP_BYTES) throw new Error("La copia supera 50 MB.");
}
const encode64 = (bytes: Uint8Array) => {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 8192) parts.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  return btoa(parts.join(""));
};
const decode64 = (value: unknown, max: number) => {
  if (typeof value !== "string" || value.length > Math.ceil(max / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error("Copia cifrada inválida.");
  const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  if (bytes.length > max) throw new Error("Copia cifrada demasiado grande.");
  return bytes;
};
async function derive(password: string, salt: Uint8Array<ArrayBuffer>) {
  if (password.length < 12 || password.length > 1024) throw new Error("Usa una contraseña de 12 a 1024 caracteres.");
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, material,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
export async function encryptStoreBackup(snapshot: StoreSnapshot, password: string): Promise<string> {
  validateStoreSnapshot(snapshot);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(password, salt);
  const payload = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode("PulsoTech-backup-v1") }, key, new TextEncoder().encode(json(snapshot)));
  return json({ format: "PulsoTech-encrypted-backup", version: 1, iterations: ITERATIONS, salt: encode64(salt), iv: encode64(iv), payload: encode64(new Uint8Array(payload)) });
}
export async function decryptStoreBackup(raw: string, password: string): Promise<StoreSnapshot> {
  if (new TextEncoder().encode(raw).length > MAX_OPERATIONAL_BACKUP_BYTES * 1.4 + 4096) throw new Error("Archivo demasiado grande.");
  const value: unknown = JSON.parse(raw);
  if (!isRow(value) || value.format !== "PulsoTech-encrypted-backup" || value.version !== 1 || value.iterations !== ITERATIONS ||
      Object.keys(value).some((key) => !["format", "version", "iterations", "salt", "iv", "payload"].includes(key))) throw new Error("Archivo cifrado no admitido.");
  const salt = decode64(value.salt, 16), iv = decode64(value.iv, 12), payload = decode64(value.payload, MAX_OPERATIONAL_BACKUP_BYTES + 16);
  if (salt.length !== 16 || iv.length !== 12 || payload.length < 16) throw new Error("Archivo cifrado incompleto.");
  const key = await derive(password, salt);
  let decoded: ArrayBuffer;
  try {
    decoded = await crypto.subtle.decrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode("PulsoTech-backup-v1") }, key, payload);
  } catch { throw new Error("Contraseña incorrecta o archivo alterado."); }
  const snapshot: unknown = JSON.parse(new TextDecoder().decode(decoded));
  validateStoreSnapshot(snapshot);
  return snapshot;
}
export function backupSummary(snapshot: StoreSnapshot) {
  validateStoreSnapshot(snapshot);
  const sales = snapshot.tables.store_settings.find((s) => s.key === "sales_records")?.value as Row[] | undefined;
  return { products: snapshot.tables.products.length, sales: sales?.length ?? 0, operations: snapshot.tables.sale_operations.length, complaints: snapshot.tables.complaints?.length ?? 0 };
}
/** Generates data-only recovery SQL for an EMPTY, separately prepared project. Never executes it. */
export function createRecoverySql(snapshot: StoreSnapshot): string {
  validateStoreSnapshot(snapshot);
  const literal = (value: unknown) => "'" + json(value).replaceAll("'", "''") + "'::jsonb";
  const insert = (table: string, values: Row[], identity = false) =>
    `insert into public.${table}${identity ? " overriding system value" : ""} select * from jsonb_populate_recordset(null::public.${table}, ${literal(values)})${table === "store_settings" ? " on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at" : ""};`;
  return `-- COPIA PRIVADA. Usar solo en un proyecto VACÍO de recuperación.
-- Instalar antes esquema, administrador/MFA, ventas seguras y, si corresponde, Libro.
-- No restaura cuentas Auth, autenticadores, secretos, archivos Storage ni configuración del alojamiento.
begin;
set local standard_conforming_strings = on;
lock table public.products, public.store_settings, public.sale_operations in access exclusive mode;
do $$ begin
  if exists(select 1 from public.products) or exists(select 1 from public.store_settings where key <> 'commerce_schema_version' or value is distinct from '1'::jsonb) or exists(select 1 from public.sale_operations) then
    raise exception 'Recuperación detenida: el destino debe estar vacío. No se reemplazaron datos.';
  end if;
end $$;
do $$ declare occupied boolean; begin
  if to_regclass('public.order_tracking_links') is not null then
    execute 'lock table public.order_tracking_links in access exclusive mode';
    execute 'select exists(select 1 from public.order_tracking_links)' into occupied;
    if occupied then raise exception 'El destino tiene enlaces de seguimiento: no se reemplazaron datos.'; end if;
  end if;
end $$;
${snapshot.tables.complaints !== null ? `lock table public.complaints in access exclusive mode;
do $$ begin if exists(select 1 from public.complaints) then raise exception 'El destino tiene reclamos: no se reemplazaron datos.'; end if; end $$;` : ""}
${insert("products", snapshot.tables.products)}
${insert("store_settings", snapshot.tables.store_settings)}
${insert("sale_operations", snapshot.tables.sale_operations)}
${snapshot.tables.order_tracking_links !== undefined ? insert("order_tracking_links", snapshot.tables.order_tracking_links) : ""}
${snapshot.tables.complaints !== null ? insert("complaints", snapshot.tables.complaints, true) + "\nselect setval(pg_get_serial_sequence('public.complaints','reference'), greatest(coalesce((select max(reference) from public.complaints),0),1), exists(select 1 from public.complaints));" : ""}
commit;
`;
}
