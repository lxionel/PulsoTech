"use client";

import React, { useState, useMemo } from "react";
import { useProducts } from "@/context/ProductsContext";
import ProductCard from "./ProductCard";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Filter,
  Check,
  Tag,
} from "lucide-react";

export default function ProductCatalog() {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedBrand, setSelectedBrand] = useState<string>("todas");
  const [priceRange, setPriceRange] = useState<"all" | "under50" | "50to100" | "over100" | "custom">("all");
  const [maxPrice, setMaxPrice] = useState<number>(180);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter products logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== "todos" && selectedCategory !== "audifonos") {
        if (product.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Brand filter
      if (selectedBrand !== "todas") {
        const prodName = product.name.toLowerCase();
        const prodBrand = (product.brand || "").toLowerCase();
        const queryBrand = selectedBrand.toLowerCase();
        if (!prodBrand.includes(queryBrand) && !prodName.includes(queryBrand)) {
          return false;
        }
      }

      // Price filter
      if (priceRange === "under50" && product.price > 50) return false;
      if (priceRange === "50to100" && (product.price < 50 || product.price > 100)) return false;
      if (priceRange === "over100" && product.price <= 100) return false;
      if (priceRange === "custom" && product.price > maxPrice) return false;

      // Stock and New
      if (onlyInStock && !product.inStock) return false;
      if (onlyNew && !product.isNew) return false;

      // Search query
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesQuery =
          product.name.toLowerCase().includes(query) ||
          product.subtitle.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [
    selectedCategory,
    selectedBrand,
    priceRange,
    maxPrice,
    onlyInStock,
    onlyNew,
    searchQuery,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [filteredProducts, sortBy]);

  const hasActiveFilters =
    selectedCategory !== "todos" ||
    selectedBrand !== "todas" ||
    priceRange !== "all" ||
    onlyInStock ||
    onlyNew ||
    searchQuery !== "";

  const clearAllFilters = () => {
    setSelectedCategory("todos");
    setSelectedBrand("todas");
    setPriceRange("all");
    setMaxPrice(180);
    setOnlyInStock(false);
    setOnlyNew(false);
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <section id="catalogo" className="pt-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Catalog Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-neutral-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span>Inicio</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-bold">Catálogo de Productos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950">
            Catálogo Disponible
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
            Modelos originales en caja sellada con entrega el mismo día y pago contra entrega.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar modelo o función..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column E-Commerce Layout: Vertical Filters (Left) + Grid (Right) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="w-full lg:hidden flex items-center justify-between pb-3">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros y Precios</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
          </button>

          <span className="text-xs text-neutral-500 font-semibold">
            {sortedProducts.length} productos
          </span>
        </div>

        {/* Left Column: Vertical Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 lg:w-72 shrink-0 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-6 sticky top-24">
          {/* Header of filters sidebar */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-950" />
              <h3 className="font-extrabold text-sm text-neutral-950 uppercase tracking-wider">
                Filtros
              </h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-bold text-neutral-500 hover:text-black underline cursor-pointer"
              >
                Limpiar todo
              </button>
            )}
          </div>

          {/* 1. Price Range Filters (Aproximado de Precios) */}
          <div className="space-y-3 pb-5 border-b border-neutral-100">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
              Rango de Precio
            </h4>

            {/* Quick Price Ranges */}
            <div className="space-y-1.5">
              {[
                { id: "all", label: "Todos los precios" },
                { id: "under50", label: "Hasta S/ 50" },
                { id: "50to100", label: "S/ 50 a S/ 100" },
                { id: "over100", label: "Más de S/ 100" },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setPriceRange(range.id as typeof priceRange)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    priceRange === range.id
                      ? "bg-neutral-950 text-white font-bold"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                  }`}
                >
                  <span>{range.label}</span>
                  {priceRange === range.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {/* Interactive Slider for Max Price */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Aproximado máx:</span>
                <span className="font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md">
                  S/ {maxPrice}.00
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={180}
                step={5}
                value={maxPrice}
                onChange={(e) => {
                  setPriceRange("custom");
                  setMaxPrice(Number(e.target.value));
                }}
                className="w-full accent-neutral-950 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                <span>S/ 40</span>
                <span>S/ 180</span>
              </div>
            </div>
          </div>

          {/* 2. Brand Filter */}
          <div className="space-y-2.5 pb-5 border-b border-neutral-100">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
              Marca
            </h4>
            <div className="space-y-1.5">
              {[
                { id: "todas", label: "Todas las marcas" },
                { id: "xiaomi", label: "Xiaomi" },
                { id: "redmi", label: "Redmi" },
              ].map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    selectedBrand === brand.id
                      ? "bg-neutral-950 text-white font-bold"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                  }`}
                >
                  <span>{brand.label}</span>
                  {selectedBrand === brand.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Category Filter */}
          <div className="space-y-2.5 pb-5 border-b border-neutral-100">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
              Categoría
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory("todos")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  selectedCategory === "todos"
                    ? "bg-neutral-950 text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                <span>Todos los productos</span>
                <span className="text-[10px] font-bold opacity-75">3</span>
              </button>

              <button
                onClick={() => setSelectedCategory("audifonos")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  selectedCategory === "audifonos"
                    ? "bg-neutral-950 text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                <span>Audífonos TWS</span>
                <span className="text-[10px] font-bold opacity-75">3</span>
              </button>

              <div className="px-3 py-2 text-xs font-medium text-neutral-400 flex items-center justify-between opacity-60">
                <span>Smartwatches</span>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-neutral-100 px-1.5 py-0.5 rounded">
                  Pronto
                </span>
              </div>
            </div>
          </div>

          {/* 4. Availability Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
              Estado
            </h4>
            <label className="flex items-center gap-2.5 text-xs font-medium text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-neutral-950"
              />
              <span>Solo en stock inmediato</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs font-medium text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={(e) => setOnlyNew(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-neutral-950"
              />
              <span>Nuevos lanzamientos</span>
            </label>
          </div>
        </aside>

        {/* Right Column: Main Products Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Top Sort and Active Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-extrabold text-neutral-900">
                {sortedProducts.length}{" "}
                {sortedProducts.length === 1 ? "producto" : "productos"}
              </span>

              {hasActiveFilters && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-neutral-400">· Filtros:</span>
                  {selectedBrand !== "todas" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-bold">
                      {selectedBrand}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedBrand("todas")}
                      />
                    </span>
                  )}
                  {priceRange !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-bold">
                      {priceRange === "under50" && "Hasta S/ 50"}
                      {priceRange === "50to100" && "S/ 50 - S/ 100"}
                      {priceRange === "over100" && "Más de S/ 100"}
                      {priceRange === "custom" && `Hasta S/ ${maxPrice}`}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setPriceRange("all")}
                      />
                    </span>
                  )}
                  {onlyNew && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-bold">
                      Nuevos
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setOnlyNew(false)}
                      />
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Ordenar:</span>
              <div className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-1.5 bg-neutral-50">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "featured" | "price-asc" | "price-desc"
                    )
                  }
                  className="bg-transparent text-xs font-bold text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Precio: Menor a mayor</option>
                  <option value="price-desc">Precio: Mayor a menor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-dashed border-neutral-200 bg-white p-8">
              <p className="text-neutral-800 font-black text-base">
                No encontramos productos con esos filtros.
              </p>
              <p className="text-neutral-500 text-xs mt-1">
                Prueba ajustando el rango de precio o seleccionando todas las marcas.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
              >
                Ver todos los productos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-950" />
                  <h3 className="font-extrabold text-sm text-neutral-950 uppercase tracking-wider">
                    Filtros y Precios
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Filter Mobile */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
                  Rango de Precio
                </h4>
                <div className="space-y-1.5">
                  {[
                    { id: "all", label: "Todos los precios" },
                    { id: "under50", label: "Hasta S/ 50" },
                    { id: "50to100", label: "S/ 50 a S/ 100" },
                    { id: "over100", label: "Más de S/ 100" },
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setPriceRange(range.id as typeof priceRange)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        priceRange === range.id
                          ? "bg-neutral-950 text-white font-bold"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <span>{range.label}</span>
                      {priceRange === range.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Aproximado:</span>
                    <span className="font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md">
                      Hasta S/ {maxPrice}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={180}
                    step={5}
                    value={maxPrice}
                    onChange={(e) => {
                      setPriceRange("custom");
                      setMaxPrice(Number(e.target.value));
                    }}
                    className="w-full accent-neutral-950 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Brand Filter Mobile */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
                  Marca
                </h4>
                <div className="space-y-1">
                  {[
                    { id: "todas", label: "Todas las marcas" },
                    { id: "xiaomi", label: "Xiaomi" },
                    { id: "redmi", label: "Redmi" },
                  ].map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        selectedBrand === brand.id
                          ? "bg-neutral-950 text-white font-bold"
                          : "text-neutral-700"
                      }`}
                    >
                      <span>{brand.label}</span>
                      {selectedBrand === brand.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-neutral-950 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Ver resultados ({sortedProducts.length})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
