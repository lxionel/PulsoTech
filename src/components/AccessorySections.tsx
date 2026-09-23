"use client";

import React, { useState } from "react";
import { PRODUCTS, STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import Headphones3DViewer from "./Headphones3DViewer";
import ProductCard from "./ProductCard";
import {
  Headphones,
  BatteryCharging,
  Watch,
  ArrowRight,
  Info,
} from "lucide-react";

export default function AccessorySections() {
  const { addItem, setSelectedProductForModal } = useCart();

  // Filtrar productos por departamento de accesorio
  const audioProducts = PRODUCTS.filter((p) => p.tags.includes("Audio"));
  const chargingProducts = PRODUCTS.filter((p) => p.tags.includes("Carga Rápida"));
  const wearableProducts = PRODUCTS.filter((p) => p.tags.includes("Wearable"));

  // Modelo insignia para el visor 3D
  const apexOne = PRODUCTS[0];
  const [selected3DColor, setSelected3DColor] = useState(apexOne.colors[0].name);
  const current3DColor =
    apexOne.colors.find((c) => c.name === selected3DColor) || apexOne.colors[0];

  return (
    <section className="py-16 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-200/80">
      {/* ========================================================================= */}
      {/* SECCIÓN 1: ACCESORIOS DE AUDIO & AUDÍFONOS (CON MODELO 3D INTERACTIVO)    */}
      {/* ========================================================================= */}
      <div id="seccion-audio" className="space-y-8">
        {/* Header de Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-mono uppercase font-bold tracking-wider mb-2">
              <Headphones className="w-3.5 h-3.5 text-neutral-900" />
              <span>SECCIÓN DE ACCESORIOS // AUDIO & AUDÍFONOS</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950">
              Audífonos de Alta Fidelidad & Cancelación Activa
            </h2>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
              Opciones de audio Over-Ear, In-Ear y deportivos con diafragmas de titanio y berilio. Explora el modelo insignia en 3D interactivo o elige entre las diferentes opciones de auriculares.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-500 font-semibold">
            {audioProducts.length} Opciones Disponibles
          </span>
        </div>

        {/* Visor 3D Interactivo del Modelo Destacado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-xs">
          <div className="lg:col-span-7 w-full">
            <Headphones3DViewer onColorChange={(cName) => setSelected3DColor(cName)} />
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-neutral-100 text-neutral-800 font-bold border border-neutral-200">
                MODELO INSIGNIA // OVER-EAR
              </span>
              <h3 className="text-2xl font-extrabold text-neutral-950">
                {apexOne.name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {apexOne.subtitle}. Acústica de estudio, almohadillas ergonómicas viscoelásticas y 55 horas de batería continua.
              </p>
            </div>

            {/* Spec pills */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-2xl bg-[#f8f8fa] border border-neutral-200/80">
                <span className="block text-lg font-bold font-mono text-neutral-900">45 dB</span>
                <span className="text-[10px] text-neutral-500 font-medium">ANC Híbrido</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#f8f8fa] border border-neutral-200/80">
                <span className="block text-lg font-bold font-mono text-neutral-900">55 hrs</span>
                <span className="text-[10px] text-neutral-500 font-medium">Batería</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#f8f8fa] border border-neutral-200/80">
                <span className="block text-lg font-bold font-mono text-neutral-900">Titanio</span>
                <span className="text-[10px] text-neutral-500 font-medium">40mm</span>
              </div>
            </div>

            {/* Price & Buy */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-extrabold font-mono text-neutral-950">
                  {STORE_SETTINGS.currencySymbol}
                  {apexOne.price.toFixed(2)}
                </span>
                {apexOne.originalPrice && (
                  <span className="text-xs text-neutral-400 line-through font-mono">
                    {STORE_SETTINGS.currencySymbol}
                    {apexOne.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-emerald-700 font-semibold">
                  ✓ Envío Gratis
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => addItem(apexOne, current3DColor, 1)}
                  className="w-full sm:flex-1 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 transition-all font-semibold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <span>Pedir {apexOne.name} por WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setSelectedProductForModal(apexOne)}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Info className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Ficha</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demás opciones de accesorios de audio */}
        <div className="space-y-4">
          <h4 className="text-base font-bold text-neutral-900">
            Todas las opciones de audífonos disponibles:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audioProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: ACCESORIOS DE CARGA & ENERGÍA (TECNOLOGÍA GAN)                 */}
      {/* ========================================================================= */}
      <div id="seccion-carga" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-mono uppercase font-bold tracking-wider mb-2">
              <BatteryCharging className="w-3.5 h-3.5 text-neutral-900" />
              <span>SECCIÓN DE ACCESORIOS // CARGA & ENERGÍA GAN</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950">
              Carga Rápida Ultracompacta GaN III
            </h2>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
              Cargadores y accesorios con Nitruro de Galio (GaN). Permiten alimentar tu laptop, celular y audífonos de forma simultánea con máxima eficiencia térmica y 50% menos volumen.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-500 font-semibold">
            {chargingProducts.length} Opciones en Catálogo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chargingProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}

          {/* Tarjeta de Próximo Accesorio de Carga */}
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-[#fbfbfd] p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-neutral-100 text-neutral-600">
                PRÓXIMAMENTE
              </span>
              <h4 className="text-base font-bold text-neutral-900">
                Cable de Carga Blindado USB-C 100W
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Silicona líquida anti-enredos con chip E-Marker y refuerzo de aleación de zinc.
              </p>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              En proceso de importación
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: ACCESORIOS WEARABLES & SMARTWATCHES                           */}
      {/* ========================================================================= */}
      <div id="seccion-wearables" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-mono uppercase font-bold tracking-wider mb-2">
              <Watch className="w-3.5 h-3.5 text-neutral-900" />
              <span>SECCIÓN DE ACCESORIOS // WEARABLES & RELOJES</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950">
              Smartwatches & Dispositivos Conectados
            </h2>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
              Relojes inteligentes con pantalla AMOLED, monitoreo de salud, notificaciones de WhatsApp y control directo de volumen y música para tus audífonos.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-500 font-semibold">
            {wearableProducts.length} Opciones en Catálogo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wearableProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}

          {/* Tarjeta de Próximo Accesorio Wearable */}
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-[#fbfbfd] p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-neutral-100 text-neutral-600">
                PRÓXIMAMENTE
              </span>
              <h4 className="text-base font-bold text-neutral-900">
                Correas Milanesas de Acero Inoxidable
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ajuste magnético milimétrico para el Pulso Watch Core en colores Plata y Negro Espacial.
              </p>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              En proceso de importación
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
