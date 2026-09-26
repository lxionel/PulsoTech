import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Product, ProductColor, ProductSpecs, ProductSpecItem, SoundProfile, Coupon, SaleRecord } from "@/types";

const LOCAL_STORAGE_URL_KEY = "pulsotech_supabase_url";
const LOCAL_STORAGE_KEY_KEY = "pulsotech_supabase_anon_key";

export const DEFAULT_SUPABASE_URL = "https://upovmpudzgtafobtxnfr.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_xvdDq0pAicQ-0C4PYkvlVQ_wN_Xqakm";

export function getSupabaseConfig(): { url: string; anonKey: string } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (typeof window !== "undefined") {
    const savedUrl = localStorage.getItem(LOCAL_STORAGE_URL_KEY);
    const savedKey = localStorage.getItem(LOCAL_STORAGE_KEY_KEY);
    if (savedUrl && savedUrl.trim()) url = savedUrl.trim();
    if (savedKey && savedKey.trim()) anonKey = savedKey.trim();
  }

  return { url, anonKey };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== "undefined") {
    if (url && url.trim()) {
      localStorage.setItem(LOCAL_STORAGE_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
    }
    if (anonKey && anonKey.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_KEY);
    }
    cachedClient = null; // invalidar cliente en caché
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = "";
let lastKey = "";

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (e) {
    console.error("Error al inicializar cliente de Supabase:", e);
    return null;
  }
}

export function isSupabaseReady(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

export interface DbProductRow {
  id: string | number;
  name?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  price?: number;
  original_price?: number | null;
  brand?: string;
  category?: string;
  in_stock?: boolean;
  stock_count?: number;
  is_featured?: boolean;
  is_new?: boolean;
  rating?: number;
  reviews_count?: number;
  video_url?: string | null;
  colors?: ProductColor[];
  images?: string[];
  custom_specs?: ProductSpecItem[];
  specs?: ProductSpecs;
  sound_profile?: SoundProfile;
  features?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DbStoreSettingRow {
  key: string;
  value: unknown;
  updated_at?: string;
}

// Convertidor de fila de base de datos a Product
export function dbRowToProduct(row: DbProductRow): Product {
  return {
    id: String(row.id),
    name: row.name || "",
    slug: row.slug || "",
    subtitle: row.subtitle || "",
    description: row.description || "",
    price: Number(row.price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    brand: row.brand || "Xiaomi",
    category: row.category || "Audífonos Inalámbricos",
    inStock: Boolean(row.in_stock),
    stockCount: typeof row.stock_count === "number" ? row.stock_count : 10,
    isFeatured: Boolean(row.is_featured),
    isNew: Boolean(row.is_new),
    rating: Number(row.rating) || 5.0,
    reviewsCount: Number(row.reviews_count) || 1,
    videoUrl: row.video_url || undefined,
    colors: Array.isArray(row.colors) ? row.colors : [],
    images: Array.isArray(row.images) ? row.images : [],
    customSpecs: Array.isArray(row.custom_specs) ? row.custom_specs : undefined,
    specs: row.specs || {},
    soundProfile: (row.sound_profile as Product["soundProfile"]) || {
      type: "Equilibrado",
      description: "Audio de alta fidelidad",
      bass: 80,
      mid: 80,
      treble: 80,
    },
    features: Array.isArray(row.features) ? row.features : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

// Convertidor de Product a fila de base de datos
export function productToDbRow(p: Product): DbProductRow {
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    subtitle: p.subtitle || "",
    description: p.description || "",
    price: p.price,
    original_price: p.originalPrice || null,
    brand: p.brand,
    category: p.category,
    in_stock: p.inStock,
    stock_count: p.stockCount,
    is_featured: p.isFeatured,
    is_new: p.isNew,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    video_url: p.videoUrl || null,
    colors: p.colors || [],
    images: p.images || [],
    custom_specs: p.customSpecs || [],
    specs: p.specs || {},
    sound_profile: p.soundProfile || undefined,
    features: p.features || [],
    tags: p.tags || [],
    updated_at: new Date().toISOString(),
  };
}

// ================= API CALLS =================

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch error:", error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map(dbRowToProduct);
    }
    return [];
  } catch (err) {
    console.error("Error fetching products from Supabase:", err);
    return null;
  }
}

export async function upsertProductToSupabase(product: Product): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = productToDbRow(product);
    const { error } = await client
      .from("products")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error("Error upserting product to Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception upserting product:", err);
    return false;
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product from Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception deleting product:", err);
    return false;
  }
}

