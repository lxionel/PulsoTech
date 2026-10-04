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
      {/* Encabezado fijo y adaptado a la imagen que acompaña el scroll */}
      <Navbar isTransparent={true} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Primera pantalla completa (100dvh) */}
        <section id="inicio" className="relative w-full flex flex-col justify-between h-[100dvh] min-h-[520px] bg-neutral-950 overflow-hidden">
          {/* Banner fotográfico dinámico en alta resolución */}
          <div className="flex-1 w-full min-h-0 relative flex items-center">
            <HeroSection />
          </div>

          {/* Iconos de categorías fijos en la base de la primera pantalla */}
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
