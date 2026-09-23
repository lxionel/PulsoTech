"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { PRODUCTS, STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import {
  Battery,
  ShieldCheck,
  Truck,
  MessageSquare,
  ShoppingBag,
  Volume2,
  Wifi,
  Zap,
  ChevronRight,
  ArrowLeft,
  ChevronLeft,
  Clock,
  Star,
  Check,
} from "lucide-react";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, setIsCartOpen, whatsappNumber } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.colors[0]?.image || "/placeholder-earbuds.svg"];

  const activeImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = () => {
    addItem(product, product.colors[0], quantity);
  };

  const handleBuyNow = () => {
    addItem(product, product.colors[0], quantity);
    setIsCartOpen(true);
  };

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id);

  const waMessage = `¡Hola PulsoTech! Deseo comprar el modelo *${product.name}* (Precio: ${STORE_SETTINGS.currencySymbol}${product.price.toFixed(2)}). ¿Tienen stock disponible para entrega hoy en Chimbote?`;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link href="/#catalogo" className="hover:text-blue-600 transition-colors">
            Audífonos Inalámbricos
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Full Product Grid (Despegatec & Miccell Inspired) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Stage Image Gallery + Lab Tech Specs Grid */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Stage Image Frame */}
            <div className="relative aspect-square w-full rounded-3xl bg-white border border-neutral-200/90 p-8 sm:p-14 flex items-center justify-center shadow-xs overflow-hidden group">
              <div className="relative w-full h-full">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Prev/Next arrows if multiple images */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Foto anterior"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200 flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Siguiente foto"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200 flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter pill */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-neutral-900/70 text-white text-[10px] font-semibold backdrop-blur-xs">
                  {selectedImageIndex + 1} / {galleryImages.length}
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3">
                {galleryImages.map((img, idx) => {
                  const isSelected = selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border p-2 bg-white transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-600/20 shadow-xs"
                          : "border-neutral-200 hover:border-neutral-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} foto ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Technical Specification Grid (Despegatec Blue Icon Style) */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Ficha Técnica de Rendimiento
                </h3>
                <span className="text-[11px] font-semibold text-neutral-400">
                  Especificaciones Oficiales
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* 1. Batería */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Battery className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                      Batería Total
                    </span>
                    <span className="text-xs font-extrabold text-neutral-900 truncate block">
                      {product.specs.battery} con estuche
                    </span>
                  </div>
                </div>

                {/* 2. Cancelación */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                      Cancelación
                    </span>
                    <span className="text-xs font-extrabold text-neutral-900 truncate block">
                      {product.specs.anc}
                    </span>
                  </div>
                </div>

                {/* 3. Driver */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                      Driver Acústico
                    </span>
                    <span className="text-xs font-extrabold text-neutral-900 truncate block">
                      {product.specs.driver}
                    </span>
                  </div>
                </div>

                {/* 4. Conectividad */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                      Conectividad
                    </span>
                    <span className="text-xs font-extrabold text-neutral-900 truncate block">
                      {product.specs.connectivity}
                    </span>
                  </div>
                </div>

                {/* 5. Protección */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                      Protección
                    </span>
                    <span className="text-xs font-extrabold text-neutral-900 truncate block">
                      Resistencia IP
                    </span>
                  </div>
                </div>

                {/* 6. Latencia */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                      Latencia
                    </span>
                    <span className="text-xs font-extrabold text-neutral-900 truncate block">
                      {product.specs.latency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Commercial Details & Purchase Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header: Brand & Title */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 tracking-wider uppercase">
                  {product.brand}
                </span>

                {/* Etiqueta Chimbote: Fondo negro y letras blancas */}
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-neutral-950 text-white tracking-wide">
                  Chimbote
                </span>

                {product.isNew && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600 text-white tracking-wide uppercase">
                    Nuevo Modelo
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-neutral-900">5.0</span>
                <span className="text-neutral-400">·</span>
                <span>Producto 100% Original en Caja Sellada</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.subtitle}
              </p>
            </div>

            {/* Price Box (Retail Style) */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-4">
              <div>
                <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider block">
                  Precio de Venta Directo
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
                    {STORE_SETTINGS.currencySymbol}
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">PEN</span>
                </div>
              </div>

              {/* Delivery Local Notice Box (Despegatec Inspired) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Entrega hoy en Chimbote — Pago contra entrega</span>
                </div>
                <p className="text-[11px] text-emerald-800 pl-6 leading-relaxed">
                  Te lo llevamos a tu domicilio o punto de encuentro. Pagas cómodamente con Efectivo, Yape o Plin al recibir y comprobar tu producto.
                </p>
              </div>

              {/* Official Warranty Notice Box */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-950 font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Garantía de funcionamiento PulsoTech · Caja sellada de fábrica</span>
              </div>
            </div>

            {/* Quantity Selector & Cart Buttons */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-700">Cantidad:</span>
                <div className="flex items-center border border-neutral-200 rounded-xl bg-white shadow-2xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-neutral-600 hover:text-black font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-neutral-900 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-2 text-neutral-600 hover:text-black font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart + Buy Now */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-4 rounded-xl border border-neutral-300 hover:border-black bg-white text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir al Carrito</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm cursor-pointer"
                >
                  <span>Comprar Ahora</span>
                </button>
              </div>

              {/* Primary WhatsApp Action (Despegatec Style) */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white text-white" />
                <span>Contactar con un asesor por WhatsApp</span>
              </a>
            </div>

            {/* Description & Features */}
            <div className="pt-4 border-t border-neutral-200 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-950 mb-2">Descripción del Producto</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{product.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-950 mb-2">Características Principales</h3>
                <ul className="space-y-2 text-xs text-neutral-600">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight">
                  Otros modelos disponibles
                </h2>
                <p className="text-xs text-neutral-500">
                  Compara y encuentra los audífonos ideales para ti en Chimbote.
                </p>
              </div>
              <Link
                href="/#catalogo"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Ver todo el catálogo</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
