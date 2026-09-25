"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import { PRODUCTS as DEFAULT_PRODUCTS } from "@/data/products";

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
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = "pulsotech_custom_products";
const DATA_VERSION_KEY = "pulsotech_catalog_data_version";
const CURRENT_DATA_VERSION = "2026_09_25_v7";

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

function syncWithDefaults(storedList: Product[]): Product[] {
  if (!Array.isArray(storedList) || storedList.length === 0) {
    return DEFAULT_PRODUCTS;
  }

  const updatedList = storedList.map((storedProd) => {
    const defaultMatch = DEFAULT_PRODUCTS.find(
      (dp) =>
        dp.id === storedProd.id ||
        dp.slug === storedProd.slug ||
        (storedProd.name && dp.name.toLowerCase() === storedProd.name.toLowerCase())
    );

    // Asegurar que todo ID sea numérico de 6 dígitos
    let safeId = storedProd.id;
    if (!safeId || !/^\d{6}$/.test(safeId)) {
      safeId = defaultMatch ? defaultMatch.id : Math.floor(100000 + Math.random() * 900000).toString();
    }

    if (!defaultMatch) {
      // Producto creado por el admin: se preserva íntegramente
      return {
        ...storedProd,
        id: safeId,
      };
    }

    // Para productos de catálogo base: preservar las modificaciones del usuario
    const hasOutdatedColors =
      !storedProd.colors ||
      storedProd.colors.length <= 1 ||
      (storedProd.colors.length === 1 && storedProd.colors[0]?.name === "Original") ||
      storedProd.colors.length < defaultMatch.colors.length;

    return {
      ...defaultMatch,
      ...storedProd,
      id: safeId,
      colors: hasOutdatedColors ? defaultMatch.colors : (storedProd.colors || defaultMatch.colors),
      images: storedProd.images && storedProd.images.length > 0 ? storedProd.images : defaultMatch.images,
      customSpecs: storedProd.customSpecs && storedProd.customSpecs.length > 0 ? storedProd.customSpecs : defaultMatch.customSpecs,
    };
  });

  // Asegurar que no falte ningún producto de DEFAULT_PRODUCTS
  DEFAULT_PRODUCTS.forEach((dp) => {
    if (!updatedList.some((p) => p.id === dp.id || p.slug === dp.slug)) {
      updatedList.push(dp);
    }
  });

  return updatedList;
}

function getInitialProducts(): Product[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const version = localStorage.getItem(DATA_VERSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const synced = syncWithDefaults(parsed);
          if (version !== CURRENT_DATA_VERSION) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
            localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
          }
          return synced;
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }
  return DEFAULT_PRODUCTS;
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(getInitialProducts);

  // Sincronizar entre pestañas y recargas
  useEffect(() => {
    // 1. Cargar y sincronizar al montar en el cliente
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const version = localStorage.getItem(DATA_VERSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const synced = syncWithDefaults(parsed);
          setProducts(synced);
          if (version !== CURRENT_DATA_VERSION) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
            localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
          }
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Escuchar cambios de storage entre pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    // 3. Escuchar evento personalizado en la misma ventana
    const handleCustomUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("pulsotech_products_updated", handleCustomUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pulsotech_products_updated", handleCustomUpdate);
    };
  }, []);

  const saveProducts = useCallback((newProducts: Product[]) => {
    setProducts(newProducts);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        window.dispatchEvent(new Event("pulsotech_products_updated"));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
    }
  }, []);

  const addProduct = useCallback((newProduct: Product) => {
    setProducts((prev) => {
      const next = [newProduct, ...prev.filter((p) => p.id !== newProduct.id)];
      saveProducts(next);
      return next;
    });
  }, [saveProducts]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      saveProducts(next);
      return next;
    });
  }, [saveProducts]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProducts(next);
      return next;
    });
  }, [saveProducts]);

  const updateStock = useCallback((id: string, value: number, isDelta: boolean = false) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const newStock = isDelta
          ? Math.max(0, p.stockCount + value)
          : Math.max(0, value);
        return {
          ...p,
          stockCount: newStock,
          inStock: newStock > 0,
        };
      });
      saveProducts(next);
      return next;
    });
  }, [saveProducts]);

  const [brands, setBrands] = useState<string[]>(getInitialBrands);
  const [categories, setCategories] = useState<string[]>(getInitialCategories);

  // Sincronizar marcas y categorías al montar
  useEffect(() => {
    try {
      const storedB = localStorage.getItem(BRANDS_STORAGE_KEY);
      if (storedB) {
        const parsed = JSON.parse(storedB);
        if (Array.isArray(parsed) && parsed.length > 0) setBrands(parsed);
      }
      const storedC = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedC) {
        const parsed = JSON.parse(storedC);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addBrand = useCallback((newBrand: string) => {
    const trimmed = newBrand.trim();
    if (!trimmed) return;
    setBrands((prev) => {
      if (prev.some((b) => b.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, trimmed];
      if (typeof window !== "undefined") {
        localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(next));
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
      return next;
    });
  }, []);

  const deleteCategory = useCallback((categoryToDelete: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.toLowerCase() !== categoryToDelete.toLowerCase());
      if (typeof window !== "undefined") {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    saveProducts(DEFAULT_PRODUCTS);
  }, [saveProducts]);

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
