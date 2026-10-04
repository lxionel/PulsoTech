"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/types";
import { useProducts } from "@/context/ProductsContext";
import { isAudioCategory } from "@/lib/categories";
import { resolveComparisonProducts, toggleComparisonSelection } from "@/lib/comparison";

interface ComparisonContextValue {
  selectedProducts: Product[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleProduct: (id: string) => void;
  clearSelection: () => void;
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const eligibleProducts = useMemo(() => products.filter((product) => isAudioCategory(product.category || "")), [products]);
  const selectedProducts = useMemo(() => resolveComparisonProducts(selectedIds, eligibleProducts), [selectedIds, eligibleProducts]);

  const toggleProduct = (id: string) => {
    if (!eligibleProducts.some((product) => product.id === id)) return;
    setIsOpen(false);
    setSelectedIds((previous) => toggleComparisonSelection(
      resolveComparisonProducts(previous, eligibleProducts).map((product) => product.id), id
    ));
  };

  const clearSelection = () => {
    setIsOpen(false);
    setSelectedIds([]);
  };

  return (
    <ComparisonContext.Provider value={{ selectedProducts, isOpen, setIsOpen, toggleProduct, clearSelection }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) throw new Error("useComparison must be used within ComparisonProvider");
  return context;
}
