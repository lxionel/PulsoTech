"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Star, Check } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const { addItem, setSelectedProductForModal } = useCart();
  const currentColor = product.colors[selectedColorIndex];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, currentColor, 1);
  };

  return (
    <div
      onClick={() => setSelectedProductForModal(product)}
      className="group relative rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-400/80 transition-all duration-300 p-5 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          {product.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
              NUEVO
            </span>
          )}
          {product.stockCount <= 5 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              ÚLTIMAS {product.stockCount} UDS
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-neutral-600 font-medium">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{product.rating}</span>
          <span className="text-neutral-400 text-[11px]">({product.reviewsCount})</span>
        </div>
      </div>

      {/* Product Image Frame */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f5f5f7] mb-4 flex items-center justify-center p-3">
        <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
          <Image
            src={currentColor.image}
            alt={`${product.name} - ${currentColor.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Color Selector Dots */}
      <div
        className="flex items-center justify-between mb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] text-neutral-500 font-medium">
          {currentColor.name}
        </span>
        <div className="flex items-center gap-1.5">
          {product.colors.map((color, index) => (
            <button
              key={color.name}
              onClick={() => setSelectedColorIndex(index)}
              title={color.name}
              aria-label={color.name}
              className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                selectedColorIndex === index
                  ? "border-black scale-125 ring-1 ring-black/20"
                  : "border-neutral-300 opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {selectedColorIndex === index && (
                <Check
                  className={`w-2 h-2 ${
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

      {/* Title & Description */}
      <div className="space-y-1 mb-4">
        <h3 className="text-base font-bold text-neutral-900 group-hover:text-black transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
          {product.subtitle}
        </p>
      </div>

      {/* Mini Specs Row */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-600 py-2 border-y border-neutral-100 mb-4 bg-neutral-50/50 px-2 rounded-lg">
        <div>
          <span className="text-neutral-400 block text-[9px] uppercase font-sans">Batería</span>
          <span className="font-semibold text-neutral-800">{product.specs.battery.split(" ")[0]} hrs</span>
        </div>
        <div>
          <span className="text-neutral-400 block text-[9px] uppercase font-sans">Aislamiento</span>
          <span className="font-semibold text-neutral-800">{product.specs.anc.split(" ")[0]}</span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through mr-1.5 font-mono">
              {STORE_SETTINGS.currencySymbol}
              {product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-bold font-mono text-neutral-900">
            {STORE_SETTINGS.currencySymbol}
            {product.price.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="px-3.5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 transition-colors font-medium text-xs flex items-center gap-1.5 shadow-xs active:scale-95"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Añadir</span>
        </button>
      </div>
    </div>
  );
}
