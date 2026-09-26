"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import {
  isSupabaseReady,
  fetchProductsFromSupabase,
  upsertProductToSupabase,
  deleteProductFromSupabase,
  updateStockInSupabase,
  fetchStoreSettingsFromSupabase,
  saveStoreSettingsToSupabase,
  getSupabaseClient,
  clearAllProductsFromSupabase,
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
  isCloudConnected: boolean;
  refreshFromCloud: () => Promise<void>;
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

  // Estado de Supabase Cloud
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

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
      setIsCloudConnected(false);
      return;
    }

    try {
      const cloudProds = await fetchProductsFromSupabase();
      if (cloudProds !== null) {
        setIsCloudConnected(true);

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
      }
    } catch (e) {
      console.error("Error en refreshFromCloud:", e);
      setIsCloudConnected(false);
    }
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
    setProducts((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      const nextStock = isDelta ? Math.max(0, target.stockCount + value) : Math.max(0, value);

      const next = prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          stockCount: nextStock,
          inStock: nextStock > 0,
        };
      });
      saveProductsLocal(next);

      if (isSupabaseReady()) {
        updateStockInSupabase(id, nextStock).catch((err) => {
          console.error("Error actualizando stock en Supabase:", err);
        });
      }

      return next;
    });
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
    saveProductsLocal([]);
    if (isSupabaseReady()) {
      clearAllProductsFromSupabase().catch(console.error);
    }
  }, [saveProductsLocal]);

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
        isCloudConnected,
        refreshFromCloud,
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
