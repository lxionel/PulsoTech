"use client";

import React from "react";

interface CategoryNavShowcaseProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_ITEMS = [
  {
    id: "audifonos",
    name: "Audífonos",
    query: "audífonos",
  },
  {
    id: "relojes",
    name: "Relojes",
    query: "smartwatches",
  },
  {
    id: "cargadores",
    name: "Cargadores portátiles",
    query: "cargadores",
  },
  {
    id: "perifericos",
    name: "Periféricos de computadora",
    query: "periféricos",
  },
];

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
    <section className="w-full bg-white py-5 sm:py-7 border-b border-neutral-100 select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Fila limpia de dibujos centrados exactamente como en la captura de referencia */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 items-center justify-center">
          {CATEGORY_ITEMS.map((item) => {
            const isSelected =
              selectedCategory.toLowerCase() === item.query.toLowerCase() ||
              (selectedCategory !== "todos" &&
                selectedCategory.toLowerCase().includes(item.query.toLowerCase()));

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCategoryClick(item.query)}
                className="group flex flex-col items-center justify-center py-2 px-3 cursor-pointer text-center transition-all duration-200 focus:outline-none"
              >
                {/* Dibujo limpio y estilizado con animacion suave al pasar el cursor */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-neutral-900 group-hover:text-black transition-transform duration-200 group-hover:-translate-y-1.5 group-hover:scale-105">
                  {item.id === "audifonos" && <AudifonosIcon />}
                  {item.id === "relojes" && <RelojIcon />}
                  {item.id === "cargadores" && <CargadorIcon />}
                  {item.id === "perifericos" && <PerifericosClusterIcon />}
                </div>

                {/* Texto exacto centrado debajo del dibujo */}
                <span
                  className={`mt-2.5 text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                    isSelected
                      ? "text-black font-extrabold underline underline-offset-4 decoration-2"
                      : "text-neutral-800 group-hover:text-black"
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

{/* 1. Dibujo limpio de Audífonos (Estilo vectorial negro solido sin ondas extrañas) */}
function AudifonosIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-14 h-14 sm:w-16 sm:h-16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Diadema curva continua solida */}
      <path
        d="M 18 42 C 18 20, 28 10, 40 10 C 52 10, 62 20, 62 42"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Pasadores de ajuste */}
      <rect x="15" y="38" width="6" height="8" rx="1.5" fill="currentColor" />
      <rect x="59" y="38" width="6" height="8" rx="1.5" fill="currentColor" />
      {/* Almohadilla izquierda */}
      <rect x="13" y="42" width="10" height="24" rx="5" fill="currentColor" />
      <rect x="19" y="46" width="3" height="16" rx="1" fill="#ffffff" />
      {/* Almohadilla derecha */}
      <rect x="57" y="42" width="10" height="24" rx="5" fill="currentColor" />
      <rect x="58" y="46" width="3" height="16" rx="1" fill="#ffffff" />
    </svg>
  );
}

{/* 2. Dibujo limpio de Reloj / Smartwatch */}
function RelojIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-14 h-14 sm:w-16 sm:h-16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Correa superior */}
      <path d="M 28 6 L 28 20 L 52 20 L 52 6 Z" fill="currentColor" />
      <line x1="33" y1="12" x2="47" y2="12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Correa inferior */}
      <path d="M 28 60 L 28 74 L 52 74 L 52 60 Z" fill="currentColor" />
      <circle cx="40" cy="67" r="1.5" fill="#ffffff" />
      {/* Cuerpo del reloj */}
      <rect x="22" y="18" width="36" height="44" rx="12" fill="currentColor" />
      {/* Boton corona lateral */}
      <rect x="58" y="28" width="3" height="8" rx="1.5" fill="currentColor" />
      {/* Pantalla interior */}
      <rect x="26" y="22" width="28" height="36" rx="8" fill="#ffffff" />
      {/* Esfera con manecillas */}
      <circle cx="40" cy="40" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="40" y1="40" x2="40" y2="33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="40" x2="46" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="40" r="1.5" fill="currentColor" />
    </svg>
  );
}

{/* 3. Dibujo limpio de Cargadores Portátiles (Bateria externa powerbank + cargador) */}
function CargadorIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-14 h-14 sm:w-16 sm:h-16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chasis de bateria externa */}
      <rect x="18" y="14" width="30" height="52" rx="6" fill="currentColor" />
      {/* Conectores superiores */}
      <rect x="23" y="10" width="8" height="4" rx="1" fill="currentColor" />
      <rect x="35" y="10" width="8" height="4" rx="1" fill="currentColor" />
      {/* Rayo de carga rápida */}
      <path d="M 35 28 L 27 40 L 33 40 L 31 52 L 41 38 L 34 38 Z" fill="#ffffff" />
      {/* 4 puntos LED de nivel de batería */}
      <circle cx="25" cy="22" r="1.5" fill="#ffffff" />
      <circle cx="30" cy="22" r="1.5" fill="#ffffff" />
      <circle cx="35" cy="22" r="1.5" fill="#ffffff" />
      <circle cx="40" cy="22" r="1.5" fill="#ffffff" />
      {/* Cubo cargador compacto de pared al lado */}
      <rect x="52" y="34" width="18" height="20" rx="4" fill="currentColor" />
      <rect x="56" y="54" width="2.5" height="8" rx="1" fill="currentColor" />
      <rect x="63.5" y="54" width="2.5" height="8" rx="1" fill="currentColor" />
      <rect x="56" y="41" width="10" height="3" rx="1" fill="#ffffff" />
    </svg>
  );
}

{/* 4. Dibujo de Periféricos de Computadora (Cluster variado estilo la captura: teclado, mouse, hub y micrófono) */}
function PerifericosClusterIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-14 h-14 sm:w-16 sm:h-16"
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
