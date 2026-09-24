"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar productos de localStorage al iniciar en el cliente
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pulsotech_custom_products");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
    } catch (err) {
      console.error("Error al cargar productos de localStorage:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Guardar en localStorage cada vez que cambien los productos tras la inicialización
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("pulsotech_custom_products", JSON.stringify(products));
    } catch (err) {
      console.error("Error al guardar productos en localStorage:", err);
    }
  }, [products, isInitialized]);

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateStock = (id: string, value: number, isDelta: boolean = false) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStock = isDelta
          ? Math.max(0, p.stockCount + value)
          : Math.max(0, value);
        return {
          ...p,
          stockCount: newStock,
          inStock: newStock > 0,
        };
      })
    );
  };

  const resetToDefault = () => {
    setProducts(DEFAULT_PRODUCTS);
    try {
      localStorage.removeItem("pulsotech_custom_products");
    } catch (err) {
      console.error("Error al reiniciar productos:", err);
    }
  };

  const exportProductsJson = () => {
    return JSON.stringify(products, null, 2);
  };

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
