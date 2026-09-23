"use client";

import React from "react";
import Image from "next/image";
import { ArrowDown, MessageSquare, ShieldCheck, Truck, Sparkles, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS, STORE_SETTINGS } from "@/data/products";

export default function HeroSection() {
  const { whatsappNumber, setSelectedProductForModal } = useCart();

  // Star product for the commercial showcase card: Redmi Buds 8 Lite
  const featuredProduct = PRODUCTS.find((p) => p.id === "redmi-buds-8-lite") || PRODUCTS[0];

  return (
    <section className="relative overflow-hidden pt-8 pb-12 md:pt-12 md:pb-16 bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Commercial Pitch */}
          <div className="lg:col-span-7 space-y-5">
            {/* Store Location Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tienda Local en Chimbote · Stock Disponible</span>
            </div>

            {/* Main Retail Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]">
              Audífonos originales. <br />
              <span className="text-neutral-500 font-semibold">
                Calidad de sonido al mejor precio directo.
              </span>
            </h1>

            {/* Commercial Body */}
            <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed font-normal">
              En <strong>PulsoTech</strong> encuentras modelos 100% auténticos sellados de fábrica con garantía de funcionamiento. Compra con total seguridad y paga contra entrega al recibir tu pedido en Chimbote.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#catalogo"
                className="px-6 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 transition-all font-semibold text-xs flex items-center gap-2 shadow-md active:scale-95"
              >
                <span>Explorar Catálogo Completo</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "¡Hola PulsoTech! Deseo consultar sobre la disponibilidad de audífonos y pedidos en Chimbote."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-medium text-xs transition-colors flex items-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pedir por WhatsApp</span>
              </a>
            </div>

            {/* Quick Trust Checklist */}
            <div className="pt-2 flex flex-wrap gap-y-2 gap-x-5 text-xs text-neutral-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Entrega hoy en Chimbote</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Empaque sellado original</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Efectivo o Yape al recibir</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Product Commercial Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-lg shadow-neutral-900/5 hover:border-neutral-300 transition-all">
              {/* Card Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Modelo Destacado
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  En Stock Chimbote
                </span>
              </div>

              {/* Product Visual */}
              <div className="relative aspect-4/3 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center p-6 overflow-hidden group">
                <div className="absolute inset-0 bg-radial from-neutral-200/40 via-transparent to-transparent opacity-60" />
                <Image
                  src={featuredProduct.colors[0]?.image || "/placeholder-earbuds.svg"}
                  alt={featuredProduct.name}
                  width={240}
                  height={180}
                  className="w-44 h-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Product Information */}
              <div className="mt-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                      {featuredProduct.brand}
                    </span>
                    <h3 className="text-xl font-extrabold text-neutral-950 tracking-tight">
                      {featuredProduct.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase block font-sans">Precio Directo</span>
                    <span className="text-2xl font-extrabold text-neutral-950 font-mono tracking-tight">
                      {STORE_SETTINGS.currencySymbol}
                      {featuredProduct.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Key Spec Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200/80">
                    Batería: {featuredProduct.specs.battery}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200/80">
                    ANC: {featuredProduct.specs.anc}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200/80">
                    Certificación: IP54
                  </span>
                </div>

                {/* Card Action */}
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedProductForModal(featuredProduct)}
                    className="w-full py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 active:scale-98 shadow-xs"
                  >
                    <span>Ver Especificaciones y Comprar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
