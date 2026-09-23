"use client";

import React from "react";
import Image from "next/image";
import { STORE_SETTINGS } from "@/data/products";
import {
  ArrowRight,
  Headphones,
  BatteryCharging,
  Watch,
  ShieldCheck,
  Truck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-neutral-200/90 bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Pitch */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-300 bg-white text-neutral-800 text-[11px] font-mono uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
            <span>TIENDA DE TECNOLOGÍA & ACCESORIOS // PERÚ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.08]">
            Tecnología esencial. <br />
            <span className="text-neutral-500 font-semibold">
              Accesorios modernos para tu día a día.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed font-normal">
            En <strong>PulsoTech</strong> seleccionamos gadgets y accesorios tecnológicos de alto rendimiento. Comenzamos con nuestra línea completa de audífonos de alta fidelidad, complementada con cargadores rápidos GaN y smartwatches.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#catalogo"
              className="px-6 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 transition-all font-semibold text-xs flex items-center gap-2 shadow-md active:scale-95"
            >
              <span>Explorar Catálogo Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="#audio-destacado"
              className="px-5 py-3.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-medium text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <Headphones className="w-3.5 h-3.5 text-neutral-900" />
              <span>Ver Apartado de Audífonos 3D</span>
            </a>
          </div>
        </div>

        {/* Multi-Category Tech Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1: Audio Department (Large Feature) */}
          <div className="md:col-span-7 rounded-3xl bg-white border border-neutral-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all">
            <div className="flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-mono font-bold uppercase">
                <Headphones className="w-3 h-3 text-neutral-900" />
                COLECCIÓN DISPONIBLE
              </span>
              <span className="text-xs font-mono font-semibold text-neutral-500">
                Desde S/ 99.00
              </span>
            </div>

            <div className="my-6 z-10 max-w-md">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                Audio & Audífonos Hi-Fi
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                Cancelación activa de ruido 45dB, diafragmas de titanio y estuches con carga inalámbrica. Diseñados para trabajo, viajes y deporte.
              </p>
            </div>

            <div className="flex items-center justify-between z-10 pt-2 border-t border-neutral-100">
              <a
                href="#audio-destacado"
                className="text-xs font-bold text-neutral-900 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
              >
                <span>Probar experiencia en 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <span className="text-[11px] text-emerald-700 font-semibold font-mono">
                ● 4 Modelos en Stock
              </span>
            </div>

            {/* Subtle background visual */}
            <div className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10 pointer-events-none">
              <Headphones className="w-full h-full text-black" />
            </div>
          </div>

          {/* Card 2: GaN Chargers (Energy Department) */}
          <div className="md:col-span-5 rounded-3xl bg-[#f8f8fa] border border-neutral-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-neutral-800 text-[10px] font-mono font-bold uppercase border border-neutral-200">
                <BatteryCharging className="w-3 h-3 text-neutral-900" />
                ENERGÍA GAN III
              </span>
              <span className="text-xs font-mono font-semibold text-neutral-900">
                S/ 89.00
              </span>
            </div>

            <div className="my-4">
              <h3 className="text-xl font-extrabold text-neutral-950 tracking-tight">
                Cargadores Rápidos GaN 65W
              </h3>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Nitruro de Galio para cargar laptops, tablets y celulares al 50% en 22 minutos con 3 puertos simultáneos.
              </p>
            </div>

            <a
              href="#catalogo"
              className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 hover:underline pt-2 border-t border-neutral-200/60"
            >
              <span>Ver cargadores en catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 3: Wearables & Smartwatches */}
          <div className="md:col-span-5 rounded-3xl bg-[#f8f8fa] border border-neutral-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-neutral-800 text-[10px] font-mono font-bold uppercase border border-neutral-200">
                <Watch className="w-3 h-3 text-neutral-900" />
                WEARABLES
              </span>
              <span className="text-xs font-mono font-semibold text-neutral-900">
                S/ 189.00
              </span>
            </div>

            <div className="my-4">
              <h3 className="text-xl font-extrabold text-neutral-950 tracking-tight">
                Smartwatches AMOLED
              </h3>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Pantalla Always-On, control directo de tus audífonos, salud 24/7 y 12 días de batería continua.
              </p>
            </div>

            <a
              href="#catalogo"
              className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 hover:underline pt-2 border-t border-neutral-200/60"
            >
              <span>Ver relojes en catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 4: Store Guarantees & Shipping in Peru */}
          <div className="md:col-span-7 rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono font-semibold uppercase">
                COBERTURA PERÚ
              </span>
              <span className="text-xs font-mono text-emerald-400">
                Envíos 24 - 48h
              </span>
            </div>

            <div className="my-4 space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Garantía Oficial de 12 Meses & Atención Directa
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg">
                Todos los productos cuentan con respaldo local. Eliges en la tienda web, te contactamos por WhatsApp y coordinas pago contra entrega o transferencia.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-400 pt-2 border-t border-neutral-800">
              <span className="inline-flex items-center gap-1.5 text-white font-medium">
                <Truck className="w-4 h-4 text-emerald-400" />
                Envío Gratis en compras mayores a S/ {STORE_SETTINGS.freeShippingThreshold}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cambio Directo por Falla
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
