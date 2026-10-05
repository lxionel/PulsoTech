"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { getAssetUrl } from "@/utils/paths";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { productGallery } from "@/lib/product-media";
import CompareProductButton from "./CompareProductButton";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleFavorite, isFavorite } = useCart();
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [galleryColorIndex, setGalleryColorIndex] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const isFav = isFavorite(product.id);

  const colors = product.colors || [];
  const fallbackImg = getAssetUrl("/placeholder-earbuds.svg");
  const currentColor = (selectedColorIndex !== null ? colors[selectedColorIndex] : undefined) || colors[0] || {
    name: "Original",
    hex: "#18181b",
    image: product.images?.[0] || fallbackImg,
  };

  const gallery = productGallery(product, galleryColorIndex, fallbackImg);
  const primaryImage = getAssetUrl(gallery[0]);
  const secondaryImage = gallery[1] ? getAssetUrl(gallery[1]) : null;

  const isOutOfStock = (product.stockCount ?? 0) <= 0 || product.inStock === false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, currentColor, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="store-motion store-product-card group relative rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-400 hover:shadow-xl transition-[transform,box-shadow,border-color] duration-300 flex flex-col justify-between overflow-hidden h-full">
      {/* Top Card Image Link */}
      <Link href={`/producto/?id=${product.id}&slug=${product.slug}`} className="block p-4 sm:p-5 pb-0 flex-1">
        {/* Top Header: Brand, New Tag & Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {product.brand}
            </span>
            {product.id && (
              <span className="font-mono text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                #{product.id}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
              aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
              aria-pressed={isFav}
              className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center p-1.5 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-125 cursor-pointer"
              title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Heart className={`w-4 h-4 transition-all duration-200 ${isFav ? "text-red-500 fill-red-500 scale-110" : ""}`} />
            </button>
          </div>
        </div>

        {/* Large Product Image Frame with Hover Transition (only on image hover) */}
        <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden border border-neutral-100 group/image">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Imagen Principal (Color seleccionado) */}
            <img
              src={primaryImage}
              alt={product.name}
              className={`store-product-image-primary absolute inset-0 w-full h-full object-contain p-1 transition-[transform,scale,opacity] duration-500 ease-out ${
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
                className="store-product-image-secondary absolute inset-0 w-full h-full object-contain p-1 transition-[transform,scale,opacity] duration-500 ease-out opacity-0 group-hover/image:opacity-100 scale-95 group-hover/image:scale-100 pointer-events-none"
              />
            )}
          </div>
        </div>

        {/* Selector de Colores Disponibles (Swatches con aro activo, selección SOLO al hacer clic) */}
        <div className="min-h-11 sm:min-h-0 sm:h-7 flex items-center gap-1.5 pt-2 pb-0.5 shrink-0">
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
                      setGalleryColorIndex(idx);
                    }}
                    aria-label={`Color ${color.name}`}
                    aria-pressed={isSelected}
                    title={color.name}
                    className="w-11 h-11 sm:w-6 sm:h-6 flex items-center justify-center cursor-pointer shrink-0 transition-transform duration-150 hover:scale-115 active:scale-90"
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
                {selectedColorIndex === null ? "Elige color" : currentColor.name}
              </span>
            </div>
          )}
        </div>

        {/* Title & Subtitle (Inmóviles y perfectamente alineados) */}
        <div className="pt-1 pb-3">
          <h3 className="text-lg font-extrabold text-neutral-950 leading-snug line-clamp-2 sm:line-clamp-1 min-h-[1.75rem]">
            {product.name}
          </h3>
          <p className="text-sm sm:text-xs text-neutral-500 line-clamp-2 leading-relaxed min-h-[2.5rem] mt-1">
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

        {/* Row 2: Botón Añadir / Agotado con feedback táctil inmediato */}
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full min-h-12 sm:min-h-0 py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span>Agotado</span>
          </button>
        ) : colors.length > 0 && selectedColorIndex === null ? (
          <Link href={`/producto/?id=${product.id}&slug=${product.slug}`} className="w-full min-h-12 sm:min-h-0 py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-sm flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Elegir color</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full min-h-12 sm:min-h-0 py-2.5 sm:py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.97] transition-all duration-200 cursor-pointer ${
              justAdded
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-neutral-950 hover:bg-neutral-800 text-white hover:shadow-md"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="store-feedback w-4 h-4 shrink-0" />
                <span>¡Añadido a la Bolsa!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <span>Añadir al Carrito</span>
              </>
            )}
          </button>
        )}
        <CompareProductButton product={product} />
      </div>
    </div>
  );
}
