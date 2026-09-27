"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { getAssetUrl } from "@/utils/paths";

export default function HeroSection() {
  return (
    <section className="w-full bg-neutral-950">
      {/* Main Panoramic Hero Banner (Expanded large format with ultra-high quality rendering) */}
      <div className="relative w-full overflow-hidden bg-neutral-950 select-none h-[480px] sm:h-[580px] md:h-[640px] lg:h-[700px] xl:h-[740px] flex items-center">
        {/* Background Panoramic Photography in Full Resolution */}
        <div className="absolute inset-0 z-0">
          <Image
            src={getAssetUrl("/images/banners/hero-tech-2.jpg")}
            alt="PulsoTech Tecnología y Audio Original"
            fill
            priority
            sizes="100vw"
            quality={100}
            className="object-cover object-[72%_center] sm:object-[66%_center] md:object-[60%_center] lg:object-center select-none"
          />

          {/* Precision Gradient: Preserves product clarity on the right while ensuring text legibility on the left */}
          <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/20 sm:bg-gradient-to-r sm:from-neutral-950 sm:via-neutral-950/85 sm:to-transparent sm:w-1/2 lg:w-[48%]" />
        </div>

        {/* Foreground Commercial Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full">
          <div className="max-w-xl space-y-4 sm:space-y-6">
            {/* Status Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-950/95 text-white border border-white/20 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>STOCK DISPONIBLE</span>
              </span>
            </div>

            {/* Headline with expansive presence */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              ¡Tecnología y audio original!
            </h1>

            {/* Essential Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-lg text-neutral-200">
              Caja sellada de fábrica, garantía total y pago contra entrega.
            </p>

            {/* Commercial Action CTA Button */}
            <div className="pt-2 sm:pt-3">
              <Link
                href="#catalogo"
                className="inline-flex items-center gap-2.5 px-7 sm:px-9 py-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer"
              >
                <span>VER CATÁLOGO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-6 text-neutral-300 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Originales y sellados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Garantía oficial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pago contra entrega</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
