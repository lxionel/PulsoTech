"use client";

import React, { useState } from "react";
import { PRODUCTS, STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import Headphones3DViewer from "./Headphones3DViewer";
import { ArrowRight, ShieldCheck, Truck, Sparkles, Info, Headphones } from "lucide-react";

export default function AudioSpotlight() {
  const flagship = PRODUCTS[0]; // Pulso Apex One
  const { addItem, setSelectedProductForModal } = useCart();
  const [selectedColorName, setSelectedColorName] = useState(flagship.colors[0].name);

  const currentColor =
    flagship.colors.find((c) => c.name === selectedColorName) || flagship.colors[0];

  const handleBuyNow = () => {
    addItem(flagship, currentColor, 1);
  };

  return (
    <section id="audio-destacado" className="py-20 border-b border-neutral-200/90 bg-[#f8f8fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-neutral-800 text-[11px] font-mono uppercase tracking-wider shadow-xs mb-3">
              <Headphones className="w-3.5 h-3.5 text-neutral-900" />
              <span>LÍNEA DE AUDIO // COLECCIÓN DISPONIBLE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
              Apartado de Audio: Experiencia 3D
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl leading-relaxed">
              Iniciamos nuestra oferta tecnológica con audífonos calibrados en laboratorio. Explora el modelo insignia <strong className="text-neutral-900 font-semibold">{flagship.name}</strong> en 360 grados antes de pedirlo por WhatsApp.
            </p>
          </div>

          <a
            href="#catalogo"
            className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1.5 transition-colors"
          >
            <span>Ver todos los audífonos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3D Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-xs">
          {/* Left: 3D Interactive Model */}
          <div className="lg:col-span-7 w-full">
            <Headphones3DViewer onColorChange={(cName) => setSelectedColorName(cName)} />
          </div>

          {/* Right: Technical Specs & WhatsApp Buy */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200">
                  FLAGSHIP OVER-EAR
                </span>
                <span className="text-xs text-emerald-700 font-medium font-mono">
                  ● Stock Disponible en Lima y Provincias
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                {flagship.name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {flagship.subtitle}. Almohadillas con memoria viscoelástica y diafragmas de titanio aeroespacial para un sonido puro sin distorsión.
              </p>
            </div>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-3 gap-2.5 w-full">
              <div className="p-3 rounded-2xl bg-[#f8f8fa] border border-neutral-200/80">
                <span className="block text-xl font-bold font-mono text-neutral-900">45 dB</span>
                <span className="text-[10px] text-neutral-500 font-medium">ANC Híbrido</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f8f8fa] border border-neutral-200/80">
                <span className="block text-xl font-bold font-mono text-neutral-900">55 hrs</span>
                <span className="text-[10px] text-neutral-500 font-medium">Batería Hi-Fi</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f8f8fa] border border-neutral-200/80">
                <span className="block text-xl font-bold font-mono text-neutral-900">Titanio</span>
                <span className="text-[10px] text-neutral-500 font-medium">Drivers 40mm</span>
              </div>
            </div>

            {/* Price & Primary Call to Action */}
            <div className="w-full pt-1">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-extrabold font-mono text-neutral-950 tracking-tight">
                  {STORE_SETTINGS.currencySymbol}
                  {flagship.price.toFixed(2)}
                </span>
                {flagship.originalPrice && (
                  <span className="text-xs text-neutral-400 line-through font-mono">
                    {STORE_SETTINGS.currencySymbol}
                    {flagship.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-emerald-700 font-semibold">
                  ✓ Envío Gratis
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 transition-all font-semibold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <span>Pedir {flagship.name} por WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setSelectedProductForModal(flagship)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Info className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Ficha Técnica</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-neutral-500 pt-2 border-t border-neutral-100 w-full">
              <span className="inline-flex items-center gap-1.5 font-medium text-neutral-700">
                <ShieldCheck className="w-4 h-4 text-neutral-900" />
                12 Meses Garantía
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-neutral-700">
                <Truck className="w-4 h-4 text-neutral-900" />
                Despacho 24/48h
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
