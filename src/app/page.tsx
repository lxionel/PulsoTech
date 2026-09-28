"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryNavShowcase from "@/components/CategoryNavShowcase";
import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      {/* Main Content */}
      <main className="flex-1">
        {/* Primera pantalla completa (100dvh) con Navbar integrado sobre la imagen */}
        <section className="relative w-full flex flex-col justify-between h-[100dvh] min-h-[520px] bg-neutral-950 overflow-hidden">
          {/* Navbar integrado sobre la imagen con diseño transparente y texto blanco */}
          <div className="absolute top-0 left-0 right-0 z-40">
            <Navbar isTransparent={true} />
          </div>

          {/* El banner fotográfico toma todo el espacio vertical disponible */}
          <div className="flex-1 w-full min-h-0 relative flex items-center">
            <HeroSection />
          </div>

          {/* Los dibujos de categorías fijos en la base exacta de la primera pantalla sin cortarse */}
          <CategoryNavShowcase />
        </section>

        {/* 2. Catálogo general de productos en la página principal */}
        <ProductCatalog />
      </main>

      {/* Clean Customer Footer */}
      <Footer />
    </div>
  );
}
