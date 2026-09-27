"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Truck, CheckCircle2 } from "lucide-react";
import { getAssetUrl } from "@/utils/paths";
import CategoryNavShowcase from "@/components/CategoryNavShowcase";
import ProductCatalog from "@/components/ProductCatalog";

import Headphone3DModel from "@/components/Headphone3DModel";

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
    badge: "STOCK DISPONIBLE • EXPERIENCIA 3D AUDIO",
    title: "¡Audífonos y Sonido Original!",
    subtitle:
      "Modelos originales en caja sellada de fábrica, sonido inmersivo de alta fidelidad, garantía total y pago contra entrega.",
    image: "/images/banners/hero-audio-1.jpg",
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
      {/* 1. Category Hero: 3D Interactivo para Audífonos, Fotográfico para otros */}
      {meta.key === "audifonos" ? (
        <section className="relative w-full min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] overflow-hidden bg-[#0a0b10] select-none flex items-center border-b border-neutral-800/60">
          {/* Ambient Studio Lighting Glow */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[480px] h-[480px] bg-sky-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-10 w-[360px] h-[360px] bg-blue-600/10 rounded-full blur-3xl" />
            {/* Subtle tech dot matrix */}
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full py-8 sm:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Left Column: Commercial Content */}
              <div className="lg:col-span-6 space-y-3.5 sm:space-y-4">
                <div>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all duration-200 group cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Volver al inicio</span>
                  </Link>
                </div>

                <div>
                  <span className="inline-block px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-950 text-white shadow-xs border border-white/15">
                    {meta.badge}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white">
                  {meta.title}
                </h1>

                <p className="text-xs sm:text-sm lg:text-base leading-relaxed font-normal text-neutral-300 max-w-lg">
                  {meta.subtitle}
                </p>

                {/* 3D Interaction helper badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-300 text-[11px] sm:text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>Modelo 3D en tiempo real: gira al hacer scroll o arrástralo</span>
                </div>

                {/* Píldoras de confianza y garantías */}
                <div className="pt-1 flex flex-wrap gap-2 sm:gap-2.5">
                  {meta.trustItems.map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-tight border border-white/10 shadow-2xs"
                    >
                      <item.icon className="w-3.5 h-3.5 text-neutral-200" />
                      <span>{item.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: 3D Interactive Model Canvas */}
              <div className="lg:col-span-6 w-full flex items-center justify-center">
                <Headphone3DModel />
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Standard Photographic Hero para las demás categorías */
        <section className="relative w-full h-[340px] sm:h-[400px] lg:h-[440px] overflow-hidden bg-neutral-950 select-none flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={getAssetUrl(meta.image)}
              alt={meta.title}
              fill
              priority
              sizes="100vw"
              quality={100}
              className="object-cover object-[75%_center] sm:object-[68%_center] md:object-[62%_center] lg:object-center select-none"
            />
            <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-neutral-950/95 via-neutral-950/75 to-neutral-950/30 sm:bg-gradient-to-r sm:from-neutral-950 sm:via-neutral-950/85 sm:to-transparent sm:w-3/5 lg:w-[52%]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full py-6 sm:py-8">
            <div className="max-w-xl space-y-3.5 sm:space-y-4">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-neutral-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all duration-200 group cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Volver al inicio</span>
                </Link>
              </div>

              <div>
                <span className="inline-block px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-950 text-white shadow-xs border border-white/15">
                  {meta.badge}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                {meta.title}
              </h1>

              <p className="text-xs sm:text-sm lg:text-base leading-relaxed font-normal max-w-lg text-neutral-200 sm:text-neutral-300">
                {meta.subtitle}
              </p>

              <div className="pt-1 flex flex-wrap gap-2 sm:gap-2.5">
                {meta.trustItems.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-tight border border-white/10 shadow-2xs"
                  >
                    <item.icon className="w-3.5 h-3.5 text-neutral-200" />
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Barra interactiva de los 4 dibujos estilizados de categorías */}
      <CategoryNavShowcase
        activeCategory={categoria}
        onSelectCategory={handleCategoryChange}
      />

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
