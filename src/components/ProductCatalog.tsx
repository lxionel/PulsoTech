"use client";

import React, { useState } from "react";
import { PRODUCTS, TECH_CATEGORIES } from "@/data/products";
import ProductCard from "./ProductCard";
import { Search, Filter, Layers } from "lucide-react";

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter((product) => {
    let matchesCategory = true;
    if (selectedCategory === "audio") {
      matchesCategory = product.tags.includes("Audio");
    } else if (selectedCategory !== "todos") {
      matchesCategory = product.category === selectedCategory;
    }

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalogo" className="pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Welcome & Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-neutral-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-mono uppercase font-bold tracking-wider">
            <Layers className="w-3.5 h-3.5 text-neutral-900" />
            <span>CATÁLOGO OFICIAL XIAOMI & REDMI // PERÚ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950">
            Audífonos Xiaomi & Redmi en Stock
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
            Modelos 100% auténticos listos para entrega inmediata en Chimbote y envíos nacionales por Olva Courier. Selecciona tu modelo y coordina tu pedido por WhatsApp.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por modelo o características..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
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
          <p className="text-neutral-500 text-sm">No encontramos audífonos con ese criterio de búsqueda.</p>
          <button
            onClick={() => {
              setSelectedCategory("todos");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs hover:bg-neutral-800"
          >
            Ver todos los audífonos
          </button>
        </div>
      )}
    </section>
  );
}
