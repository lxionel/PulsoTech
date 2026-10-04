"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AudioBannerSlider() {
  return (
    <div role="region" aria-label="Sección de audífonos" className="store-motion w-full bg-neutral-950 text-white">
      <div className="store-hero-copy max-w-3xl mx-auto px-6 pt-28 pb-12 sm:pt-28 sm:pb-14 min-h-[360px] flex flex-col items-center justify-center gap-7 sm:gap-8 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.05]">Audífonos</h1>
        <Link href="#catalogo" className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200">
          Ver audífonos
          <ArrowRight aria-hidden="true" className="w-4 h-4 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
