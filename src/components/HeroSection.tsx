"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Headphones,
  Volume2,
  Sparkles,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";

export default function HeroSection() {
  const { whatsappNumber } = useCart();

  // Featured models for interactive showcase
  const heroProducts = [
    {
      id: "redmi-buds-6-play",
      name: "Redmi Buds 6 Play",
      tagline: "36h de batería · Ligero y potente",
      price: 49.0,
      image: getAssetUrl("/images/products/redmi-buds-6-play.png"),
      slug: "redmi-buds-6-play",
      badge: "Más Accesible",
      highlight: "Bluetooth 5.4 · 36h Batería",
    },
    {
      id: "redmi-buds-8-lite",
      name: "Redmi Buds 8 Lite",
      tagline: "Cancelación activa de ruido 42dB",
      price: 89.0,
      image: getAssetUrl("/images/products/redmi-buds-8-lite.png"),
      slug: "redmi-buds-8-lite",
      badge: "Más Vendido",
      highlight: "ANC 42dB · Resistencia IP54",
    },
    {
      id: "redmi-buds-7s",
      name: "Redmi Buds 7S",
      tagline: "Sonido Hi-Res y cancelación dual",
      price: 139.0,
      image: getAssetUrl("/images/products/redmi-buds-7s.png"),
      slug: "redmi-buds-7s",
      badge: "Gama Alta",
      highlight: "Cancelación Activa Dual · Hi-Res",
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(1); // Default to Buds 8 Lite
  const activeProduct = heroProducts[selectedIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/60 to-[#fbfbfd] pt-6 pb-14 md:pt-10 md:pb-16 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Banner Hero (Luminous Retail Split Card) */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-neutral-50/80 to-blue-50/40 border border-neutral-200/90 shadow-sm p-6 sm:p-10 lg:p-12 overflow-hidden mb-12">
          {/* Ambient Lighting Accents */}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Commercial Proposition */}
            <div className="lg:col-span-7 space-y-5">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Tienda Oficial en Chimbote · Stock Sellado</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]">
                Tecnología, audio y accesorios originales
                <span className="text-blue-600 block sm:inline"> al mejor precio.</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal max-w-xl">
                En <strong>PulsoTech</strong> seleccionamos dispositivos garantizados en caja sellada de fábrica. Comienza explorando nuestro catálogo de audífonos con entrega el mismo día y pago seguro contra entrega en Chimbote.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#catalogo"
                  className="px-6 py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <span>Ver Catálogo Disponible</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    "¡Hola PulsoTech! Deseo consultar sobre los productos disponibles y entregas en Chimbote."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white text-white" />
                  <span>Pedir por WhatsApp</span>
                </a>
              </div>

              {/* Value checklist */}
              <div className="pt-2 flex flex-wrap gap-y-2 gap-x-6 text-xs text-neutral-600 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Empaque sellado de fábrica</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Entrega hoy en Chimbote</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Efectivo o Yape al recibir</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Product Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                {/* Showcase Top Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-950 text-white tracking-wide">
                    Chimbote
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {activeProduct.badge}
                  </span>
                </div>

                {/* Big Product Image with Zoom */}
                <Link
                  href={`/producto/${activeProduct.slug}`}
                  className="relative w-full aspect-4/3 rounded-xl bg-gradient-to-b from-[#fafafc] to-neutral-100/50 flex items-center justify-center p-4 overflow-hidden border border-neutral-100 group cursor-pointer"
                >
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      fill
                      className="object-contain drop-shadow-md"
                      priority
                    />
                  </div>
                </Link>

                {/* Product Meta & Direct Link */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-neutral-100 mt-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-950 leading-tight">
                      {activeProduct.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      {activeProduct.highlight}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                      Precio Directo
                    </span>
                    <span className="text-base font-black text-neutral-950">
                      {STORE_SETTINGS.currencySymbol}
                      {activeProduct.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Interactive Model Switcher */}
                <div className="grid grid-cols-3 gap-1.5 pt-4">
                  {heroProducts.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer border ${
                        selectedIndex === idx
                          ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                          : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200"
                      }`}
                    >
                      <span className="block truncate">{p.name.replace("Redmi Buds ", "")}</span>
                      <span className="text-[10px] font-semibold opacity-80">
                        {STORE_SETTINGS.currencySymbol}
                        {p.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories & Collections Showcase Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 tracking-tight">
                Departamentos & Colecciones Destacadas
              </h2>
              <p className="text-xs text-neutral-500">
                Selección de audio garantizado en Chimbote con empaque sellado de fábrica.
              </p>
            </div>
            <a
              href="#catalogo"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
            >
              <span>Ver todas las opciones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Audífonos TWS */}
            <a
              href="#catalogo"
              className="group p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-blue-400/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                    3 Modelos
                  </span>
                </div>

                <div className="relative w-full h-28 bg-[#fafafc] rounded-xl overflow-hidden border border-neutral-100 flex items-center justify-center p-2">
                  <Image
                    src={getAssetUrl("/images/products/redmi-buds-6-play.png")}
                    alt="Audífonos Inalámbricos"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-950 group-hover:text-blue-600 transition-colors">
                    Audífonos Inalámbricos TWS
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                    Originales sellados con hasta 36h de duración.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 mt-4 flex items-center justify-between text-xs">
                <span className="font-extrabold text-neutral-950">Desde S/ 49.00</span>
                <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  Explorar
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </a>

            {/* Card 2: Cancelación Activa de Ruido (ANC) */}
            <Link
              href="/producto/redmi-buds-8-lite"
              className="group p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-blue-400/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-950 text-white">
                    ANC 42dB
                  </span>
                </div>

                <div className="relative w-full h-28 bg-[#fafafc] rounded-xl overflow-hidden border border-neutral-100 flex items-center justify-center p-2">
                  <Image
                    src={getAssetUrl("/images/products/redmi-buds-8-lite.png")}
                    alt="Cancelación de Ruido"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-950 group-hover:text-blue-600 transition-colors">
                    Cancelación de Ruido Activa
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                    Aislamiento acústico inteligente para llamadas y música.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 mt-4 flex items-center justify-between text-xs">
                <span className="font-extrabold text-neutral-950">Desde S/ 89.00</span>
                <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  Ver Ficha
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>

            {/* Card 3: Hi-Res Audio Series */}
            <Link
              href="/producto/redmi-buds-7s"
              className="group p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-blue-400/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    Hi-Res Audio
                  </span>
                </div>

                <div className="relative w-full h-28 bg-[#fafafc] rounded-xl overflow-hidden border border-neutral-100 flex items-center justify-center p-2">
                  <Image
                    src={getAssetUrl("/images/products/redmi-buds-7s.png")}
                    alt="Hi-Res Audio"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-950 group-hover:text-blue-600 transition-colors">
                    Hi-Res Audio Series
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                    Sonido inmersivo de alta definición y ecualización pro.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 mt-4 flex items-center justify-between text-xs">
                <span className="font-extrabold text-neutral-950">S/ 139.00</span>
                <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  Ver Ficha
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>

            {/* Card 4: Entrega Hoy en Chimbote */}
            <div className="group p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-emerald-400/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Mismo Día
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pago Contra Entrega</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Te lo llevamos a domicilio en Chimbote. Pagas en efectivo o Yape al verificar tu producto sellado.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-950">
                    Servicio Local Garantizado
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                    Coordinación directa y veloz por WhatsApp.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 mt-4">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    "¡Hola PulsoTech! Deseo coordinar una entrega hoy en Chimbote."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Consultar WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
