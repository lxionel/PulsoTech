"use client";

import { Check, GitCompareArrows } from "lucide-react";
import type { Product } from "@/types";
import { useComparison } from "@/context/ComparisonContext";
import { isAudioCategory } from "@/lib/categories";
import { COMPARISON_LIMIT } from "@/lib/comparison";

export default function CompareProductButton({ product }: { product: Product }) {
  const { selectedProducts, toggleProduct } = useComparison();
  if (!isAudioCategory(product.category || "")) return null;
  const isSelected = selectedProducts.some((item) => item.id === product.id);
  const limitReached = !isSelected && selectedProducts.length >= COMPARISON_LIMIT;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${isSelected ? "Quitar de la comparación" : "Comparar"}: ${product.name}`}
      disabled={limitReached}
      title={limitReached ? "Quita un modelo para comparar otro. Máximo 2 modelos." : undefined}
      onClick={() => toggleProduct(product.id)}
      className={`min-h-11 sm:min-h-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-colors active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${isSelected
        ? "bg-neutral-100 border-neutral-300 text-neutral-950"
        : "bg-white border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300"}`}
    >
      {isSelected ? <Check aria-hidden="true" className="w-3.5 h-3.5" /> : <GitCompareArrows aria-hidden="true" className="w-3.5 h-3.5" />}
      {isSelected ? "En comparación" : "Comparar"}
    </button>
  );
}
