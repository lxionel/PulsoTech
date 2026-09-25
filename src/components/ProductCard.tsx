"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowRight, Heart } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleFavorite, isFavorite } = useCart();
  const currentColor = product.colors[0];
  const isFav = isFavorite(product.id);

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

        {/* Large Product Image Frame */}
        <div className="relative w-full aspect-square rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden border border-neutral-100">
          <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
            {currentColor?.image?.startsWith("data:") ||
            currentColor?.image?.startsWith("blob:") ||
            currentColor?.image?.startsWith("http") ? (
              <img
                src={currentColor.image}
                alt={product.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Image
                src={currentColor?.image || "/products/buds-6-black.jpg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-1"
                priority
              />
            )}
          </div>
        </div>

        {/* Title & Subtitle with fixed minimum heights so they align across cards */}
        <div className="pt-3.5 sm:pt-4">
          <h3 className="text-base sm:text-lg font-extrabold text-neutral-950 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1 min-h-[1.75rem]">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed min-h-[2.5rem] mt-1">
            {product.subtitle}
          </p>
        </div>

        {/* Specs Highlights with minimum height to guarantee alignment */}
        <div className="flex flex-wrap content-start gap-1.5 pt-3 pb-3 text-[10px] sm:text-[11px] font-medium text-neutral-600 min-h-[54px]">
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

      {/* Card Bottom: Price and Actions - Limpio sin etiquetas inventadas */}
      <div className="p-3.5 sm:p-5 pt-3.5 sm:pt-4 border-t border-neutral-100 mt-auto bg-neutral-50/50 flex items-center justify-between gap-2 sm:gap-3">
        <div className="shrink-0">
          <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block leading-none mb-1">
            Precio Directo
          </span>
          <span className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight whitespace-nowrap">
            {STORE_SETTINGS.currencySymbol.trim()} {product.price.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href={`/producto/${product.slug}`}
            className="px-2.5 sm:px-3 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 hover:text-black font-bold text-xs transition-all flex items-center gap-1 shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <span>Ver Ficha</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <button
            onClick={handleAddToCart}
            className="px-3 sm:px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
