"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowRight, Heart } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleFavorite, isFavorite } = useCart();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const isFav = isFavorite(product.id);

  const colors = product.colors || [];
  const currentColor = colors[selectedColorIndex] || colors[0] || {
    name: "Original",
    hex: "#18181b",
    image: product.images?.[0] || "/products/buds-6-black.jpg",
  };

  const primaryImage = currentColor?.image || product.images?.[0] || "/products/buds-6-black.jpg";
  const secondaryImage =
    product.images?.[1] && product.images[1] !== primaryImage
      ? product.images[1]
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, currentColor, 1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="group relative rounded-2xl bg-white border border-neutral-200/90 hover:border-blue-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden h-full">
      {/* Top Card Image Link */}
      <Link href={`/producto/${product.slug}`} className="block p-4 sm:p-5 pb-0 flex-1">
        {/* Top Header: Brand, New Tag & Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {product.brand}
            </span>
            {product.isNew && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white tracking-wide uppercase">
                Nuevo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Etiqueta Stock: Fondo negro y letras blancas */}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-950 text-white tracking-wide">
              En Stock
            </span>

            {/* Favorite button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label="Guardar en favoritos"
              className="p-1.5 rounded-full text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
              title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Heart className={`w-4 h-4 ${isFav ? "text-red-500 fill-red-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Large Product Image Frame with Hover Transition */}
        <div className="relative w-full aspect-square rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden border border-neutral-100">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Imagen Principal (Color seleccionado) */}
            <img
              src={primaryImage}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 ease-out ${
                secondaryImage
                  ? "opacity-100 group-hover:opacity-0 group-hover:scale-95"
                  : "group-hover:scale-105"
              }`}
            />

            {/* Imagen Secundaria (Aparece en hover) */}
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} detalle`}
                className="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none"
              />
            )}
          </div>
        </div>

        {/* Selector de Colores Disponibles (Swatches con aro activo) */}
        <div className="min-h-[28px] flex items-center gap-1.5 pt-3 pb-0.5">
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {colors.map((color, idx) => {
                const isSelected = selectedColorIndex === idx;
                return (
                  <button
                    key={color.name + idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColorIndex(idx);
                    }}
                    onMouseEnter={() => setSelectedColorIndex(idx)}
                    aria-label={`Color ${color.name}`}
                    title={color.name}
                    className={`relative rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? "w-5 h-5 ring-2 ring-offset-2 ring-neutral-900"
                        : "w-4 h-4 hover:scale-110 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <span
                      className={`w-full h-full rounded-full border border-neutral-300 block ${
                        color.hex?.toLowerCase() === "#ffffff" ? "bg-white" : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                );
              })}
              <span className="text-[10px] font-semibold text-neutral-400 ml-1">
                {currentColor?.name}
              </span>
            </div>
          )}
        </div>

        {/* Title & Subtitle with fixed minimum heights so they align across cards */}
        <div className="pt-1">
          <h3 className="text-base sm:text-lg font-extrabold text-neutral-950 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1 min-h-[1.75rem]">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed min-h-[2.5rem] mt-1">
            {product.subtitle}
          </p>
        </div>

        {/* Specs Highlights with minimum height to guarantee perfect alignment */}
        <div className="flex flex-wrap content-start gap-1.5 pt-2.5 pb-3 text-[10px] sm:text-[11px] font-medium text-neutral-600 min-h-[50px]">
          <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200/60">
            {product.specs.battery} batería
          </span>
          <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200/60">
            {product.specs.anc}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200/60">
            {product.specs.connectivity}
          </span>
        </div>
      </Link>

      {/* Card Bottom: Price & Symmetric Action Buttons */}
      <div className="p-3.5 sm:p-4 pt-3.5 border-t border-neutral-100 mt-auto bg-neutral-50/50 flex flex-col gap-2.5">
        {/* Row 1: Full-width clear price, NO extra tags */}
        <div>
          <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block leading-none mb-1">
            Precio Directo
          </span>
          <span className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight whitespace-nowrap">
            {STORE_SETTINGS.currencySymbol.trim()} {product.price.toFixed(2)}
          </span>
        </div>

        {/* Row 2: 50/50 Balanced Action Buttons - Nunca se cortan */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <Link
            href={`/producto/${product.slug}`}
            className="w-full py-2 px-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 hover:text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98]"
          >
            <span>Ver Ficha</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={handleAddToCart}
            className="w-full py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
