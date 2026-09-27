import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCatalogWrapper from "./ProductCatalogWrapper";

export default function CatalogoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      <Navbar />
      <main className="flex-1 bg-[#fbfbfd]">
        <Suspense fallback={<div className="p-8 text-center">Cargando catálogo...</div>}>
          <ProductCatalogWrapper />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
