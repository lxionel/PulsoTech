"use client";

import React, { useState } from "react";
import { PRODUCTS, TECH_CATEGORIES, STORE_SETTINGS } from "@/data/products";
import ProductCard from "./ProductCard";
import { Search, Filter, Layers, Headphones, BatteryCharging, Watch, ArrowDown } from "lucide-react";

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter((product) => {
    let matchesCategory = true;
    if (selectedCategory === "audio") {
      matchesCategory = product.tags.includes("Audio");
    } else if (selectedCategory === "energia") {
      matchesCategory = product.tags.includes("Carga Rápida");
    } else if (selectedCategory === "wearables") {
      matchesCategory = product.tags.includes("Wearable");
    } else if (selectedCategory !== "todos") {
      matchesCategory = product.category === selectedCategory;
    }

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalogo-completo" className="pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Welcome & Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-neutral-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-mono uppercase font-bold tracking-wider">
            <Layers className="w-3.5 h-3.5 text-neutral-900" />
            <span>CATÁLOGO GENERAL DISPONIBLE // PERÚ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950">
            Catálogo Completo de Productos
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
            Explora todos nuestros accesorios tecnológicos en stock. Selecciona el modelo que necesitas, agrégalo a tu bolsa y coordina la entrega directamente por WhatsApp.
          </p>

          {/* Quick jump to accessory sections */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-neutral-400 font-mono">Ver por sección:</span>
            <a
              href="#seccion-audio"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-black hover:border-black transition-colors shadow-xs"
            >
              <Headphones className="w-3.5 h-3.5 text-neutral-900" />
              <span>Sección de Audífonos (con modelo 3D)</span>
            </a>
            <a
              href="#seccion-carga"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-black hover:border-black transition-colors shadow-xs"
            >
              <BatteryCharging className="w-3.5 h-3.5 text-neutral-900" />
              <span>Sección Carga GaN</span>
            </a>
            <a
              href="#seccion-wearables"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-black hover:border-black transition-colors shadow-xs"
            >
              <Watch className="w-3.5 h-3.5 text-neutral-900" />
              <span>Sección Wearables</span>
            </a>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por accesorio, modelo o spec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <span className="text-xs text-neutral-400 font-mono uppercase flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" />
          Filtro:
        </span>

        {TECH_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-black text-white shadow-xs"
                : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300"
            }`}
          >
            {cat.name}
            {cat.tag && (
              <span
                className={`ml-1.5 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id
                    ? "bg-neutral-800 text-neutral-200"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {cat.tag}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Complete Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-neutral-200 bg-white p-8">
          <p className="text-neutral-500 text-sm">No encontramos accesorios con ese criterio de búsqueda.</p>
          <button
            onClick={() => {
              setSelectedCategory("todos");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs hover:bg-neutral-800"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </section>
  );
}
