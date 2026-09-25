"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { STORE_SETTINGS } from "@/data/products";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function FavoritesDrawer() {
  const {
    favorites,
    isFavoritesOpen,
    setIsFavoritesOpen,
    toggleFavorite,
    addItem,
  } = useCart();
  const { products } = useProducts();

  // Lock body scroll when favorites is open
  React.useEffect(() => {
    if (isFavoritesOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFavoritesOpen]);

  if (!isFavoritesOpen) return null;

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsFavoritesOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white sm:border-l border-neutral-200 p-4 sm:p-6 flex flex-col justify-between shadow-2xl relative text-neutral-900 h-full">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <h2 className="text-base font-bold tracking-tight text-neutral-950">
                  Mis Favoritos
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold border border-red-100">
                  {favoriteProducts.length}{" "}
                  {favoriteProducts.length === 1 ? "producto" : "productos"}
                </span>
              </div>
              <button
                onClick={() => setIsFavoritesOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Cerrar favoritos"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Favorites Items List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {favoriteProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Aún no tienes favoritos guardados
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Explora nuestro catálogo y presiona el corazón en los productos que más te gusten para guardarlos aquí.
                </p>
                <button
                  onClick={() => setIsFavoritesOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              favoriteProducts.map((product) => {
                const currentColor = product.colors[0];
                return (
                  <div
                    key={product.id}
                    className="flex gap-3.5 p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all"
                  >
                    <Link
                      href={`/producto/${product.slug}`}
                      onClick={() => setIsFavoritesOpen(false)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0 flex items-center justify-center p-1"
                    >
                      {currentColor?.image?.startsWith("data:") ||
                      currentColor?.image?.startsWith("blob:") ||
                      currentColor?.image?.startsWith("http") ? (
                        <img
                          src={currentColor.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Image
                          src={currentColor?.image || "/products/buds-6-black.jpg"}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                        {product.brand}
                      </span>
                      <Link
                        href={`/producto/${product.slug}`}
                        onClick={() => setIsFavoritesOpen(false)}
                        className="text-xs font-bold text-neutral-950 hover:text-blue-600 transition-colors truncate block"
                      >
                        {product.name}
                      </Link>
                      <span className="text-xs font-extrabold text-neutral-950 mt-1 block">
                        {STORE_SETTINGS.currencySymbol}
                        {product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="text-neutral-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Quitar de favoritos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          addItem(product, currentColor, 1);
                          setIsFavoritesOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                        title="Añadir a la bolsa"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Comprar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer of Drawer */}
          {favoriteProducts.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={() => setIsFavoritesOpen(false)}
                className="w-full py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Seguir Explorando</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
