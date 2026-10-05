"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy, MessageSquare, Share2, X } from "lucide-react";
import {
  type ShareableProduct,
  type ProductShareData,
  buildProductShareData,
  buildWhatsAppShareUrl,
} from "@/lib/product-share";

export default function ShareProductButton({ product, compact = false }: { product: ShareableProduct; compact?: boolean }) {
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [data, setData] = useState<ProductShareData | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "manual">("idle");

  const closePanel = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleShare = async () => {
    if (isOpen) {
      closePanel();
      return;
    }
    const shareData = buildProductShareData(product, window.location.href);
    setData(shareData);
    setCopyStatus("idle");

    let canShare = typeof navigator.share === "function";
    if (canShare && typeof navigator.canShare === "function") {
      try { canShare = navigator.canShare(shareData); }
      catch { canShare = false; }
    }
    if (!canShare) {
      setIsOpen(true);
      return;
    }

    setIsSharing(true);
    try {
      // Call immediately from the click to preserve the browser's user activation.
      await navigator.share(shareData);
    } catch (error) {
      const cancelled = typeof error === "object" && error !== null &&
        "name" in error && error.name === "AbortError";
      if (!cancelled) setIsOpen(true);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    if (!data || isCopying) return;
    setIsCopying(true);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(data.url);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("manual");
      linkRef.current?.focus();
      linkRef.current?.select();
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="store-motion space-y-2" onKeyDown={(event) => {
      if (event.key === "Escape" && isOpen) { event.preventDefault(); closePanel(); }
    }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleShare}
        disabled={isSharing}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        className={compact ? "min-h-11 inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-950 disabled:opacity-60 cursor-pointer" : "inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-950 hover:border-neutral-300 text-xs font-bold transition-colors active:scale-95 disabled:opacity-60 cursor-pointer disabled:cursor-wait"}
      >
        <Share2 aria-hidden="true" className="w-3.5 h-3.5" />
        {isSharing ? "Compartiendo…" : compact ? "Compartir" : "Compartir producto"}
      </button>

      {isOpen && data && (
        <div id={panelId} role="group" aria-label="Opciones para compartir producto" className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-neutral-900">Comparte este modelo</span>
            <button type="button" onClick={closePanel} aria-label="Cerrar opciones para compartir" className="p-1 rounded-md text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer">
              <X aria-hidden="true" className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={buildWhatsAppShareUrl(data)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors">
              <MessageSquare aria-hidden="true" className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <button type="button" onClick={handleCopy} disabled={isCopying} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60">
              {copyStatus === "copied" ? <Check aria-hidden="true" className="w-3.5 h-3.5" /> : <Copy aria-hidden="true" className="w-3.5 h-3.5" />}
              {copyStatus === "copied" ? "Copiado" : "Copiar enlace"}
            </button>
          </div>
          <input ref={linkRef} type="text" readOnly value={data.url} aria-label="Enlace de este producto" onFocus={(event) => event.currentTarget.select()} className="w-full min-w-0 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-[11px] text-neutral-600" />
          <p role="status" className="text-[11px] text-neutral-500 leading-relaxed">
            {copyStatus === "copied" ? "Enlace copiado. Ya puedes pegarlo en tu conversación." : copyStatus === "manual" ? "Selecciona y copia el enlace para compartirlo." : "Envía el modelo a quien quieras."}
          </p>
        </div>
      )}
    </div>
  );
}
