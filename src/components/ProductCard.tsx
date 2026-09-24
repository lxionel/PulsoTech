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
    <div className="group relative rounded-2xl bg-white border border-neutral-200/90 hover:border-blue-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Card Image Link */}
      <Link href={`/producto/${product.slug}`} className="block p-4 sm:p-5 pb-0">
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
              className="p-1 rounded-full text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
              title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Heart className={`w-4 h-4 ${isFav ? "text-red-500 fill-red-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Large Product Image Frame */}
        <div className="relative w-full aspect-square rounded-xl bg-white flex items-center justify-center p-1.5 overflow-hidden border border-neutral-100">
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

        {/* Title & Subtitle */}
        <div className="space-y-1.5 pt-4">
          <h3 className="text-base sm:text-lg font-extrabold text-neutral-950 group-hover:text-blue-600 transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Specs Highlights */}
        <div className="flex flex-wrap gap-1.5 pt-3 text-[11px] font-medium text-neutral-600">
          <span className="px-2.5 py-1 rounded-md bg-neutral-100/90 border border-neutral-200/40">
            {product.specs.battery} batería
          </span>
          <span className="px-2.5 py-1 rounded-md bg-neutral-100/90 border border-neutral-200/40">
            {product.specs.anc}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-neutral-100/90 border border-neutral-200/40">
            {product.specs.connectivity}
          </span>
        </div>
      </Link>

      {/* Card Bottom: Price and Actions */}
      <div className="p-4 sm:p-5 pt-4 border-t border-neutral-100 mt-4 flex items-center justify-between gap-3 bg-neutral-50/50">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
            Precio Directo
          </span>
          <span className="text-xl font-extrabold text-neutral-950 tracking-tight">
            {STORE_SETTINGS.currencySymbol}
            {product.price.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/producto/${product.slug}`}
            className="px-3 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800 hover:text-black font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span>Ver Ficha</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleAddToCart}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
