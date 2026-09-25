"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { Product } from "@/types";
import ProductDetailClient from "@/components/ProductDetailClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const { products } = useProducts();
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [isSearchingProduct, setIsSearchingProduct] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const pathname = window.location.pathname;
      // Detectar si la ruta intentaba abrir un producto: ej: /PulsoTech/producto/freebuds-se-2/ o /producto/freebuds-se-2
      const match = pathname.match(/\/producto\/([^/?#]+)/i);
      if (match && match[1]) {
        const slugOrId = decodeURIComponent(match[1]).replace(/\/$/, "").trim().toLowerCase();

        // 1. Buscar en products del contexto
        let found = products.find(
          (p) =>
            p.slug.toLowerCase() === slugOrId ||
            p.id.toLowerCase() === slugOrId ||
            p.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") === slugOrId
        );

        // 2. Si aún no está en contexto, buscar directamente en localStorage
        if (!found) {
          const raw = localStorage.getItem("pulsotech_custom_products");
          if (raw) {
            const list: Product[] = JSON.parse(raw);
            if (Array.isArray(list)) {
              found = list.find(
                (p) =>
                  p.slug?.toLowerCase() === slugOrId ||
                  p.id?.toLowerCase() === slugOrId ||
                  p.name?.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") === slugOrId
              );
            }
          }
        }

        if (found) {
          setMatchedProduct(found);
          setIsSearchingProduct(false);
          return;
        }
      }
    } catch (err) {
      console.error("Error matching route in not-found:", err);
    }

    setIsSearchingProduct(false);
  }, [products]);

  // Si se encontró el producto a partir de la URL dinámica, renderizar la ficha directamente
  if (matchedProduct) {
    return <ProductDetailClient product={matchedProduct} />;
  }

  if (isSearchingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-900 border-t-transparent" />
      </div>
    );
  }

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
