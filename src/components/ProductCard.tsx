"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { getAssetUrl } from "@/utils/paths";
import { ShoppingBag, Heart } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleFavorite, isFavorite } = useCart();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const isFav = isFavorite(product.id);

  const colors = product.colors || [];
  const fallbackImg = getAssetUrl("/placeholder-earbuds.svg");
  const currentColor = colors[selectedColorIndex] || colors[0] || {
    name: "Original",
    hex: "#18181b",
    image: product.images?.[0] || fallbackImg,
  };

  const primaryImage = currentColor?.image || product.images?.[0] || fallbackImg;
  const secondaryImage =
    product.images?.[1] && product.images[1] !== primaryImage
      ? product.images[1]
      : null;

  const isOutOfStock = (product.stockCount ?? 0) <= 0 || product.inStock === false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, currentColor, 1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="group relative rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden h-full">
      {/* Top Card Image Link */}
      <Link href={`/producto/?id=${product.id}&slug=${product.slug}`} className="block p-4 sm:p-5 pb-0 flex-1">
        {/* Top Header: Brand, New Tag & Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {product.brand}
            </span>
            {product.id && (
              <span className="font-mono text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                #{product.id}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Etiqueta Stock */}
            {isOutOfStock ? (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-100 text-neutral-500 border border-neutral-200 tracking-wide">
                Agotado
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-950 text-white tracking-wide">
                En Stock
              </span>
            )}

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

        {/* Large Product Image Frame with Hover Transition (only on image hover) */}
        <div className="relative w-full aspect-square rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden border border-neutral-100 group/image">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Imagen Principal (Color seleccionado) */}
            <img
              src={primaryImage}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 ease-out ${
                secondaryImage
                  ? "opacity-100 group-hover/image:opacity-0 group-hover/image:scale-95"
                  : "group-hover/image:scale-105"
              }`}
            />

            {/* Imagen Secundaria (Aparece en hover SOLO al pasar el cursor sobre la imagen) */}
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} detalle`}
                className="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 ease-out opacity-0 group-hover/image:opacity-100 scale-95 group-hover/image:scale-100 pointer-events-none"
              />
            )}
          </div>
        </div>

        {/* Selector de Colores Disponibles (Swatches con aro activo, selección SOLO al hacer clic) */}
        <div className="h-7 flex items-center gap-1.5 pt-2 pb-0.5 shrink-0">
          {colors.length > 0 && (
            <div className="flex items-center gap-1">
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
                    aria-label={`Color ${color.name}`}
                    title={color.name}
                    className="w-6 h-6 flex items-center justify-center cursor-pointer shrink-0 transition-opacity"
                  >
                    <span
                      className={`rounded-full border border-neutral-300 transition-all duration-150 block ${
                        isSelected
                          ? "w-4 h-4 ring-2 ring-offset-2 ring-neutral-900 opacity-100"
                          : "w-3.5 h-3.5 opacity-70 hover:opacity-100"
                      } ${
                        color.hex?.toLowerCase() === "#ffffff" ? "bg-white" : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                );
              })}
              <span className="text-[10px] font-semibold text-neutral-400 ml-1 truncate max-w-[80px]">
                {currentColor?.name}
              </span>
            </div>
          )}
        </div>

        {/* Title & Subtitle (Inmóviles y perfectamente alineados) */}
        <div className="pt-1 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-neutral-950 leading-snug line-clamp-1 min-h-[1.75rem]">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed min-h-[2.5rem] mt-1">
            {product.subtitle}
          </p>
        </div>
      </Link>

      {/* Card Bottom: Price & Long Elegant Action Button */}
      <div className="p-3.5 sm:p-4 pt-3.5 border-t border-neutral-100 mt-auto bg-neutral-50/50 flex flex-col gap-3">
        {/* Row 1: Full-width clear price, NO extra tags */}
        <div>
          <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block leading-none mb-1">
            Precio Directo
          </span>
          <span className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight whitespace-nowrap">
            {STORE_SETTINGS.currencySymbol.trim()} {product.price.toFixed(2)}
          </span>
        </div>

        {/* Row 2: Botón Añadir / Agotado */}
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span>Agotado</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Añadir al Carrito</span>
          </button>
        )}
      </div>
    </div>
  );
}
