"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryNavShowcase from "@/components/CategoryNavShowcase";
import ProductCatalog from "@/components/ProductCatalog";
import AudioBannerSlider from "@/components/AudioBannerSlider";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";

export default function ProductCatalogWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoria = searchParams.get("categoria") || "todos";

  const isAudioCategory =
    categoria.toLowerCase().includes("audífon") ||
    categoria.toLowerCase().includes("audifon") ||
    categoria.toLowerCase().includes("audio") ||
    categoria.toLowerCase().includes("auricular");

  const handleCategoryChange = (newCat: string) => {
    router.push(`/catalogo/?categoria=${encodeURIComponent(newCat)}`, {
      scroll: false,
    });
  };

  return (
    <div className="w-full flex flex-col">
      {/* Encabezado fijo y adaptado a la imagen que acompaña el scroll */}
      <Navbar isTransparent={true} />

      {/* 1. Primera pantalla completa (100dvh) */}
      <section className="relative w-full flex flex-col justify-between h-[100dvh] min-h-[520px] bg-neutral-950 overflow-hidden">
        {/* El banner fotográfico toma todo el espacio vertical disponible */}
        <div className="flex-1 w-full min-h-0 relative flex items-center">
          {isAudioCategory ? <AudioBannerSlider /> : <HeroSection />}
        </div>

        {/* Los dibujos de categorías fijos en la base exacta de la primera pantalla sin cortarse */}
        <CategoryNavShowcase
          activeCategory={categoria}
          onSelectCategory={handleCategoryChange}
        />
      </section>

      {/* 2. Catálogo de productos filtrado para la categoría seleccionada */}
      <div className="w-full">
        <ProductCatalog
          externalSelectedCategory={categoria}
          onCategoryChange={handleCategoryChange}
        />
      </div>
    </div>
  );
}
