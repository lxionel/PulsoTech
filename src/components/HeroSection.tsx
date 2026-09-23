"use client";

import React from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function HeroSection() {
  const { whatsappNumber } = useCart();

  return (
    <section className="relative overflow-hidden pt-10 pb-12 md:pt-16 md:pb-16 border-b border-neutral-200/90 bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Pitch */}
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.08]">
            Audífonos originales. <br />
            <span className="text-neutral-500 font-semibold">
              El mejor sonido al precio más justo.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed font-normal">
            En <strong>PulsoTech</strong> seleccionamos y distribuimos audífonos 100% originales y accesorios de alta fidelidad. Modelos auténticos, garantía de funcionamiento y entrega el mismo día en Chimbote.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#catalogo"
              className="px-6 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 transition-all font-semibold text-xs flex items-center gap-2 shadow-md active:scale-95"
            >
              <span>Explorar Modelos Disponibles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                "¡Hola PulsoTech! Deseo consultar sobre la disponibilidad de audífonos."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-medium text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Coordinar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
