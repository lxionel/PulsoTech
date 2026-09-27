"use client";

import React from "react";
import { useRouter } from "next/navigation";

const CATEGORY_ITEMS = [
  {
    id: "audifonos",
    name: "Audífonos",
    query: "audífonos",
    available: true,
  },
  {
    id: "relojes",
    name: "Relojes",
    query: "smartwatches",
    available: false,
  },
  {
    id: "cargadores",
    name: "Cargadores portátiles",
    query: "cargadores",
    available: true,
  },
  {
    id: "perifericos",
    name: "Periféricos de computadora",
    query: "periféricos",
    available: false,
  },
];

export default function CategoryNavShowcase() {
  const router = useRouter();

  const handleCategoryClick = (item: typeof CATEGORY_ITEMS[0]) => {
    if (!item.available) return;
    router.push(`/catalogo?categoria=${encodeURIComponent(item.query)}`);
  };

  return (
    <div className="w-full bg-white py-3.5 sm:py-5 border-t border-neutral-200 shadow-xs shrink-0 select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Fila limpia de dibujos centrados exactamente como en la captura de referencia */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 items-center justify-center">
          {CATEGORY_ITEMS.map((item) => {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCategoryClick(item)}
                disabled={!item.available}
                className={`group flex flex-col items-center justify-center py-1.5 px-2 text-center transition-all duration-200 focus:outline-none relative ${
                  item.available ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                }`}
              >
                {!item.available && (
                  <span className="absolute -top-2 bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full z-10">
                    Próximamente
                  </span>
                )}
                {/* Dibujo limpio y estilizado con animacion suave al pasar el cursor */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-neutral-900 transition-transform duration-200 ${item.available ? "group-hover:text-black group-hover:-translate-y-1 group-hover:scale-105" : ""}`}>
                  {item.id === "audifonos" && <AudifonosIcon />}
                  {item.id === "relojes" && <RelojIcon />}
                  {item.id === "cargadores" && <CargadorIcon />}
                  {item.id === "perifericos" && <PerifericosClusterIcon />}
                </div>

                {/* Texto exacto centrado debajo del dibujo */}
                <span className={`mt-2 text-xs sm:text-sm font-semibold tracking-tight transition-colors text-neutral-800 ${item.available ? "group-hover:text-black" : ""}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

{/* 1. Dibujo limpio y proporcionado de Audífonos estilo vectorial negro solido */}
function AudifonosIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-13 h-13 sm:w-15 sm:h-15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Diadema curva ancha ergonomica */}
      <path
        d="M 16 44 C 16 18, 27 8, 40 8 C 53 8, 64 18, 64 44"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Pasadores laterales */}
      <rect x="13" y="36" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="59" y="36" width="8" height="8" rx="2" fill="currentColor" />
      {/* Almohadilla izquierda over-ear */}
      <rect x="10" y="40" width="14" height="26" rx="6" fill="currentColor" />
      <rect x="17" y="44" width="4" height="18" rx="2" fill="#ffffff" />
      {/* Almohadilla derecha over-ear */}
      <rect x="56" y="40" width="14" height="26" rx="6" fill="currentColor" />
      <rect x="59" y="44" width="4" height="18" rx="2" fill="#ffffff" />
    </svg>
  );
}

{/* 2. Dibujo limpio de Reloj / Smartwatch */}
function RelojIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-13 h-13 sm:w-15 sm:h-15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Correa superior */}
      <path d="M 27 6 L 27 20 L 53 20 L 53 6 Z" fill="currentColor" />
      <line x1="32" y1="12" x2="48" y2="12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Correa inferior */}
      <path d="M 27 60 L 27 74 L 53 74 L 53 60 Z" fill="currentColor" />
      <circle cx="40" cy="67" r="1.5" fill="#ffffff" />
      {/* Cuerpo del reloj */}
      <rect x="21" y="18" width="38" height="44" rx="12" fill="currentColor" />
      {/* Boton corona lateral */}
      <rect x="59" y="27" width="3.5" height="9" rx="1.5" fill="currentColor" />
      {/* Pantalla interior */}
      <rect x="25" y="22" width="30" height="36" rx="8" fill="#ffffff" />
      {/* Hora digital 10:08 */}
      <text
        x="40"
        y="37"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="900"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        10:08
      </text>
      {/* Linea de pulso / actividad fitness */}
      <path
        d="M 29 46 L 35 46 L 38 41 L 41 50 L 44 43 L 46 47 L 51 47"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

