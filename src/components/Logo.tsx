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
      {/* Isotipo PulsoTech SVG Vectorial */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-sm shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/30 transition-all duration-300"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Base geométrica de la letra 'P' */}
          <path
            d="M 14 34 V 10 H 24 C 29.5 10 34 14.5 34 20 C 34 25.5 29.5 30 24 30 H 14"
            stroke="#FFFFFF"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Línea de Pulso Tecnológico / Onda Sonora Dinámica */}
          <path
            d="M 7 21 H 11 L 14 15 L 18 27 L 22 17 L 25 21 H 37"
            stroke="#38BDF8"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Punto de energía del pulso */}
          <circle cx="24" cy="20" r="1.6" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Tipografía PulsoTech */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-black tracking-tight leading-none ${textSize} text-neutral-950 transition-colors`}>
            Pulso<span className="text-blue-600">Tech</span>
          </div>
          <span className={`font-extrabold tracking-[0.22em] text-neutral-400 uppercase leading-tight mt-0.5 ${subSize}`}>
            Tecnología &amp; Audio
          </span>
        </div>
      )}
    </Link>
  );
}
