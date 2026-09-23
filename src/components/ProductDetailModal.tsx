"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { STORE_SETTINGS } from "@/data/products";
import { X, Check, ShoppingBag, Star, Waves, ShieldCheck, Zap } from "lucide-react";

export default function ProductDetailModal() {
  const { selectedProductForModal, setSelectedProductForModal, addItem } = useCart();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  useEffect(() => {
    setSelectedColorIndex(0);
  }, [selectedProductForModal]);

  if (!selectedProductForModal) return null;

  const product = selectedProductForModal;
  const currentColor = product.colors[selectedColorIndex];

  const handleAddAndClose = () => {
    addItem(product, currentColor, 1);
    setSelectedProductForModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductForModal(null)}
          aria-label="Cerrar ventana"
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Image and Colors */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#f5f5f7] border border-neutral-100 p-4 flex items-center justify-center">
              <Image
                src={currentColor.image}
                alt={`${product.name} - ${currentColor.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover rounded-xl"
              />
            </div>

            {/* Color Selector */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span className="font-medium">Color:</span>
                <span className="font-bold text-neutral-900">{currentColor.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color, index) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColorIndex(index)}
                    className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center ${
                      selectedColorIndex === index
                        ? "border-black scale-110 ring-2 ring-black/20"
                        : "border-neutral-300 opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColorIndex === index && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          color.hex === "#fafafa" || color.hex === "#e4e4e7" || color.hex === "#fcfcfc"
                            ? "text-black"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Profile / Acoustic Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-neutral-700 font-bold">
                <Waves className="w-3.5 h-3.5 text-neutral-900" />
                <span>Perfil: {product.soundProfile.type}</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {product.soundProfile.description}
              </p>

              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div>
                  <div className="flex justify-between text-neutral-600 mb-1">
                    <span>Graves</span>
                    <span className="font-bold text-neutral-900">{product.soundProfile.bass}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 rounded-full"
                      style={{ width: `${product.soundProfile.bass}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-600 mb-1">
                    <span>Medios & Voces</span>
                    <span className="font-bold text-neutral-900">{product.soundProfile.mid}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 rounded-full"
                      style={{ width: `${product.soundProfile.mid}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-600 mb-1">
                    <span>Agudos</span>
                    <span className="font-bold text-neutral-900">{product.soundProfile.treble}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 rounded-full"
                      style={{ width: `${product.soundProfile.treble}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Specs & Actions */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-neutral-700 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-neutral-400">({product.reviewsCount} opiniones)</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {product.name}
              </h2>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <span className="text-3xl font-extrabold font-mono text-neutral-900">
                {STORE_SETTINGS.currencySymbol}
                {product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-400 line-through font-mono">
                  {STORE_SETTINGS.currencySymbol}
                  {product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="ml-auto text-xs text-emerald-700 font-semibold">
                ✓ Envío Gratis a partir de S/ {STORE_SETTINGS.freeShippingThreshold}
              </span>
            </div>

            {/* Specs Grid */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase font-bold text-neutral-600 block">
                ESPECIFICACIONES PRINCIPALES:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                  <span className="text-[10px] text-neutral-400 uppercase block font-sans">Batería</span>
                  <span className="font-bold text-neutral-900">{product.specs.battery}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                  <span className="text-[10px] text-neutral-400 uppercase block font-sans">Aislamiento</span>
                  <span className="font-bold text-neutral-900">{product.specs.anc}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                  <span className="text-[10px] text-neutral-400 uppercase block font-sans">Hardware</span>
                  <span className="font-bold text-neutral-900">{product.specs.driver}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                  <span className="text-[10px] text-neutral-400 uppercase block font-sans">Conexión</span>
                  <span className="font-bold text-neutral-900">{product.specs.connectivity}</span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase font-bold text-neutral-600 block">
                INCLUYE:
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-700">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleAddAndClose}
                className="w-full py-4 rounded-full bg-black hover:bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Añadir a la Bolsa ({STORE_SETTINGS.currencySymbol}
                  {product.price.toFixed(2)})
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