{/* 3. Dibujo limpio de Cargadores Portátiles (Bateria externa powerbank + cargador) */}
function CargadorIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-13 h-13 sm:w-15 sm:h-15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chasis de bateria externa */}
      <rect x="15" y="14" width="32" height="52" rx="7" fill="currentColor" />
      {/* Conectores superiores */}
      <rect x="20" y="10" width="8" height="4" rx="1" fill="currentColor" />
      <rect x="34" y="10" width="8" height="4" rx="1" fill="currentColor" />
      {/* Rayo de carga rápida */}
      <path d="M 33 26 L 25 39 L 31 39 L 29 52 L 39 37 L 32 37 Z" fill="#ffffff" />
      {/* 4 puntos LED de nivel de batería */}
      <circle cx="21" cy="20" r="1.5" fill="#ffffff" />
      <circle cx="26" cy="20" r="1.5" fill="#ffffff" />
      <circle cx="31" cy="20" r="1.5" fill="#ffffff" />
      <circle cx="36" cy="20" r="1.5" fill="#ffffff" />
      {/* Cubo cargador compacto de pared al lado */}
      <rect x="52" y="34" width="18" height="22" rx="4" fill="currentColor" />
      <rect x="56" y="56" width="2.5" height="7" rx="1" fill="currentColor" />
      <rect x="63.5" y="56" width="2.5" height="7" rx="1" fill="currentColor" />
      <rect x="56" y="42" width="10" height="3.5" rx="1" fill="#ffffff" />
    </svg>
  );
}

{/* 4. Dibujo de Periféricos de Computadora (Cluster variado estilo la captura: teclado, mouse, hub y micrófono) */}
function PerifericosClusterIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-13 h-13 sm:w-15 sm:h-15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Teclado (Superior Izquierda) */}
      <rect x="6" y="10" width="34" height="20" rx="3" fill="currentColor" />
      <line x1="9" y1="16" x2="37" y2="16" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 2" />
      <line x1="9" y1="21" x2="37" y2="21" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 2" />
      <rect x="15" y="24" width="16" height="2" rx="0.5" fill="#ffffff" />

      {/* Mouse (Superior Derecha) */}
      <path d="M 54 8 C 48 8, 45 13, 45 20 C 45 28, 48 34, 54 34 C 60 34, 63 28, 63 20 C 63 13, 60 8, 54 8 Z" fill="currentColor" />
      <line x1="54" y1="9" x2="54" y2="20" stroke="#ffffff" strokeWidth="1" />
      <rect x="53" y="12" width="2" height="5" rx="1" fill="#ffffff" />

      {/* Hub USB-C con cable (Inferior Izquierda) */}
      <rect x="8" y="46" width="30" height="18" rx="3" fill="currentColor" />
      <path d="M 8 55 C 3 55, 3 44, 8 40 L 14 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="12" y="50" width="6" height="3" rx="0.5" fill="#ffffff" />
      <rect x="20" y="50" width="6" height="3" rx="0.5" fill="#ffffff" />
      <rect x="28" y="50" width="6" height="3" rx="0.5" fill="#ffffff" />
      <line x1="12" y1="58" x2="24" y2="58" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

      {/* Micrófono en trípode (Inferior Derecha) */}
      <rect x="50" y="42" width="12" height="18" rx="6" fill="currentColor" />
      <line x1="53" y1="47" x2="59" y2="47" stroke="#ffffff" strokeWidth="1" />
      <line x1="53" y1="51" x2="59" y2="51" stroke="#ffffff" strokeWidth="1" />
      <path d="M 46 51 C 46 60, 66 60, 66 51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="56" y1="60" x2="56" y2="68" stroke="currentColor" strokeWidth="2" />
      <line x1="48" y1="68" x2="64" y2="68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
