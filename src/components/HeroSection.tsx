"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Headphones,
  Watch,
  Zap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { getAssetUrl } from "@/utils/paths";

export default function HeroSection() {
  const categories = [
    {
      icon: Headphones,
      label: "Audífonos",
      subtitle: "Inalámbricos TWS",
      href: "#catalogo",
    },
    {
      icon: Watch,
      label: "Smartwatches",
      subtitle: "Relojes & Pulseras",
      href: "#catalogo",
    },
    {
      icon: Zap,
      label: "Carga & Cables",
      subtitle: "GaN Inteligente",
      href: "#catalogo",
    },
    {
      icon: ShieldCheck,
      label: "Garantía Local",
      subtitle: "Envíos Directos",
      href: "#garantia",
    },
  ];

  return (
    <section className="w-full bg-white">
      {/* Main Panoramic Hero Banner (Fixed single image, no slider) */}
      <div className="relative w-full overflow-hidden bg-neutral-950 select-none h-[460px] sm:h-[520px] lg:h-[580px] flex items-center">
        {/* Background Panoramic Photography */}
        <div className="absolute inset-0 z-0">
          <Image
            src={getAssetUrl("/images/banners/hero-tech-2.jpg")}
            alt="PulsoTech Tecnología y Audio Original"
            fill
            priority
            className="object-cover object-center"
          />

          {/* Legibility Gradient Overlay (Left to Right) */}
          <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-r from-black/85 via-black/45 to-transparent lg:w-3/5" />
        </div>

        {/* Foreground Commercial Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-xl space-y-4 sm:space-y-5">
            {/* Badge: Fondo negro y letras blancas */}
            <div>
              <span className="inline-block px-3 py-1 rounded-md text-[11px] sm:text-xs font-black tracking-widest uppercase bg-neutral-950 text-white shadow-xs">
                STOCK DISPONIBLE
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
              ¡Tecnología y audio original!
            </h1>

            {/* Essential Subtitle */}
            <p className="text-xs sm:text-sm lg:text-base leading-relaxed font-normal max-w-lg text-neutral-300">
              Caja sellada de fábrica, garantía oficial y pago contra entrega.
            </p>

            {/* Action CTA Button: Verde solicitado con enlace al catálogo */}
            <div className="pt-2">
              <Link
                href="#catalogo"
                className="inline-flex items-center gap-2 px-8 py-3.5 sm:py-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span>VER CATÁLOGO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Iconic Categories Bar (Directly below hero banner) */}
      <div className="border-b border-neutral-200/80 bg-white py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center justify-center">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={cat.href}
                  className="group flex flex-col items-center justify-center text-center p-3 rounded-2xl hover:bg-neutral-50/80 transition-all cursor-pointer"
                >
                  {/* Clean Minimalist Line Icon */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-50 group-hover:bg-neutral-100 border border-neutral-200/70 group-hover:border-neutral-400 flex items-center justify-center text-neutral-900 group-hover:text-black group-hover:-translate-y-1 transition-all duration-300 shadow-2xs mb-2.5">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.6]" />
                  </div>

                  {/* Category Title */}
                  <h3 className="text-sm sm:text-base font-extrabold text-neutral-950 group-hover:text-black transition-colors">
                    {cat.label}
                  </h3>

                  {/* Category Subtitle */}
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {cat.subtitle}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
