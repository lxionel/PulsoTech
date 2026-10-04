"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export default function Logo({
  className = "",
  showText = true,
  size = "md",
  inverted = false,
  onClick,
}: LogoProps) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 40 : 34;
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";
  const subSize = size === "sm" ? "text-[8px]" : size === "lg" ? "text-[10px]" : "text-[9px]";

  return (
    <Link href="/" onClick={onClick} className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Isotipo PulsoTech: Cubo Isométrico Geométrico Puro Sin Fondo */}
      <div 
        className={`relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
          inverted ? "text-white" : "text-neutral-950"
        }`}
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Perímetro hexagonal exterior del cubo */}
          <path
            d="M22 5L37 13.5V30.5L22 39L7 30.5V13.5L22 5Z"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          {/* Arista vertical interior central */}
          <path
            d="M22 22V39"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Aristas superiores en 'Y' que definen las tres caras del cubo */}
          <path
            d="M7 13.5L22 22L37 13.5"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Tipografía PulsoTech Unificada de Alta Gama */}
      {showText && (
        <div className="flex items-center">
          <span
            className={`font-black tracking-tight leading-none ${textSize} transition-colors ${
              inverted ? "text-white" : "text-neutral-950"
            }`}
          >
            PulsoTech
          </span>
        </div>
      )}
    </Link>
  );
}
