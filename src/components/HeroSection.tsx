"use client";

import React from "react";
import {
  ArrowRight,
  Headphones,
  ShieldCheck,
  Truck,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function HeroSection() {
  const { whatsappNumber } = useCart();

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-neutral-200/90 bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Pitch */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-300 bg-white text-neutral-800 text-[11px] font-mono uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
            <span>AUDÍFONOS ORIGINALES XIAOMI & REDMI // PERÚ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.08]">
            Audífonos originales. <br />
            <span className="text-neutral-500 font-semibold">
              El mejor sonido al precio más justo.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed font-normal">
            En <strong>PulsoTech</strong> nos especializamos en la reventa de audífonos 100% originales <strong>Xiaomi y Redmi</strong>. Modelos auténticos, garantía de funcionamiento, entrega el mismo día en Chimbote y envíos seguros a todo el Perú por Olva Courier.
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
                "¡Hola PulsoTech! Deseo consultar sobre la disponibilidad de audífonos Xiaomi/Redmi."
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

        {/* Tech Bento Grid (Adaptado a audífonos y envíos) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1: Audio Xiaomi/Redmi en Stock */}
          <div className="md:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all">
            <div className="flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-mono font-bold uppercase">
                <Headphones className="w-3 h-3 text-neutral-900" />
                MODELOS EN STOCK
              </span>
              <span className="text-xs font-mono font-semibold text-neutral-500">
                Desde S/ 49.00
              </span>
            </div>

            <div className="my-6 z-10 max-w-md">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                Línea Redmi Buds Original
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                Desde los prácticos Buds 6 Play hasta los Buds 8 Lite con ANC 42dB y los Buds 7S. Conectividad Bluetooth estable, batería duradera y diseño cómodo.
              </p>
            </div>

            <div className="flex items-center justify-between z-10 pt-2 border-t border-neutral-100">
              <a
                href="#catalogo"
                className="text-xs font-bold text-neutral-900 hover:text-black flex items-center gap-1.5 transition-colors"
              >
                <span>Ver catálogo en stock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <span className="text-[11px] text-emerald-700 font-semibold font-mono">
                ● 3 Modelos Disponibles
              </span>
            </div>

            {/* Subtle background visual */}
            <div className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10 pointer-events-none">
              <Headphones className="w-full h-full text-black" />
            </div>
          </div>

          {/*
            ========================================================================
            SECCIONES OCULTAS: Carga GaN y Wearables (Ocultos hasta contar con stock real)
            ========================================================================
            <div className="md:col-span-5 ...">Cargadores GaN 65W</div>
            <div className="md:col-span-5 ...">Smartwatches AMOLED</div>
          */}

          {/* Card 2: Envíos & Cobertura en Perú */}
          <div className="md:col-span-6 rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono font-semibold uppercase">
                COBERTURA Y DESPACHO
              </span>
              <span className="text-xs font-mono text-emerald-400">
                Coordinación inmediata por WhatsApp
              </span>
            </div>

            <div className="my-6 space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Entrega el mismo día en Chimbote
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg">
                Y envíos a todo el Perú por Olva Courier con código de rastreo. Eliges tu modelo en la tienda web, te escribimos por WhatsApp y coordinamos tu entrega de forma rápida y confiable.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-400 pt-2 border-t border-neutral-800">
              <span className="inline-flex items-center gap-1.5 text-white font-medium">
                <Truck className="w-4 h-4 text-emerald-400" />
                Entrega en Chimbote · Olva Courier Perú
              </span>
              <span className="inline-flex items-center gap-1.5 text-white font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Garantía y Productos 100% Originales
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
