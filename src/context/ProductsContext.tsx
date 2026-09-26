"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import { PRODUCTS as DEFAULT_PRODUCTS } from "@/data/products";
import {
  isSupabaseReady,
  fetchProductsFromSupabase,
  upsertProductToSupabase,
  deleteProductFromSupabase,
  updateStockInSupabase,
  fetchStoreSettingsFromSupabase,
  saveStoreSettingsToSupabase,
  saveSupabaseConfig,
  getSupabaseClient,
  clearAllProductsFromSupabase,
  testSupabaseConnection,
} from "@/lib/supabase";

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, deltaOrExact: number, isDelta?: boolean) => void;
  resetToDefault: () => void;
  exportProductsJson: () => string;
  brands: string[];
  addBrand: (brand: string) => void;
  deleteBrand: (brand: string) => void;
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  // Supabase Cloud Integration
  isCloudConfigured: boolean;
  isCloudConnected: boolean;
  cloudStatus: string;
  connectSupabase: (url: string, anonKey: string) => Promise<{ success: boolean; message: string }>;
  disconnectSupabase: () => void;
  syncLocalToCloud: () => Promise<{ success: boolean; count: number; message: string }>;
  restoreOfficialCatalogToCloud: () => Promise<{ success: boolean; message: string }>;
  refreshFromCloud: () => Promise<void>;
  testConnection: () => Promise<{ ok: boolean; latencyMs: number; error?: string }>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = "pulsotech_custom_products";
const DATA_VERSION_KEY = "pulsotech_catalog_data_version";
const CURRENT_DATA_VERSION = "2026_09_25_v8";

const BRANDS_STORAGE_KEY = "pulsotech_custom_brands";
const CATEGORIES_STORAGE_KEY = "pulsotech_custom_categories";
const DEFAULT_BRANDS = ["Xiaomi", "Redmi", "Soundcore", "Haylou", "Sony"];
const DEFAULT_CATEGORIES = ["Audífonos Inalámbricos", "Smartwatches", "Altavoces Bluetooth", "Accesorios"];

