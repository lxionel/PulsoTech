"use client";

import React, { useState, useMemo } from "react";
import { PRODUCTS } from "@/data/products";
import ProductCard from "./ProductCard";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

export default function ProductCatalog() {
  const [selectedFilter, setSelectedFilter] = useState<"todos" | "anc" | "economicos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const filterOptions = [
    { id: "todos", label: "Todos los productos", count: PRODUCTS.length },
    {
      id: "anc",
      label: "Con Cancelación (ANC)",
      count: PRODUCTS.filter((p) => p.specs.anc !== "Sin cancelación").length,
    },
    {
      id: "economicos",
      label: "Gama de Entrada",
      count: PRODUCTS.filter((p) => p.price < 80).length,
    },
  ] as const;

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      let matchesFilter = true;
      if (selectedFilter === "anc") {
        matchesFilter = product.specs.anc !== "Sin cancelación";
      } else if (selectedFilter === "economicos") {
        matchesFilter = product.price < 80;
      }

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.tags.some((t) => t.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [selectedFilter, searchQuery]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [filteredProducts, sortBy]);

  return (
    <section id="catalogo" className="pt-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-neutral-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-wider">
            <span>Inicio</span>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Catálogo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950">
            Catálogo de Productos
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
            Modelos 100% auténticos listos para entrega inmediata el mismo día en Chimbote. Selecciona tu modelo y coordina tu pedido por WhatsApp o directamente en la web.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar modelo o especificación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: Category Filter Tabs & Sort Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-100">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-neutral-400 font-mono uppercase flex items-center gap-1 mr-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtro:
          </span>

          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedFilter === opt.id
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedFilter === opt.id
                    ? "bg-neutral-800 text-neutral-200"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs">
          <span className="text-neutral-500 font-mono">
            {sortedProducts.length} {sortedProducts.length === 1 ? "producto" : "productos"}
          </span>

          <div className="flex items-center gap-1.5 border border-neutral-200 rounded-full px-3 py-1.5 bg-white">
            <ArrowUpDown className="w-3 h-3 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc")}
              className="bg-transparent text-xs font-medium text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: Menor a mayor</option>
              <option value="price-desc">Precio: Mayor a menor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-neutral-200 bg-white p-8">
          <p className="text-neutral-600 font-semibold text-sm">No encontramos productos con ese filtro o búsqueda.</p>
          <p className="text-neutral-400 text-xs mt-1">Prueba seleccionando otra categoría o limpiando el texto.</p>
          <button
            onClick={() => {
              setSelectedFilter("todos");
              setSearchQuery("");
              setSortBy("featured");
            }}
            className="mt-4 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </section>
  );
}
