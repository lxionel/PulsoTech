"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAssetUrl } from "@/utils/paths";
import { STORE_MODE } from "@/lib/commerce";

export default function HeroSection() {
  return (
    <div className="store-motion relative w-full min-h-[460px] sm:h-full sm:min-h-[340px] overflow-hidden bg-neutral-950 select-none flex items-center">
      {/* Background Panoramic Photography en maxima resolucion */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getAssetUrl("/images/banners/hero-tech-2.jpg")}
          alt="Audífonos y accesorios tecnológicos de PulsoTech"
          fill
          priority
          sizes="100vw"
          quality={100}
          className="object-cover object-[72%_center] sm:object-[70%_center] md:object-[68%_center] lg:object-[68%_center] select-none"
        />

        {/* Gradiente sutil para legibilidad del texto sin oscurecer los productos de la derecha */}
        <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-neutral-950/95 via-neutral-950/70 to-neutral-950/20 sm:bg-gradient-to-r sm:from-neutral-950 sm:via-neutral-950/80 sm:to-transparent sm:w-1/2 lg:w-[48%]" />
      </div>

      {/* En móvil, el contenido se centra en el espacio debajo de la cabecera. */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 w-full pt-16 sm:pt-20 pb-0 sm:pb-8">
        <div className="store-hero-copy max-w-[340px] sm:max-w-[440px] mx-auto sm:mx-0 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 sm:space-y-4">
          {/* Badge original: Fondo negro y letras blancas, limpio y sin punto */}
          <div>
            <span className="inline-block px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-950 text-white shadow-xs border border-white/10 sm:border-transparent">
              {STORE_MODE === "preparation" ? "APERTURA 2027" : "STOCK DISPONIBLE"}
            </span>
          </div>

          {/* Título breve, con saltos equilibrados en móvil. */}
          <h1 className="text-[clamp(2rem,8.2vw,2.75rem)] sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.12] text-white text-balance sm:text-wrap">
            Tecnología para tu día a día
          </h1>

          {/* Subtitulo */}
          <p className="text-sm sm:text-sm lg:text-[15px] leading-relaxed font-normal max-w-sm sm:max-w-md text-neutral-200 sm:text-neutral-300">
            Pedidos por WhatsApp y entregas coordinadas en Chimbote.
          </p>

          {/* Boton de accion verde interactivo con brillo y desplazamiento al pasar el cursor */}
          <div className="pt-1.5 sm:pt-2">
            <Link
              href="#catalogo"
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-xl hover:shadow-green-950/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <span aria-hidden="true" className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full group-focus-visible:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
              <span>VER CATÁLOGO</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
