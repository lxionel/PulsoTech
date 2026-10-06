"use client";

import { productHref } from "@/lib/catalog-links";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Heart, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { STORE_SETTINGS } from "@/data/products";
import { productGallery } from "@/lib/product-media";
import { getAssetUrl } from "@/utils/paths";
import type { Product } from "@/types";
import Navbar from "./Navbar";
import Footer from "./Footer";

function SavedProduct({ product, onRemove, saved = true }: {
  product: Product;
  onRemove?: () => void;
  saved?: boolean;
}) {
  const href = productHref(product);
  const image = getAssetUrl(productGallery(product, null, getAssetUrl("/placeholder-earbuds.svg"))[0]);
  const unavailable = product.inStock === false || (product.stockCount ?? 0) <= 0;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <Link href={href} className="group flex aspect-[4/3] items-center justify-center bg-neutral-50/60 p-6 sm:aspect-square sm:p-8" aria-label={`Ver ${product.name}`}>
        {/* Preserve the complete photo and avoid enlarging small uploads. */}
        <img src={image} alt={product.name} loading="lazy" className="h-auto w-auto max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
      </Link>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`${saved ? "Quitar" : "Guardar"} ${product.name}${saved ? " de" : " en"} favoritos`} aria-pressed={saved} className={`absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white transition-colors hover:bg-neutral-100 ${saved ? "text-red-500" : "text-neutral-600"}`}>
          <Heart className={`h-[18px] w-[18px] ${saved ? "fill-current" : ""}`} />
        </button>
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] uppercase tracking-wide text-neutral-500">{product.brand}</p>
        <Link href={href} className="mt-1 text-base font-bold leading-snug text-neutral-950 hover:underline sm:text-lg">{product.name}</Link>
        {product.colors?.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5" aria-label={`${product.colors.length} ${product.colors.length === 1 ? "color" : "colores"}`}>
            {product.colors.slice(0, 6).map((color, index) => (
              <span key={`${color.name}-${index}`} title={color.name} className="h-3 w-3 rounded-full border border-black/15" style={{ backgroundColor: color.hex }} />
            ))}
            <span className="ml-1 text-xs text-neutral-500">{product.colors.length} {product.colors.length === 1 ? "color" : "colores"}</span>
          </div>
        )}
        <div className="mt-auto pt-5">
          <p className="text-xl font-semibold tracking-tight text-neutral-950">{STORE_SETTINGS.currencySymbol.trim()} {product.price.toFixed(2)}</p>
          {unavailable && <p className="mt-1 text-xs text-neutral-500">Agotado por ahora</p>}
          <Link href={href} className="mt-4 flex min-h-11 items-center justify-between gap-2 rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800">
            Ver producto <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function FavoritesPage() {
  const { favorites, toggleFavorite, isFavorite, isFavoritesLoading } = useCart();
  const { products, isLoading } = useProducts();
  const [removed, setRemoved] = useState<{ id: string; name: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const loading = isFavoritesLoading || (isLoading && products.length === 0);
  const savedProducts = [...favorites].reverse().flatMap((id) => {
    const product = products.find((item) => item.id === id);
    return product ? [product] : [];
  });
  const missingIds = loading ? [] : favorites.filter((id) => !products.some((product) => product.id === id));
  const suggestions = products.filter((product) => product.inStock !== false && (product.stockCount ?? 0) > 0).slice(0, 4);

  const remove = (id: string, name: string) => {
    toggleFavorite(id);
    setRemoved({ id, name });
    heading.current?.focus({ preventScroll: true });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        <Link href="/#catalogo" className="inline-flex min-h-11 items-center gap-2 text-xs text-neutral-500 hover:text-neutral-950"><ArrowLeft className="h-4 w-4" />Catálogo</Link>
        <div className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-3 border-b border-neutral-200 pb-5 sm:mb-8">
          <div>
            <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none sm:text-3xl">Mis favoritos</h1>
            <p className="mt-2 text-sm text-neutral-500">Tus productos guardados, en un solo lugar.</p>
          </div>
          {!loading && savedProducts.length > 0 && <span className="text-sm text-neutral-500">{savedProducts.length} {savedProducts.length === 1 ? "producto" : "productos"}</span>}
        </div>

        <div aria-live="polite" aria-atomic="true">
          {removed && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
              <p className="min-w-0">Quitaste {removed.name} de favoritos.</p>
              <button type="button" onClick={() => { if (!isFavorite(removed.id)) toggleFavorite(removed.id); setRemoved(null); }} className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-semibold underline underline-offset-4"><RotateCcw className="h-4 w-4" />Deshacer</button>
            </div>
          )}
        </div>

        {loading ? (
          <section aria-label="Cargando favoritos" aria-busy="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((index) => <div key={index} className="motion-safe:animate-pulse overflow-hidden rounded-2xl border border-neutral-200"><div className="aspect-[4/3] bg-neutral-100 sm:aspect-square" /><div className="space-y-3 p-5"><div className="h-4 w-3/4 rounded bg-neutral-100" /><div className="h-6 w-1/2 rounded bg-neutral-100" /><div className="mt-5 h-11 rounded-xl bg-neutral-100" /></div></div>)}
          </section>
        ) : savedProducts.length > 0 ? (
          <section aria-label="Productos favoritos" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {savedProducts.map((product) => <SavedProduct key={product.id} product={product} onRemove={() => remove(product.id, product.name)} />)}
          </section>
        ) : (
          <>
            <section className="flex flex-col items-center rounded-2xl bg-neutral-50 px-5 py-10 text-center sm:py-14">
              <Heart className="mb-5 h-8 w-8 text-neutral-400" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="text-lg font-semibold text-neutral-950 sm:text-xl">Aún no tienes favoritos</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">Toca el corazón de un producto para guardarlo aquí.</p>
              <Link href="/#catalogo" className="mt-6 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800">Ver catálogo</Link>
            </section>
            {suggestions.length > 0 && <section aria-label="Productos del catálogo" className="mt-10"><h2 className="mb-5 text-lg font-semibold">Explora el catálogo</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">{suggestions.map((product) => <SavedProduct key={product.id} product={product} saved={isFavorite(product.id)} onRemove={() => toggleFavorite(product.id)} />)}</div></section>}
          </>
        )}
        {missingIds.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-5 text-sm text-neutral-500">
            <p>{missingIds.length === 1 ? "Un producto guardado ya no está en el catálogo." : `${missingIds.length} productos guardados ya no están en el catálogo.`}</p>
            <button type="button" className="min-h-11 cursor-pointer font-semibold text-neutral-950 underline underline-offset-4" onClick={() => missingIds.forEach(toggleFavorite)}>Quitar de favoritos</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
