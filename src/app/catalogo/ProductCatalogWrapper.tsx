"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCatalog from "@/components/ProductCatalog";

export default function ProductCatalogWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoria = searchParams.get("categoria") || "todos";

  const handleCategoryChange = (newCat: string) => {
    router.push(`/catalogo?categoria=${encodeURIComponent(newCat)}`, { scroll: false });
  };

  return <ProductCatalog externalSelectedCategory={categoria} onCategoryChange={handleCategoryChange} />;
}
