"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProducts } from "@/context/ProductsContext";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductLoading from "@/components/ProductLoading";
import { legacyProductIdentifier, resolvePublicProduct } from "@/lib/product-routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const { products, isLoading } = useProducts();
  const identifier = legacyProductIdentifier(usePathname());
  // Resolve on every catalog update; browser caches cannot revive hidden or deleted products.
  const matchedProduct = resolvePublicProduct(products, null, identifier);

  // Si se encontró el producto a partir de la URL dinámica, renderizar la ficha directamente
  if (matchedProduct) {
    return <ProductDetailClient key={matchedProduct.id} product={matchedProduct} />;
  }

  if (identifier && isLoading) return <ProductLoading />;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-neutral-950 mb-2">Página no encontrada</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-sm">
          No pudimos encontrar el producto o la página solicitada. Puede que haya sido movido o eliminado.
        </p>
        <Link
          href="/#catalogo"
          className="px-6 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo Comercial</span>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