function getInitialBrands(): string[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(BRANDS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_BRANDS;
}

function getInitialCategories(): string[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_CATEGORIES;
}

function getInitialProducts(): Product[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }
  return [];
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  const [brands, setBrands] = useState<string[]>(getInitialBrands);
  const [categories, setCategories] = useState<string[]>(getInitialCategories);

  // Estados de Supabase Cloud
  const [isCloudConfigured, setIsCloudConfigured] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<string>("Iniciando...");

  // Guardar en localStorage de respaldo
  const saveProductsLocal = useCallback((newProducts: Product[]) => {
    setProducts(newProducts);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      } catch (e) {
        console.error("Error writing to localStorage:", e);
      }
    }
  }, []);

  // Función para refrescar desde Supabase
  const refreshFromCloud = useCallback(async () => {
    if (!isSupabaseReady()) {
      setIsCloudConfigured(false);
      setIsCloudConnected(false);
      setCloudStatus("Modo local (Sin Supabase configurado)");
      return;
    }

    setIsCloudConfigured(true);
    setCloudStatus("Conectando con Supabase...");

    try {
      const cloudProds = await fetchProductsFromSupabase();
      if (cloudProds !== null) {
        setIsCloudConnected(true);
        setCloudStatus("🟢 Conectado en tiempo real a Supabase");

        // Respetar fielmente los productos de Supabase (incluso si está vacío porque se borraron)
        setProducts(cloudProds);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudProds));
        }

        // Cargar marcas y categorías de la nube si existen
        const cloudSettings = await fetchStoreSettingsFromSupabase();
        if (cloudSettings) {
          if (cloudSettings.brands && cloudSettings.brands.length > 0) {
            setBrands(cloudSettings.brands);
          }
          if (cloudSettings.categories && cloudSettings.categories.length > 0) {
            setCategories(cloudSettings.categories);
          }
        }
      } else {
        setIsCloudConnected(false);
        setCloudStatus("⚠️ Credenciales configuradas pero no se pudo conectar. Verifica la tabla 'products'.");
      }
    } catch (e) {
      console.error("Error en refreshFromCloud:", e);
      setIsCloudConnected(false);
      setCloudStatus("❌ Error al comunicar con Supabase");
    }
  }, []);

  // Conectar Supabase dinámicamente desde el panel Admin
  const connectSupabase = useCallback(async (url: string, anonKey: string): Promise<{ success: boolean; message: string }> => {
    if (!url.trim() || !anonKey.trim()) {
      return { success: false, message: "La URL y la Anon Key de Supabase son obligatorias." };
    }

    saveSupabaseConfig(url.trim(), anonKey.trim());
    setIsCloudConfigured(true);
    setCloudStatus("Verificando conexión...");

    const testResult = await fetchProductsFromSupabase();
    if (testResult !== null) {
      setIsCloudConnected(true);
      setCloudStatus("🟢 Conectado exitosamente en tiempo real");
      setProducts(testResult);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(testResult));
      }
      return {
        success: true,
        message: `¡Conexión establecida con éxito! Se sincronizaron ${testResult.length} productos desde Supabase.`,
      };
    } else {
      setIsCloudConnected(false);
      setCloudStatus("❌ Falló la conexión con Supabase");
      return {
        success: false,
        message: "No se pudo conectar a Supabase. Verifica que la URL y Anon Key sean correctas y que hayas ejecutado el script SQL.",
      };
    }
  }, []);

  // Desconectar Supabase
  const disconnectSupabase = useCallback(() => {
    saveSupabaseConfig("", "");
    setIsCloudConfigured(false);
    setIsCloudConnected(false);
    setCloudStatus("Modo local (Desconectado de Supabase)");
  }, []);

  // Subir el catálogo actual completo a Supabase
  const syncLocalToCloud = useCallback(async (): Promise<{ success: boolean; count: number; message: string }> => {
    if (!isSupabaseReady()) {
      return { success: false, count: 0, message: "Supabase no está configurado." };
    }

    let successCount = 0;
    for (const prod of products) {
      const ok = await upsertProductToSupabase(prod);
      if (ok) successCount++;
    }

    // Subir marcas y categorías también
    await saveStoreSettingsToSupabase("brands", brands);
    await saveStoreSettingsToSupabase("categories", categories);

    if (successCount > 0) {
      return {
        success: true,
        count: successCount,
        message: `¡${successCount} de ${products.length} productos y configuraciones se subieron exitosamente a Supabase!`,
      };
    } else {
      return {
        success: false,
        count: 0,
        message: "Ocurrió un error al subir los productos. Revisa la consola o las políticas RLS en Supabase.",
      };
    }
  }, [products, brands, categories]);

  // Restaurar el catálogo oficial por defecto en Supabase
  const restoreOfficialCatalogToCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseReady()) {
      return { success: false, message: "Supabase no está configurado." };
    }

    try {
      setCloudStatus("Restaurando catálogo oficial en Supabase...");
      await clearAllProductsFromSupabase();

      for (const prod of DEFAULT_PRODUCTS) {
        await upsertProductToSupabase(prod);
      }

      await saveStoreSettingsToSupabase("brands", DEFAULT_BRANDS);
      await saveStoreSettingsToSupabase("categories", DEFAULT_CATEGORIES);

      setProducts(DEFAULT_PRODUCTS);
      setBrands(DEFAULT_BRANDS);
      setCategories(DEFAULT_CATEGORIES);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(DEFAULT_BRANDS));
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      }

      setCloudStatus("🟢 Catálogo oficial sincronizado en tiempo real");
      return {
        success: true,
        message: `¡Catálogo oficial de PulsoTech restaurado exitosamente en la nube con ${DEFAULT_PRODUCTS.length} modelos originales!`,
      };
    } catch (err) {
      console.error("Error al restaurar catálogo oficial:", err);
      return { success: false, message: "Error al restaurar catálogo oficial en Supabase." };
    }
  }, []);

  const testConnection = useCallback(async () => {
    return await testSupabaseConnection();
  }, []);

  // Inicialización y suscripción en tiempo real
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (isMounted) {
        await refreshFromCloud();
      }
    };
    void init();

    // Suscripción Realtime en Supabase si está disponible
    const client = getSupabaseClient();
    if (client) {
      const channel = client
        .channel("realtime-products-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "products" },
          () => {
            fetchProductsFromSupabase().then((data) => {
              if (data && Array.isArray(data) && isMounted) {
                setProducts(data);
                if (typeof window !== "undefined") {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                }
              }
            });
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        client.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [refreshFromCloud]);

  // Sincronizar storage entre pestañas cuando se usa modo local
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Mutaciones de Productos (Sincronizan tanto local como en Supabase)
  const addProduct = useCallback((newProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === newProduct.id);
      const next = exists ? prev.map((p) => (p.id === newProduct.id ? newProduct : p)) : [newProduct, ...prev];
      saveProductsLocal(next);
      return next;
    });

    if (isSupabaseReady()) {
      upsertProductToSupabase(newProduct).catch((err) => {
        console.error("Error guardando producto en Supabase:", err);
      });
    }
  }, [saveProductsLocal]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      saveProductsLocal(next);
      return next;
    });

    if (isSupabaseReady()) {
      upsertProductToSupabase(updatedProduct).catch((err) => {
        console.error("Error actualizando producto en Supabase:", err);
      });
    }
  }, [saveProductsLocal]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProductsLocal(next);
      return next;
    });

    if (isSupabaseReady()) {
      deleteProductFromSupabase(id).catch((err) => {
        console.error("Error eliminando producto en Supabase:", err);
      });
    }
  }, [saveProductsLocal]);

  const updateStock = useCallback((id: string, value: number, isDelta: boolean = false) => {
    let finalStock = 0;
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        finalStock = isDelta ? Math.max(0, p.stockCount + value) : Math.max(0, value);
        return {
          ...p,
          stockCount: finalStock,
          inStock: finalStock > 0,
        };
      });
      saveProductsLocal(next);
      return next;
    });

    if (isSupabaseReady()) {
      updateStockInSupabase(id, finalStock).catch((err) => {
        console.error("Error actualizando stock en Supabase:", err);
      });
    }
  }, [saveProductsLocal]);

  const addBrand = useCallback((newBrand: string) => {
    const trimmed = newBrand.trim();
    if (!trimmed) return;
    setBrands((prev) => {
      if (prev.some((b) => b.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, trimmed];
      if (typeof window !== "undefined") {
        localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(next));
      }
      if (isSupabaseReady()) {
        saveStoreSettingsToSupabase("brands", next).catch(console.error);
      }
      return next;
    });
  }, []);

  const deleteBrand = useCallback((brandToDelete: string) => {
    setBrands((prev) => {
      const next = prev.filter((b) => b.toLowerCase() !== brandToDelete.toLowerCase());
      if (typeof window !== "undefined") {
        localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(next));
      }
      if (isSupabaseReady()) {
        saveStoreSettingsToSupabase("brands", next).catch(console.error);
      }
      return next;
    });
  }, []);

  const addCategory = useCallback((newCategory: string) => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, trimmed];
      if (typeof window !== "undefined") {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(next));
      }
      if (isSupabaseReady()) {
        saveStoreSettingsToSupabase("categories", next).catch(console.error);
      }
      return next;
    });
  }, []);

  const deleteCategory = useCallback((categoryToDelete: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.toLowerCase() !== categoryToDelete.toLowerCase());
      if (typeof window !== "undefined") {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(next));
      }
      if (isSupabaseReady()) {
        saveStoreSettingsToSupabase("categories", next).catch(console.error);
      }
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    saveProductsLocal(DEFAULT_PRODUCTS);
    if (isSupabaseReady()) {
      syncLocalToCloud().catch(console.error);
    }
  }, [saveProductsLocal, syncLocalToCloud]);

  const exportProductsJson = useCallback(() => {
    return JSON.stringify(products, null, 2);
  }, [products]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        resetToDefault,
        exportProductsJson,
        brands,
        addBrand,
        deleteBrand,
        categories,
        addCategory,
        deleteCategory,
        isCloudConfigured,
        isCloudConnected,
        cloudStatus,
        connectSupabase,
        disconnectSupabase,
        syncLocalToCloud,
        restoreOfficialCatalogToCloud,
        refreshFromCloud,
        testConnection,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts debe usarse dentro de un ProductsProvider");
  }
  return context;
}
