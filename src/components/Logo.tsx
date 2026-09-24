"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? 32 : size === "lg" ? 44 : 38;
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";
  const subSize = size === "sm" ? "text-[8px]" : size === "lg" ? "text-[10px]" : "text-[9px]";

  return (
    <Link href="/" className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Isotipo PulsoTech SVG Vectorial de Alta Fidelidad */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-neutral-950 border border-neutral-900 shadow-2xs group-hover:bg-neutral-900 transition-all duration-200"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5"
        >
          {/* Barra vertical principal (Tronco P) */}
          <rect x="11" y="9" width="4" height="26" rx="2" fill="#FFFFFF"/>
          {/* Barras acústicas de pulso y ecualizador que configuran el bucle dinámico de la P */}
          <rect x="18" y="9" width="4" height="15" rx="2" fill="#FFFFFF"/>
          <rect x="25" y="11.5" width="4" height="10" rx="2" fill="#FFFFFF"/>
          <rect x="32" y="14" width="4" height="5" rx="2" fill="#FFFFFF"/>
        </svg>
      </div>

      {/* Tipografía PulsoTech Unificada de Alta Gama */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className={`font-black tracking-tight leading-none ${textSize} text-neutral-950 transition-colors`}>
            PulsoTech
          </div>
          <span className={`font-bold tracking-[0.18em] text-neutral-500 uppercase leading-none mt-1 ${subSize}`}>
            Tecnología &amp; Audio
          </span>
        </div>
      )}
    </Link>
  );
}
