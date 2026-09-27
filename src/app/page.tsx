"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryNavShowcase from "@/components/CategoryNavShowcase";
import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      {/* 1. Main Navigation (64px / h-16) */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Primera pantalla completa (100dvh - 4rem de navbar):
            Contiene EXCLUSIVAMENTE el banner fotografico y la barra inferior de dibujos.
            El catalogo queda 100% debajo de la pantalla inicial sin asomarse. */}
        <section className="w-full flex flex-col justify-between h-[calc(100dvh-4rem)] min-h-[520px] bg-neutral-950 overflow-hidden">
          {/* El banner fotografico toma todo el espacio vertical disponible */}
          <div className="flex-1 w-full min-h-0 relative flex items-center">
            <HeroSection />
          </div>

          {/* Los dibujos de categorias quedan fijos en la base exacta de la primera pantalla */}
          <CategoryNavShowcase
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>

        {/* 2. Catálogo de productos: Solo visible al hacer scroll hacia abajo */}
        <ProductCatalog
          externalSelectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </main>

      {/* Clean Customer Footer */}
      <Footer />
    </div>
  );
}
