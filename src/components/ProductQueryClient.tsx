"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/context/ProductsContext";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductLoading from "@/components/ProductLoading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { resolvePublicProduct } from "@/lib/product-routing";

function QueryProductContent() {
  const searchParams = useSearchParams();
  return <DynamicProductContent idParam={searchParams.get("id")} slugParam={searchParams.get("slug")} />;
}

function DynamicProductContent({ idParam, slugParam }: { idParam: string | null; slugParam: string | null }) {
  const { products, isLoading, isCloudConnected } = useProducts();

  const product = React.useMemo(() => resolvePublicProduct(products, idParam, slugParam), [idParam, slugParam, products]);

  if (!product && isLoading) {
    return <ProductLoading />;
  }
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-neutral-950 mb-2">{isCloudConnected ? "Producto no encontrado" : "No pudimos cargar el producto"}</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-sm">
            {isCloudConnected ? "El producto solicitado no está disponible o el enlace ha expirado." : "Revisa tu conexión y vuelve a cargar la página para consultar la disponibilidad actual."}
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

  return <ProductDetailClient key={product.id} product={product} />;
}

export default function ProductQueryClient({ initialId }: { initialId?: string }) {
  if (initialId) return <DynamicProductContent idParam={initialId} slugParam={null} />;
  return (
    <Suspense
      fallback={<ProductLoading />}
    >
      <QueryProductContent />
    </Suspense>
  );
}