export async function updateStockInSupabase(id: string, newStock: number): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from("products")
      .update({
        stock_count: newStock,
        in_stock: newStock > 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating stock in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception updating stock:", err);
    return false;
  }
}

export async function fetchStoreSettingsFromSupabase(): Promise<{ brands?: string[]; categories?: string[]; whatsappNumber?: string } | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from("store_settings").select("*");
    if (error) {
      console.warn("Store settings fetch error:", error.message);
      return null;
    }

    const result: { brands?: string[]; categories?: string[]; whatsappNumber?: string } = {};
    (data || []).forEach((item: DbStoreSettingRow) => {
      if (item.key === "brands" && Array.isArray(item.value)) result.brands = item.value as string[];
      if (item.key === "categories" && Array.isArray(item.value)) result.categories = item.value as string[];
      if (item.key === "whatsapp_number" && typeof item.value === "string") result.whatsappNumber = item.value;
    });

    return result;
  } catch (err) {
    console.error("Error fetching store settings:", err);
    return null;
  }
}

export async function saveStoreSettingsToSupabase(key: "brands" | "categories" | "whatsapp_number", value: unknown): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from("store_settings")
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("Error saving store settings:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception saving store settings:", err);
    return false;
  }
}

// ================= SINCRONIZACIÓN DE VENTAS EN LA NUBE =================

export async function fetchSalesRecordsFromSupabase(): Promise<SaleRecord[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("store_settings")
      .select("value")
      .eq("key", "sales_records")
      .maybeSingle();

    if (error) {
      console.warn("Error fetching sales from Supabase:", error.message);
      return null;
    }

    if (data && Array.isArray(data.value)) {
      return data.value as SaleRecord[];
    }
    return [];
  } catch (err) {
    console.error("Exception fetching sales from Supabase:", err);
    return null;
  }
}

export async function saveSalesRecordsToSupabase(sales: SaleRecord[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("store_settings").upsert(
      {
        key: "sales_records",
        value: sales,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      console.error("Error saving sales records to Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception saving sales records to Supabase:", err);
    return false;
  }
}

// ================= SINCRONIZACIÓN DE CUPONES EN LA NUBE =================

export async function fetchCouponsFromSupabase(): Promise<Coupon[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("store_settings")
      .select("value")
      .eq("key", "coupons")
      .maybeSingle();

    if (error) {
      console.warn("Error fetching coupons from Supabase:", error.message);
      return null;
    }

    if (data && Array.isArray(data.value)) {
      return data.value as Coupon[];
    }
    return [];
  } catch (err) {
    console.error("Exception fetching coupons from Supabase:", err);
    return null;
  }
}

export async function saveCouponsToSupabase(coupons: Coupon[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("store_settings").upsert(
      {
        key: "coupons",
        value: coupons,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      console.error("Error saving coupons to Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception saving coupons to Supabase:", err);
    return false;
  }
}

// ================= LIMPIEZA & TEST DE CONEXIÓN =================

export async function clearAllProductsFromSupabase(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("products").delete().neq("id", "___keep_alive___");
    if (error) {
      console.error("Error clearing products from Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception clearing products from Supabase:", err);
    return false;
  }
}

export async function testSupabaseConnection(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, latencyMs: 0, error: "No se ha configurado la URL o clave de Supabase." };
  }

  const start = Date.now();
  try {
    const { error } = await client.from("store_settings").select("key").limit(1);
    const latencyMs = Date.now() - start;
    if (error) {
      return { ok: false, latencyMs, error: error.message };
    }
    return { ok: true, latencyMs };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
