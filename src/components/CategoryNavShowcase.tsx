"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  subtitle: string;
  categoryQuery: string;
  description: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "audifonos",
    name: "Audífonos",
    subtitle: "Over-Ear & TWS",
    categoryQuery: "audífonos",
    description: "Audio de alta fidelidad y cancelación de ruido",
  },
  {
    id: "relojes",
    name: "Smartwatches",
    subtitle: "Salud & Deportes",
    categoryQuery: "smartwatches",
    description: "Monitoreo cardíaco, notificaciones y batería de larga duración",
  },
  {
    id: "cargadores",
    name: "Cargadores Portátiles",
    subtitle: "Powerbanks & Carga Rápida",
    categoryQuery: "cargadores",
    description: "Baterías externas y adaptadores GaN de alta potencia",
  },
  {
    id: "perifericos",
    name: "Periféricos PC",
    subtitle: "Teclados, Mouse & Hubs",
    categoryQuery: "periféricos",
    description: "Equipamiento para oficina, gaming y productividad",
  },
];

interface CategoryNavShowcaseProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryNavShowcase({
  selectedCategory,
  onSelectCategory,
}: CategoryNavShowcaseProps) {
  const handleCategoryClick = (categoryQuery: string) => {
    if (selectedCategory.toLowerCase() === categoryQuery.toLowerCase()) {
      onSelectCategory("todos");
    } else {
      onSelectCategory(categoryQuery);
    }

    const catalogoEl = document.getElementById("catalogo");
    if (catalogoEl) {
      catalogoEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-white border-b border-neutral-200/80 py-10 sm:py-14 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-100 text-neutral-800 mb-2">
              LÍNEAS PRINCIPALES
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
              Explora por Categoría
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Selecciona una categoría para filtrar los productos disponibles con entrega inmediata.
            </p>
          </div>

          {selectedCategory !== "todos" && (
            <button
              onClick={() => onSelectCategory("todos")}
              className="self-start sm:self-auto text-xs font-bold text-neutral-600 hover:text-black underline cursor-pointer transition-colors"
            >
              Restablecer / Ver todo el catálogo
            </button>
          )}
        </div>

        {/* 4 Responsive Interactive Category Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.categoryQuery.toLowerCase() ||
              (selectedCategory !== "todos" &&
                selectedCategory.toLowerCase().includes(cat.categoryQuery.toLowerCase()));

            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCategoryClick(cat.categoryQuery)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCategoryClick(cat.categoryQuery);
                  }
                }}
                className={`group relative flex flex-col items-center text-center p-5 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-neutral-950 text-white border-neutral-950 shadow-xl ring-2 ring-neutral-900"
                    : "bg-white text-neutral-900 border-neutral-200/90 hover:border-neutral-900 hover:shadow-xl hover:-translate-y-1.5"
                }`}
              >
                {/* Visual Glow Layer on Hover */}
                <div
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                    isSelected
                      ? "opacity-10 bg-radial from-white to-transparent"
                      : "opacity-0 group-hover:opacity-100 bg-radial from-neutral-100 to-transparent"
                  }`}
                />

                {/* Top Corner Action Indicator */}
                <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ArrowUpRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      isSelected ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  />
                </div>

                {/* Animated Drawing / Icon Frame */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-4 transition-transform duration-300 ease-out group-hover:scale-108">
                  {cat.id === "audifonos" && (
                    <AudifonosDrawing isSelected={isSelected} />
                  )}
                  {cat.id === "relojes" && (
                    <SmartwatchDrawing isSelected={isSelected} />
                  )}
                  {cat.id === "cargadores" && (
                    <CargadoresDrawing isSelected={isSelected} />
                  )}
                  {cat.id === "perifericos" && (
                    <PerifericosClusterDrawing isSelected={isSelected} />
                  )}
                </div>

                {/* Label Title */}
                <h3
                  className={`text-base sm:text-lg font-black tracking-tight mb-1 transition-colors ${
                    isSelected ? "text-white" : "text-neutral-950 group-hover:text-black"
                  }`}
                >
                  {cat.name}
                </h3>

                {/* Subtitle */}
                <p
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    isSelected
                      ? "text-neutral-300"
                      : "text-neutral-500 group-hover:text-neutral-700"
                  }`}
                >
                  {cat.subtitle}
                </p>

                {/* Animated Bottom Indicator Line */}
                <div className="mt-4 w-full flex justify-center">
                  <div
                    className={`h-0.5 rounded-full transition-all duration-300 ${
                      isSelected
                        ? "w-14 bg-white"
                        : "w-0 group-hover:w-12 bg-neutral-950"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

{/* 1. Dibujo de Audífono con animación acústica en hover */}
function AudifonosDrawing({ isSelected }: { isSelected: boolean }) {
  const mainColor = isSelected ? "#ffffff" : "#111113";
  const innerLight = isSelected ? "#111113" : "#ffffff";

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soundwaves left (pulses on hover) */}
      <path
        d="M 10 44 C 7 50, 7 58, 10 64"
        stroke={mainColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-all duration-300 opacity-30 group-hover:opacity-100 group-hover:scale-105 origin-center"
      />
      <path
        d="M 5 38 C 1 48, 1 60, 5 70"
        stroke={mainColor}
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all duration-300 opacity-20 group-hover:opacity-80 group-hover:scale-110 origin-center"
      />

      {/* Soundwaves right (pulses on hover) */}
      <path
        d="M 90 44 C 93 50, 93 58, 90 64"
        stroke={mainColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-all duration-300 opacity-30 group-hover:opacity-100 group-hover:scale-105 origin-center"
      />
      <path
        d="M 95 38 C 99 48, 99 60, 95 70"
        stroke={mainColor}
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all duration-300 opacity-20 group-hover:opacity-80 group-hover:scale-110 origin-center"
      />

      {/* Main Curved Headband */}
      <path
        d="M 22 52 C 22 24, 34 10, 50 10 C 66 10, 78 24, 78 52"
        stroke={mainColor}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Cushioned Headband Inner Ribs */}
      <path
        d="M 28 46 C 28 28, 38 16, 50 16 C 62 16, 72 28, 72 46"
        stroke={mainColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 3"
        opacity="0.5"
      />

      {/* Slider Arms / Hinges */}
      <rect x="17" y="48" width="10" height="7" rx="2" fill={mainColor} />
      <rect x="73" y="48" width="10" height="7" rx="2" fill={mainColor} />

      {/* Left Earcup */}
      <g className="transition-transform duration-300 group-hover:-translate-x-0.5">
        <rect x="14" y="52" width="16" height="32" rx="8" fill={mainColor} />
        {/* Cushion contour */}
        <rect
          x="19"
          y="56"
          width="6"
          height="24"
          rx="3"
          fill={innerLight}
          opacity="0.35"
        />
        {/* Driver core detail */}
        <circle cx="22" cy="68" r="2" fill={innerLight} opacity="0.6" />
      </g>

      {/* Right Earcup */}
      <g className="transition-transform duration-300 group-hover:translate-x-0.5">
        <rect x="70" y="52" width="16" height="32" rx="8" fill={mainColor} />
        {/* Cushion contour */}
        <rect
          x="75"
          y="56"
          width="6"
          height="24"
          rx="3"
          fill={innerLight}
          opacity="0.35"
        />
        {/* Driver core detail */}
        <circle cx="78" cy="68" r="2" fill={innerLight} opacity="0.6" />
      </g>
    </svg>
  );
}

{/* 2. Dibujo de Smartwatch con pulso cardíaco y pantalla interactiva */}
function SmartwatchDrawing({ isSelected }: { isSelected: boolean }) {
  const mainColor = isSelected ? "#ffffff" : "#111113";
  const innerLight = isSelected ? "#111113" : "#ffffff";

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Strap */}
      <path
        d="M 37 4 L 37 24 L 63 24 L 63 4 Z"
        fill={mainColor}
      />
      {/* Strap texture ridges */}
      <line x1="42" y1="10" x2="58" y2="10" stroke={innerLight} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="42" y1="16" x2="58" y2="16" stroke={innerLight} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Bottom Strap */}
      <path
        d="M 37 76 L 37 96 L 63 96 L 63 76 Z"
        fill={mainColor}
      />
      {/* Strap holes */}
      <circle cx="50" cy="83" r="1.8" fill={innerLight} opacity="0.4" />
      <circle cx="50" cy="90" r="1.8" fill={innerLight} opacity="0.4" />

      {/* Watch Case Frame */}
      <rect x="27" y="21" width="46" height="58" rx="15" fill={mainColor} />

      {/* Digital Crown & Side Button */}
      <rect x="73" y="32" width="4" height="11" rx="2" fill={mainColor} />
      <rect x="73" y="49" width="2.5" height="9" rx="1.2" fill={mainColor} />

      {/* Screen Area */}
      <rect x="31" y="25" width="38" height="50" rx="11" fill={innerLight} />

      {/* Screen Digital Time */}
      <text
        x="50"
        y="43"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fill={mainColor}
        fontFamily="sans-serif"
        letterSpacing="-0.5px"
      >
        10:08
      </text>

      {/* Screen ECG Heart Rate Pulse Line (Interactive on hover) */}
      <path
        d="M 35 56 L 42 56 L 45 49 L 48 62 L 51 52 L 54 58 L 56 56 L 65 56"
        stroke={mainColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300 group-hover:stroke-emerald-500"
      />

      {/* Bottom Fitness Ring Dots */}
      <circle cx="43" cy="67" r="2.5" fill={mainColor} opacity="0.9" />
      <circle cx="50" cy="67" r="2.5" fill={mainColor} opacity="0.5" />
      <circle cx="57" cy="67" r="2.5" fill={mainColor} opacity="0.25" />
    </svg>
  );
}

{/* 3. Dibujo de Cargadores Portátiles (Powerbank + Cargador de Pared) */}
function CargadoresDrawing({ isSelected }: { isSelected: boolean }) {
  const mainColor = isSelected ? "#ffffff" : "#111113";
  const innerLight = isSelected ? "#111113" : "#ffffff";

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Powerbank Body */}
      <g className="transition-transform duration-300 group-hover:-translate-y-1">
        {/* Powerbank Chassis */}
        <rect x="18" y="16" width="38" height="68" rx="8" fill={mainColor} />

        {/* Top Connectors Cap */}
        <rect x="25" y="11" width="10" height="5" rx="1.5" fill={mainColor} />
        <rect x="39" y="11" width="10" height="5" rx="1.5" fill={mainColor} />

        {/* USB Ports Outline */}
        <rect x="26" y="22" width="22" height="4.5" rx="2" fill={innerLight} opacity="0.35" />

        {/* 4 LED Battery Indicator Dots (Illuminates in sequence on hover) */}
        <circle
          cx="28"
          cy="34"
          r="2.2"
          fill={innerLight}
          className="transition-all duration-300 group-hover:fill-emerald-400"
        />
        <circle
          cx="34"
          cy="34"
          r="2.2"
          fill={innerLight}
          className="transition-all duration-300 delay-75 group-hover:fill-emerald-400"
        />
        <circle
          cx="40"
          cy="34"
          r="2.2"
          fill={innerLight}
          className="transition-all duration-300 delay-150 group-hover:fill-emerald-400"
        />
        <circle
          cx="46"
          cy="34"
          r="2.2"
          fill={innerLight}
          className="transition-all duration-300 delay-200 group-hover:fill-emerald-400"
        />

        {/* Fast-Charge Lightning Bolt (Scales on hover) */}
        <path
          d="M 40 45 L 30 57 L 37 57 L 34 69 L 45 54 L 38 54 Z"
          fill={innerLight}
          className="transition-transform duration-300 group-hover:scale-115 origin-center group-hover:fill-emerald-400"
        />
      </g>

      {/* Secondary Fast Charger GaN Cube with wall prongs */}
      <g className="transition-transform duration-300 group-hover:translate-y-0.5">
        {/* Wall plug prongs */}
        <rect x="68" y="70" width="3.5" height="12" rx="1" fill={mainColor} />
        <rect x="76" y="70" width="3.5" height="12" rx="1" fill={mainColor} />

        {/* GaN Charger Cube */}
        <rect x="62" y="44" width="24" height="26" rx="5" fill={mainColor} />

        {/* Type-C Output Port */}
        <rect x="68" y="52" width="12" height="4.5" rx="2" fill={innerLight} opacity="0.4" />
        <line x1="74" y1="62" x2="74" y2="65" stroke={innerLight} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

        {/* Flexible connecting cable arc */}
        <path
          d="M 56 26 C 68 26, 74 34, 74 44"
          stroke={mainColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="3 3"
          className="transition-opacity duration-300 opacity-60 group-hover:opacity-100"
        />
      </g>
    </svg>
  );
}

{/* 4. Dibujo de Periféricos de Computadora (Cluster variado estilo la captura: teclado, mouse, hub y micrófono) */}
function PerifericosClusterDrawing({ isSelected }: { isSelected: boolean }) {
  const mainColor = isSelected ? "#ffffff" : "#111113";
  const innerLight = isSelected ? "#111113" : "#ffffff";

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Elemento 1: Teclado Mecánico (Superior Izquierda) */}
      <g className="transition-transform duration-300 group-hover:-translate-y-0.5">
        <rect x="6" y="10" width="44" height="26" rx="4" fill={mainColor} />
        {/* Keycap top strip */}
        <rect x="9" y="13" width="38" height="3" rx="0.8" fill={innerLight} opacity="0.4" />
        {/* Key rows */}
        <line x1="9" y1="20" x2="47" y2="20" stroke={innerLight} strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1="9" y1="25" x2="47" y2="25" stroke={innerLight} strokeWidth="1.5" strokeDasharray="4 2" />
        {/* Spacebar */}
        <rect x="18" y="29.5" width="20" height="2.5" rx="1" fill={innerLight} opacity="0.7" />
      </g>

      {/* Elemento 2: Mouse Óptico Ergonómico (Superior Derecha) */}
      <g className="transition-transform duration-300 group-hover:translate-x-0.5">
        {/* Mouse chassis */}
        <path
          d="M 67 9 C 60 9, 56 15, 56 24 C 56 34, 60 41, 67 41 C 74 41, 78 34, 78 24 C 78 15, 74 9, 67 9 Z"
          fill={mainColor}
        />
        {/* Click separation slit */}
        <line x1="67" y1="10" x2="67" y2="24" stroke={innerLight} strokeWidth="1.2" />
        {/* Scroll wheel */}
        <rect x="65.5" y="14" width="3" height="6.5" rx="1.5" fill={innerLight} />
        {/* Ergonomic grip arc */}
        <path d="M 61 31 C 63 33, 71 33, 73 31" stroke={innerLight} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      </g>

      {/* Elemento 3: Hub USB-C Multipuerto con Cable Trenzado (Inferior Izquierda) */}
      <g className="transition-transform duration-300 group-hover:-translate-x-0.5">
        <rect x="8" y="52" width="40" height="24" rx="4" fill={mainColor} />
        {/* USB-C braided cable loop */}
        <path
          d="M 8 64 C 2 64, 2 48, 8 44 L 14 44"
          stroke={mainColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Multi-port cutouts */}
        <rect x="13" y="58" width="8" height="3.5" rx="0.8" fill={innerLight} opacity="0.45" />
        <rect x="24" y="58" width="8" height="3.5" rx="0.8" fill={innerLight} opacity="0.45" />
        <rect x="35" y="58" width="8" height="3.5" rx="0.8" fill={innerLight} opacity="0.45" />
        {/* SD / Audio slot */}
        <line x1="13" y1="67" x2="30" y2="67" stroke={innerLight} strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
      </g>

      {/* Elemento 4: Micrófono de Estudio / Streaming en Trípode (Inferior Derecha) */}
      <g className="transition-transform duration-300 group-hover:translate-y-0.5">
        {/* Mic capsule */}
        <rect x="64" y="47" width="16" height="24" rx="8" fill={mainColor} />
        {/* Grille mesh lines */}
        <line x1="68" y1="54" x2="76" y2="54" stroke={innerLight} strokeWidth="1.2" opacity="0.45" />
        <line x1="68" y1="58" x2="76" y2="58" stroke={innerLight} strokeWidth="1.2" opacity="0.45" />
        <line x1="68" y1="62" x2="76" y2="62" stroke={innerLight} strokeWidth="1.2" opacity="0.45" />
        {/* Shock mount cradle */}
        <path
          d="M 59 58 C 59 70, 85 70, 85 58"
          stroke={mainColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Stand shaft */}
        <line x1="72" y1="69" x2="72" y2="80" stroke={mainColor} strokeWidth="2.5" />
        {/* Tripod base */}
        <line x1="58" y1="81" x2="86" y2="81" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
