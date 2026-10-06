"use client";

import { productHref } from "@/lib/catalog-links";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { useCart } from "@/context/CartContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { AUDIO_TYPE_OPTIONS, parsePlaybackHours } from "@/lib/audio-filters";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import type { Product } from "@/types";

const UNSPECIFIED = "No especificado";

function findCustomSpec(product: Product, keywords: string[]): string | undefined {
  return product.customSpecs?.find((spec) => {
    const label = spec.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return keywords.some((keyword) => label.includes(keyword)) && Boolean(spec.value.trim());
  })?.value.trim();
}

function playbackValue(product: Product): string {
  const hours = parsePlaybackHours(product.specs?.playbackHours);
  return hours !== undefined ? `${hours} horas` : UNSPECIFIED;
}

export default function ProductComparison() {
  const { selectedProducts, isOpen, setIsOpen, toggleProduct, clearSelection } = useComparison();
  const { isCartOpen, isFavoritesOpen } = useCart();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const isAdmin = pathname.includes("Lionel260606");
  const visible = isOpen && selectedProducts.length === 2 && !isAdmin && !isCartOpen && !isFavoritesOpen;
  useBodyScrollLock(visible);

  useEffect(() => {
    if (!visible) return;
    const dialog = dialogRef.current;
    const comparisonBar = barRef.current;
    const previousFocus = document.activeElement;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
      if (previousFocus instanceof HTMLButtonElement && previousFocus.disabled) comparisonBar?.focus();
      else if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [visible]);

  if (isAdmin || selectedProducts.length === 0) return null;

  const rows = [
    { label: "Precio", values: selectedProducts.map((product) => `${STORE_SETTINGS.currencySymbol.trim()} ${product.price.toFixed(2)}`) },
    { label: "Marca", values: selectedProducts.map((product) => product.brand?.trim() || UNSPECIFIED) },
    { label: "Tipo", values: selectedProducts.map((product) => AUDIO_TYPE_OPTIONS.find((option) => option.value === product.specs?.audioType)?.label || UNSPECIFIED) },
    { label: "Autonomía por carga", values: selectedProducts.map(playbackValue) },
    { label: "Cancelación activa (ANC)", values: selectedProducts.map((product) => product.specs?.ancEnabled === "yes" ? "Con ANC" : product.specs?.ancEnabled === "no" ? "Sin ANC" : UNSPECIFIED) },
    { label: "Micrófono", values: selectedProducts.map((product) => findCustomSpec(product, ["microfono"]) || UNSPECIFIED) },
    { label: "Conectividad", values: selectedProducts.map((product) => findCustomSpec(product, ["bluetooth", "conectividad"]) || product.specs?.connectivity?.trim() || UNSPECIFIED) },
    { label: "Disponibilidad", values: selectedProducts.map((product) => (product.stockCount ?? 0) > 0 && product.inStock !== false ? "En stock" : "Agotado") },
  ];

  return (
    <>
      {!isCartOpen && !isFavoritesOpen && (
        <aside ref={barRef} tabIndex={-1} aria-label="Modelos seleccionados para comparar" className="store-motion store-comparison-bar fixed bottom-4 left-4 right-20 sm:right-auto sm:w-[min(620px,calc(100vw-15rem))] z-40 rounded-2xl border border-neutral-200 bg-white shadow-xl p-3 flex items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="text-xs sm:text-sm font-extrabold text-neutral-950">{selectedProducts.length}/2 modelos</p>
            <p className="text-[10px] sm:text-xs text-neutral-500 truncate">{selectedProducts.length === 1 ? "Elige otro para comparar" : "Listos para comparar"}</p>
          </div>
          <button type="button" disabled={selectedProducts.length !== 2} onClick={() => setIsOpen(true)} className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
            <GitCompareArrows aria-hidden="true" className="w-3.5 h-3.5 hidden sm:block" />
            Comparar
          </button>
          <button type="button" onClick={clearSelection} aria-label="Limpiar comparación" className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer shrink-0">
            <X aria-hidden="true" className="w-4 h-4" />
          </button>
        </aside>
      )}

      {visible && (
        <dialog
          ref={dialogRef}
          aria-labelledby="comparison-title"
          onCancel={(event) => { event.preventDefault(); setIsOpen(false); }}
          onClose={() => setIsOpen(false)}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            const rect = event.currentTarget.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setIsOpen(false);
          }}
          className="store-motion m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[85dvh] p-0 rounded-2xl bg-white border border-neutral-200 text-neutral-950 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs open:flex flex-col"
        >
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-start justify-between gap-3 shrink-0">
            <div>
              <h2 id="comparison-title" className="text-lg sm:text-xl font-extrabold tracking-tight">Compara tus audífonos</h2>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-500">Autonomía por carga, sin sumar las recargas del estuche.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar comparación" autoFocus className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer">
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto min-h-0">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <caption className="sr-only">Características de los dos modelos seleccionados</caption>
              <colgroup><col className="w-[28%]" /><col className="w-[36%]" /><col className="w-[36%]" /></colgroup>
              <thead>
                <tr>
                  <th scope="col" className="sticky top-0 z-10 bg-white p-2 sm:p-4 text-left align-top text-neutral-500 font-semibold break-words">Características</th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} scope="col" className="sticky top-0 z-10 bg-white p-2 sm:p-4 align-top text-left">
                      <div className="relative h-16 sm:h-24 mb-2 rounded-xl bg-white">
                        <Image src={getAssetUrl(product.images?.[0] || product.colors?.[0]?.image || "/placeholder-earbuds.svg")} alt={product.name} fill sizes="(max-width: 640px) 30vw, 250px" className="object-contain" />
                      </div>
                      <p className="font-extrabold leading-snug break-words">{product.name}</p>
                      <button type="button" onClick={() => toggleProduct(product.id)} aria-label={`Quitar ${product.name} de la comparación`} className="mt-2 inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-950 underline underline-offset-2 cursor-pointer">
                        Quitar
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-neutral-100 even:bg-neutral-50/60">
                    <th scope="row" className="px-2 py-3 sm:px-4 text-left font-semibold text-neutral-600 break-words">{row.label}</th>
                    {row.values.map((value, index) => <td key={selectedProducts[index].id} className="px-2 py-3 sm:px-4 text-left align-top font-medium break-words">{value}</td>)}
                  </tr>
                ))}
                <tr className="border-t border-neutral-200">
                  <th scope="row" className="p-2 sm:p-4 text-left font-semibold text-neutral-600">Ver detalle</th>
                  {selectedProducts.map((product) => (
                    <td key={product.id} className="p-2 sm:p-4">
                      <Link href={productHref(product)} onClick={() => setIsOpen(false)} className="inline-flex justify-center px-2 sm:px-3 py-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] sm:text-xs font-bold">Ver modelo</Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </dialog>
      )}
    </>
  );
}
