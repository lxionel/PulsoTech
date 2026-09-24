"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAssetUrl } from "@/utils/paths";

export default function HeroSection() {
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
    </section>
  );
}
