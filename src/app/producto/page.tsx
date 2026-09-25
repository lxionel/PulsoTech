"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/context/ProductsContext";
import ProductDetailClient from "@/components/ProductDetailClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

function DynamicProductContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const slugParam = searchParams.get("slug");
  const { products } = useProducts();

  const product = React.useMemo(() => {
    if (idParam) {
      const match = products.find((p) => p.id === idParam);
      if (match) return match;
    }
    if (slugParam) {
      const cleanSlug = slugParam.toLowerCase().trim();
      const match = products.find(
        (p) =>
          p.slug.toLowerCase() === cleanSlug ||
          p.id.toLowerCase() === cleanSlug ||
          p.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") === cleanSlug
      );
      if (match) return match;
    }
    return null;
  }, [idParam, slugParam, products]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-neutral-950 mb-2">Producto no encontrado</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-sm">
            El producto solicitado no está disponible o el enlace ha expirado.
          </p>
          <Link
            href="/#catalogo"
            className="px-6 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}

export default function ProductQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-900 border-t-transparent" />
        </div>
      }
    >
      <DynamicProductContent />
    </Suspense>
  );
}
