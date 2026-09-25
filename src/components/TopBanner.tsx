"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, Sparkles } from "lucide-react";

export default function TopBanner() {
  const { storeBanner } = useCart();
  const [dismissed, setDismissed] = useState(false);

  if (!storeBanner.enabled || !storeBanner.text.trim() || dismissed) {
    return null;
  }

  const themeStyles = {
    emerald: "bg-emerald-600 text-white",
    dark: "bg-neutral-950 text-white",
    blue: "bg-blue-600 text-white",
    rose: "bg-rose-600 text-white",
  }[storeBanner.theme] || "bg-emerald-600 text-white";

  return (
    <div className={`w-full py-2 px-3 text-xs font-medium transition-all duration-300 relative z-50 ${themeStyles}`}>
      <div className="max-w-[1650px] mx-auto flex items-center justify-between gap-2 px-2">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          {storeBanner.badge && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{storeBanner.badge}</span>
            </span>
          )}
          <span className="font-semibold text-xs sm:text-[13px]">{storeBanner.text}</span>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 text-white/70 hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
          aria-label="Cerrar anuncio"
          title="Cerrar anuncio"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
