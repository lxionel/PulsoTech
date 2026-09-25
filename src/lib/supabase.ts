import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Product } from "@/types";

const LOCAL_STORAGE_URL_KEY = "pulsotech_supabase_url";
const LOCAL_STORAGE_KEY_KEY = "pulsotech_supabase_anon_key";

export function getSupabaseConfig(): { url: string; anonKey: string } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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

// Convertidor de fila de base de datos a Product
export function dbRowToProduct(row: any): Product {
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
    soundProfile: row.sound_profile || {
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
export function productToDbRow(p: Product): any {
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
    sound_profile: p.soundProfile || {},
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

export async function fetchStoreSettingsFromSupabase(): Promise<{ brands?: string[]; categories?: string[] } | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from("store_settings").select("*");
    if (error) {
      console.warn("Store settings fetch error:", error.message);
      return null;
    }

    const result: { brands?: string[]; categories?: string[] } = {};
    (data || []).forEach((item: any) => {
      if (item.key === "brands" && Array.isArray(item.value)) result.brands = item.value;
      if (item.key === "categories" && Array.isArray(item.value)) result.categories = item.value;
    });

    return result;
  } catch (err) {
    console.error("Error fetching store settings:", err);
    return null;
  }
}

export async function saveStoreSettingsToSupabase(key: "brands" | "categories", value: string[]): Promise<boolean> {
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
