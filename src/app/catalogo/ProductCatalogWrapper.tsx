"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Truck, CheckCircle2 } from "lucide-react";
import { getAssetUrl } from "@/utils/paths";
import CategoryNavShowcase from "@/components/CategoryNavShowcase";
import ProductCatalog from "@/components/ProductCatalog";

import AudioBannerSlider from "@/components/AudioBannerSlider";

interface CategoryMeta {
  key: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  trustItems: { icon: React.ElementType; label: string }[];
}

const CATEGORY_DATA: Record<string, CategoryMeta> = {
  audifonos: {
    key: "audifonos",
    badge: "STOCK DISPONIBLE • COLECCIÓN DE AUDIO",
    title: "¡Audífonos y Sonido Original!",
    subtitle:
      "Modelos originales en caja sellada de fábrica, sonido inmersivo de alta fidelidad, garantía total y pago contra entrega.",
    image: "/images/banners/hero-audio-slider-1.png",
    trustItems: [
      { icon: ShieldCheck, label: "100% Caja Sellada" },
      { icon: Zap, label: "Garantía Real PulsoTech" },
      { icon: Truck, label: "Pago Contra Entrega" },
      { icon: CheckCircle2, label: "Entrega Inmediata" },
    ],
  },
  cargadores: {
    key: "cargadores",
    badge: "STOCK DISPONIBLE • ENERGÍA Y CARGA",
    title: "¡Cargadores y Baterías Portátiles!",
    subtitle:
      "Powerbanks de alta capacidad y cubos de carga rápida certificados, sellados de fábrica con garantía total.",
    image: "/images/banners/hero-tech-1.png",
    trustItems: [
      { icon: ShieldCheck, label: "Carga Rápida Certificada" },
      { icon: Zap, label: "Garantía Real PulsoTech" },
      { icon: Truck, label: "Pago Contra Entrega" },
      { icon: CheckCircle2, label: "Entrega Inmediata" },
    ],
  },
  default: {
    key: "default",
    badge: "STOCK DISPONIBLE",
    title: "¡Tecnología y Audio Original!",
    subtitle:
      "Caja sellada de fábrica, garantía total y pago contra entrega en todo Lima.",
    image: "/images/banners/hero-tech-2.jpg",
    trustItems: [
      { icon: ShieldCheck, label: "100% Caja Sellada" },
      { icon: Zap, label: "Garantía Real PulsoTech" },
      { icon: Truck, label: "Pago Contra Entrega" },
      { icon: CheckCircle2, label: "Entrega Inmediata" },
    ],
  },
};

function getCategoryMeta(categoryQuery: string): CategoryMeta {
  const cat = (categoryQuery || "").toLowerCase();
  if (
    cat.includes("audífon") ||
    cat.includes("audifon") ||
    cat.includes("audio") ||
    cat.includes("auricular")
  ) {
    return CATEGORY_DATA.audifonos;
  }
  if (
    cat.includes("cargador") ||
    cat.includes("powerbank") ||
    cat.includes("batería") ||
    cat.includes("bateria")
  ) {
    return CATEGORY_DATA.cargadores;
  }
  return CATEGORY_DATA.default;
}

export default function ProductCatalogWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoria = searchParams.get("categoria") || "todos";

  const meta = getCategoryMeta(categoria);

  const handleCategoryChange = (newCat: string) => {
    router.push(`/catalogo?categoria=${encodeURIComponent(newCat)}`, {
      scroll: false,
    });
  };

  return (
    <div className="w-full flex flex-col">
      {/* 1. Primera pantalla completa (100dvh - 4rem): Banner fotográfico + Barra de categorías */}
      <section className="w-full flex flex-col justify-between h-[calc(100dvh-4rem)] min-h-[540px] bg-neutral-950 overflow-hidden">
        <div className="flex-1 w-full min-h-0 relative flex items-center">
          {meta.key === "audifonos" ? (
            <AudioBannerSlider />
          ) : (
            <div className="relative w-full h-full min-h-[340px] overflow-hidden bg-neutral-950 select-none flex items-center">
              <div className="absolute inset-0 z-0">
                <Image
                  src={getAssetUrl(meta.image)}
                  alt={meta.title}
                  fill
                  priority
                  sizes="100vw"
                  quality={100}
                  className="object-cover object-[72%_center] sm:object-center select-none"
                />
                <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-neutral-950/90 via-neutral-950/50 to-neutral-950/20 sm:bg-gradient-to-r sm:from-neutral-950/90 sm:via-neutral-950/65 sm:to-transparent sm:w-3/5 lg:w-[48%]" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full py-6 sm:py-8">
                <div className="max-w-xl space-y-3 sm:space-y-4">
                  <div>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 hover:text-white drop-shadow-sm transition-colors group cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      <span>Volver al inicio</span>
                    </Link>
                  </div>

                  <p className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-emerald-400 drop-shadow-sm">
                    {meta.badge}
                  </p>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white drop-shadow-md">
                    {meta.title}
                  </h1>

                  <p className="text-xs sm:text-sm lg:text-base leading-relaxed font-normal max-w-lg text-neutral-200 drop-shadow-sm">
                    {meta.subtitle}
                  </p>

                  <div className="pt-1.5 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm font-bold text-white drop-shadow-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>100% Caja Sellada</span>
                    </span>
                    <span className="text-white/30 hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Garantía PulsoTech</span>
                    </span>
                    <span className="text-white/30 hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Pago Contra Entrega</span>
                    </span>
                    <span className="text-white/30 hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Entrega Inmediata</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Barra interactiva de los 4 dibujos estilizados de categorías */}
        <CategoryNavShowcase
          activeCategory={categoria}
          onSelectCategory={handleCategoryChange}
        />
      </section>

      {/* 3. Catálogo de productos filtrado para la categoría seleccionada */}
      <div className="w-full">
        <ProductCatalog
          externalSelectedCategory={categoria}
          onCategoryChange={handleCategoryChange}
        />
      </div>
    </div>
  );
}
