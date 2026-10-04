"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryNavShowcase from "@/components/CategoryNavShowcase";
import ProductCatalog from "@/components/ProductCatalog";
import AudioBannerSlider from "@/components/AudioBannerSlider";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import { isAudioCategory } from "@/lib/categories";

export default function ProductCatalogWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoria = searchParams.get("categoria") || "todos";

  const showAudioBanner = isAudioCategory(categoria);

  const handleCategoryChange = (newCategory: string) => {
    router.push(`/catalogo/?categoria=${encodeURIComponent(newCategory)}#catalogo`);
  };

  const handleSectionChange = (newCat: string) => {
    if (newCat === categoria) {
      document.getElementById("seccion-categoria")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push(`/catalogo/?categoria=${encodeURIComponent(newCat)}#seccion-categoria`);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Encabezado fijo y adaptado a la imagen que acompaña el scroll */}
      <Navbar isTransparent={true} />

      {/* Audífonos usa una cabecera compacta; las otras vistas conservan su altura. */}
      <section id="seccion-categoria" className={`relative w-full flex flex-col justify-between bg-neutral-950 overflow-hidden ${showAudioBanner ? "" : "sm:h-[100dvh] sm:min-h-[520px]"}`}>
        {/* El banner fotográfico toma todo el espacio vertical disponible */}
        <div className="flex-1 w-full min-h-0 relative flex items-center">
          {showAudioBanner ? <AudioBannerSlider /> : <HeroSection />}
        </div>

        {/* Los dibujos de categorías fijos en la base exacta de la primera pantalla sin cortarse */}
        <CategoryNavShowcase
          activeCategory={categoria}
          onSelectCategory={handleSectionChange}
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
