"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Product } from "@/types";
import { createMutationQueue, confirmMutation } from "@/lib/confirmed-mutation";
import { validateProductContent } from "@/lib/content-security";
import { productForCache } from "@/lib/browser-cache";
import { PRODUCTS } from "@/data/products";
import {
  isSupabaseReady,
  fetchProductsFromSupabase,
  createProductInSupabase,
  updateProductInSupabase,
  renameProductGroupInSupabase,
  deleteProductFromSupabase,
  updateStockInSupabase,
  fetchStoreSettingsFromSupabase,
  saveStoreSettingsToSupabase,
  getSupabaseClient,
} from "@/lib/supabase";

interface ProductsContextType {
  isLoading: boolean;
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, deltaOrExact: number, isDelta?: boolean) => Promise<void>;
  applyConfirmedStock: (stock: { id: string; stockCount: number; inStock: boolean }) => void;
  exportProductsJson: () => string;
  brands: string[];
  addBrand: (brand: string) => Promise<void>;
  updateBrand: (oldBrand: string, newBrand: string) => Promise<void>;
  deleteBrand: (brand: string) => Promise<void>;
  categories: string[];
  addCategory: (category: string) => Promise<void>;
  updateCategory: (oldCategory: string, newCategory: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  isCloudConnected: boolean;
  refreshFromCloud: () => Promise<Product[] | null>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = "pulsotech_custom_products";
const DATA_VERSION_KEY = "pulsotech_catalog_data_version";
const CURRENT_DATA_VERSION = "2026_09_29_v2_clean";

const BRANDS_STORAGE_KEY = "pulsotech_custom_brands";
const CATEGORIES_STORAGE_KEY = "pulsotech_custom_categories";
const DEFAULT_BRANDS = ["Xiaomi", "Redmi", "Soundcore", "Haylou", "Sony"];
const DEFAULT_CATEGORIES = ["Audífonos Inalámbricos", "Smartwatches", "Cargadores Portátiles", "Periféricos PC", "Accesorios"];

function getInitialBrands(): string[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(BRANDS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
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
        if (Array.isArray(parsed)) return parsed;
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
  return PRODUCTS;
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  // The server and the first client render must match. Restore saved data after mount.
  const [products, setProductsState] = useState<Product[]>(PRODUCTS);
  const [brands, setBrandsState] = useState<string[]>(DEFAULT_BRANDS);
  const [categories, setCategoriesState] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  const state = useRef({ products, brands, categories });
  const [enqueue] = useState(() => createMutationQueue());
  const setProducts = useCallback((next: Product[]) => { state.current.products = next; setProductsState(next); }, []);
  const setBrands = useCallback((next: string[]) => { state.current.brands = next; setBrandsState(next); }, []);
  const setCategories = useCallback((next: string[]) => { state.current.categories = next; setCategoriesState(next); }, []);

  // Estado de Supabase Cloud
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Guardar en localStorage de respaldo
  const saveProductsLocal = useCallback((newProducts: Product[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isSupabaseReady() ? newProducts.map(productForCache) : newProducts));
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
      return null;
    }

    try {
      const [cloudProds, cloudSettings] = await Promise.all([
        fetchProductsFromSupabase(),
        fetchStoreSettingsFromSupabase(),
      ]);
      if (cloudProds !== null) {
        setIsCloudConnected(true);
        setProducts(cloudProds);
        saveProductsLocal(cloudProds);

        // Cargar marcas y categorías de la nube si existen
        if (cloudSettings) {
          if (Array.isArray(cloudSettings.brands)) {
            setBrands(cloudSettings.brands);
          }
          if (Array.isArray(cloudSettings.categories)) {
            setCategories(cloudSettings.categories);
          }
        }
        return cloudProds;
      } else {
        setIsCloudConnected(false);
      }
    } catch (e) {
      console.error("Error en refreshFromCloud:", e);
      setIsCloudConnected(false);
    }
    return null;
  }, [saveProductsLocal, setProducts, setBrands, setCategories]);

  // Inicialización y suscripción en tiempo real
  useEffect(() => {
    let isMounted = true;

    const timer = window.setTimeout(() => {
      setProducts(isSupabaseReady() ? PRODUCTS : getInitialProducts());
      setBrands(getInitialBrands());
      setCategories(getInitialCategories());
      void refreshFromCloud().finally(() => {
        if (isMounted) setIsLoading(false);
      });
    }, 0);

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
                saveProductsLocal(data);
              }
            });
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        window.clearTimeout(timer);
        client.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [refreshFromCloud, saveProductsLocal, setProducts, setBrands, setCategories]);

  // Sincronizar storage entre pestañas cuando se usa modo local
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // A compact local cache must never replace the full cloud galleries in another tab.
      if (isSupabaseReady()) return;
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
  }, [setProducts]);

  const commitProducts = useCallback((next: Product[]) => {
    state.current.products = next; setProducts(next); saveProductsLocal(next);
  }, [saveProductsLocal, setProducts]);

  const writeConfirmed = useCallback(async (write: () => Promise<boolean>, commit: () => void) => {
    if (isSupabaseReady()) await confirmMutation(write, commit);
    else commit();
  }, []);

  const addProduct = useCallback((product: Product) => enqueue(async () => {
    validateProductContent(product);
    if (state.current.products.some((item) => item.id === product.id)) throw new Error("El código de producto ya existe.");
    await writeConfirmed(() => createProductInSupabase(product), () => commitProducts([product, ...state.current.products]));
  }), [enqueue, writeConfirmed, commitProducts]);

  const updateProduct = useCallback((product: Product) => enqueue(async () => {
    validateProductContent(product);
    if (!state.current.products.some((item) => item.id === product.id)) throw new Error("El producto ya no existe. Actualiza el inventario.");
    await writeConfirmed(() => updateProductInSupabase(product), () => commitProducts(state.current.products.map((item) => item.id === product.id ? product : item)));
  }), [enqueue, writeConfirmed, commitProducts]);

  const deleteProduct = useCallback((id: string) => enqueue(async () => {
    await writeConfirmed(() => deleteProductFromSupabase(id), () => commitProducts(state.current.products.filter((item) => item.id !== id)));
  }), [enqueue, writeConfirmed, commitProducts]);

  const updateStock = useCallback((id: string, value: number, isDelta = false) => enqueue(async () => {
    const target = state.current.products.find((item) => item.id === id);
    if (!target) throw new Error("El producto ya no existe.");
    const stock = isDelta ? Math.max(0, target.stockCount + value) : value;
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 1e6) throw new Error("El stock debe ser un número entero entre 0 y 1 000 000.");
    try {
      await writeConfirmed(() => updateStockInSupabase(id, stock, target.stockCount), () => commitProducts(state.current.products.map((item) => item.id === id ? { ...item, stockCount: stock, inStock: stock > 0 } : item)));
    } catch {
      await refreshFromCloud();
      throw new Error("No se confirmó el stock. Puede haber cambiado desde otro dispositivo o una venta. Revisa el inventario y vuelve a intentarlo.");
    }
  }), [enqueue, writeConfirmed, commitProducts, refreshFromCloud]);

  // A receipt from the sales transaction is already persisted; do not write it again.
  const applyConfirmedStock = useCallback((stock: { id: string; stockCount: number; inStock: boolean }) => {
    if (!Number.isSafeInteger(stock.stockCount) || stock.stockCount < 0) return;
    commitProducts(state.current.products.map((item) => item.id === stock.id ? { ...item, ...stock } : item));
  }, [commitProducts]);

  const changeGroup = useCallback((field: "brand" | "category", action: "add" | "rename" | "delete", name: string, replacement = "") => enqueue(async () => {
    const key = field === "brand" ? "brands" : "categories";
    const storageKey = field === "brand" ? BRANDS_STORAGE_KEY : CATEGORIES_STORAGE_KEY;
    const previous = state.current[key];
    const trimmed = (action === "rename" ? replacement : name).trim();
    if (!trimmed || trimmed.length > 100) throw new Error("El nombre debe tener entre 1 y 100 caracteres.");
    const equal = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase();
    if (action !== "delete" && previous.some((item) => equal(item, trimmed) && !(action === "rename" && equal(item, name)))) throw new Error("Ya existe un elemento con ese nombre.");
    const matching = state.current.products.filter((product) => equal(product[field], name));
    if (action === "delete" && matching.length) throw new Error("Primero asigna otra marca o categoría a los productos que usan este nombre.");
    const next = action === "add" ? [...previous, trimmed] : action === "rename" ? previous.map((item) => equal(item, name) ? trimmed : item) : previous.filter((item) => !equal(item, name));
    if (isSupabaseReady()) {
      if (action === "rename" && !await renameProductGroupInSupabase(field, matching.map((product) => product.id), trimmed)) throw new Error("No se pudo actualizar la clasificación de los productos.");
      if (!await saveStoreSettingsToSupabase(key, next)) {
        await refreshFromCloud();
        throw new Error(action === "rename" ? "Algunos productos pueden haber cambiado de clasificación, pero no se guardó la lista. Revisa el inventario y vuelve a guardar el nombre." : "No se guardó la lista. Revisa tu conexión y tu sesión.");
      }
    }
    state.current[key] = next;
    if (field === "brand") setBrands(next); else setCategories(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* The cloud remains authoritative. */ }
    if (action === "rename") commitProducts(state.current.products.map((product) => equal(product[field], name) ? { ...product, [field]: trimmed } : product));
  }), [enqueue, commitProducts, refreshFromCloud, setBrands, setCategories]);

  const addBrand = useCallback((name: string) => changeGroup("brand", "add", name), [changeGroup]);
  const updateBrand = useCallback((name: string, next: string) => changeGroup("brand", "rename", name, next), [changeGroup]);
  const deleteBrand = useCallback((name: string) => changeGroup("brand", "delete", name), [changeGroup]);
  const addCategory = useCallback((name: string) => changeGroup("category", "add", name), [changeGroup]);
  const updateCategory = useCallback((name: string, next: string) => changeGroup("category", "rename", name, next), [changeGroup]);
  const deleteCategory = useCallback((name: string) => changeGroup("category", "delete", name), [changeGroup]);

  const exportProductsJson = useCallback(() => {
    return JSON.stringify(products, null, 2);
  }, [products]);

  return (
    <ProductsContext.Provider
      value={{
        isLoading,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        applyConfirmedStock,
        exportProductsJson,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
        categories,
        addCategory,
        updateCategory,
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
