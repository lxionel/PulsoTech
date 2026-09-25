"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  Heart,
  Play,
} from "lucide-react";

function getEmbedVideoInfo(url?: string): { isYouTube: boolean; embedUrl: string } | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      isYouTube: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }
  return {
    isYouTube: false,
    embedUrl: trimmed,
  };
}

function getSpecIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("batería") || l.includes("autonomía") || l.includes("estuche")) return Battery;
  if (l.includes("bluetooth") || l.includes("conectividad") || l.includes("inalámbrico") || l.includes("conexión")) return Wifi;
  if (l.includes("anc") || l.includes("cancelación") || l.includes("ruido") || l.includes("micrófono") || l.includes("sonido") || l.includes("audio")) return Volume2;
  if (l.includes("driver") || l.includes("diafragma") || l.includes("potencia") || l.includes("carga") || l.includes("watts")) return Zap;
  if (l.includes("resistencia") || l.includes("agua") || l.includes("polvo") || l.includes("ip") || l.includes("protección") || l.includes("garantía")) return ShieldCheck;
  if (l.includes("tiempo") || l.includes("latencia") || l.includes("duración") || l.includes("hora")) return Clock;
  return ShieldCheck;
}

export default function ProductDetailClient({ product: initialProduct }: { product: Product }) {
  const { addItem, setIsCartOpen, whatsappNumber, toggleFavorite, isFavorite } = useCart();
  const { products } = useProducts();

  // Obtener siempre la versión más actualizada en vivo desde useProducts()
  const product = React.useMemo(() => {
    return (
      products.find(
        (p) =>
          p.id === initialProduct.id ||
          p.slug.toLowerCase() === initialProduct.slug.toLowerCase() ||
          p.name.toLowerCase() === initialProduct.name.toLowerCase()
      ) || initialProduct
    );
  }, [products, initialProduct]);

  const [quantity, setQuantity] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const isFav = isFavorite(product.id);

  // Consolidar especificaciones técnicas oficiales (customSpecs + specs estándar)
  const allSpecsList = React.useMemo(() => {
    const list: { label: string; value: string }[] = [];

    // 1. Agregar customSpecs si existen
    if (product.customSpecs && Array.isArray(product.customSpecs)) {
      product.customSpecs.forEach((s) => {
        if (s.label?.trim() && s.value?.trim()) {
          list.push({ label: s.label.trim(), value: s.value.trim() });
        }
      });
    }

    // 2. Si faltan campos de specs estándar, agregarlos:
    if (product.specs) {
      if (product.specs.battery && !list.some((s) => s.label.toLowerCase().includes("batería") || s.label.toLowerCase().includes("autonomía"))) {
        list.push({ label: "Batería Total", value: `${product.specs.battery} con estuche` });
      }
      if (product.specs.anc && !list.some((s) => s.label.toLowerCase().includes("cancelación") || s.label.toLowerCase().includes("anc"))) {
        list.push({ label: "Cancelación de Ruido", value: product.specs.anc });
      }
      if (product.specs.driver && !list.some((s) => s.label.toLowerCase().includes("driver") || s.label.toLowerCase().includes("diafragma"))) {
        list.push({ label: "Driver Acústico", value: product.specs.driver });
      }
      if (product.specs.connectivity && !list.some((s) => s.label.toLowerCase().includes("conectividad") || s.label.toLowerCase().includes("bluetooth"))) {
        list.push({ label: "Conectividad", value: product.specs.connectivity });
      }
      if (product.specs.latency && !list.some((s) => s.label.toLowerCase().includes("latencia"))) {
        list.push({ label: "Latencia", value: product.specs.latency });
      }
      if (product.specs.weight && !list.some((s) => s.label.toLowerCase().includes("peso"))) {
        list.push({ label: "Peso", value: product.specs.weight });
      }
    }

    return list;
  }, [product]);

  const colors = React.useMemo(() => product.colors || [], [product.colors]);
  const fallbackImg = getAssetUrl("/placeholder-earbuds.svg");
  const currentColor = React.useMemo(() => {
    return (
      colors[selectedColorIndex] ||
      colors[0] || {
        name: "Estándar",
        hex: "#18181b",
        image: product.images?.[0] || fallbackImg,
      }
    );
  }, [colors, selectedColorIndex, product.images, fallbackImg]);
  const videoInfo = React.useMemo(() => getEmbedVideoInfo(product.videoUrl), [product.videoUrl]);

  const galleryImages = React.useMemo(() => {
    const list: string[] = [];
    if (currentColor?.image) list.push(currentColor.image);
    (product.images || []).forEach((img) => {
      if (img && !list.includes(img)) list.push(img);
    });
    colors.forEach((c) => {
      if (c.image && !list.includes(c.image)) list.push(c.image);
    });
    return list.length > 0 ? list : [fallbackImg];
  }, [product, currentColor, colors, fallbackImg]);

  const activeImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const handleSelectColor = (index: number) => {
    setSelectedColorIndex(index);
    setIsVideoActive(false);
    const chosenColor = colors[index];
    if (chosenColor?.image) {
      const idx = galleryImages.indexOf(chosenColor.image);
      if (idx !== -1) {
        setSelectedImageIndex(idx);
      } else {
        setSelectedImageIndex(0);
      }
    }
  };

  const handleNextImage = () => {
    setIsVideoActive(false);
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setIsVideoActive(false);
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = () => {
    addItem(product, currentColor, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, currentColor, quantity);
    setIsCartOpen(true);
  };

  const relatedProducts = products.filter((p) => p.id !== product.id);

  const waMessage = `¡Hola PulsoTech! Deseo comprar el modelo *${product.name}* (Color: ${currentColor?.name || "Estándar"}, Precio: ${STORE_SETTINGS.currencySymbol}${product.price.toFixed(2)}). ¿Tienen stock disponible para entrega hoy?`;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full pb-24 sm:pb-10">
        {/* Breadcrumb Navigation (Más grande y legible) */}
        <nav className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-neutral-500 mb-6 sm:mb-8 font-medium overflow-x-auto whitespace-nowrap py-1.5">
          <Link
            href="/"
            className="hover:text-neutral-950 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
            <span>Inicio</span>
          </Link>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 shrink-0" />
          <Link
            href="/#catalogo"
            className="hover:text-neutral-950 transition-colors shrink-0"
          >
            Catálogo
          </Link>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 shrink-0" />
          <span className="text-neutral-950 font-bold truncate max-w-xs sm:max-w-md shrink-0">
            {product.name}
          </span>
        </nav>

        {/* Full Product Grid (Despegatec & Miccell Inspired) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Stage Image Gallery + Lab Tech Specs Grid */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Stage Frame (Image or Video) */}
            <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/90 p-3 sm:p-6 flex items-center justify-center shadow-xs overflow-hidden group">
              {isVideoActive && videoInfo ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl sm:rounded-2xl overflow-hidden">
                  {videoInfo.isYouTube ? (
                    <iframe
                      src={videoInfo.embedUrl}
                      title={`Video oficial ${product.name}`}
                      className="w-full h-full border-0 aspect-square"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoInfo.embedUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {activeImage?.startsWith("data:") ||
                  activeImage?.startsWith("blob:") ||
                  activeImage?.startsWith("http") ? (
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 max-w-full max-h-full"
                    />
                  ) : (
                    <Image
                      src={activeImage}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 750px"
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                  )}
                </div>
              )}

              {/* Prev/Next arrows if multiple images and not in video mode */}
              {!isVideoActive && galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Foto anterior"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200 flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Siguiente foto"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200 flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter or Video indicator */}
              {isVideoActive ? (
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                  <Play className="w-3 h-3 fill-white" />
                  <span>Video Oficial</span>
                </div>
              ) : galleryImages.length > 1 ? (
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2.5 py-1 rounded-full bg-neutral-900/70 text-white text-[10px] font-semibold backdrop-blur-xs">
                  {selectedImageIndex + 1} / {galleryImages.length}
                </div>
              ) : null}
            </div>

            {/* Gallery Thumbnails (Photos & Video) */}
            {(galleryImages.length > 1 || !!videoInfo) && (
              <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1">
              {videoInfo && (
                <button
                  type="button"
                  onClick={() => setIsVideoActive(true)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border p-1.5 sm:p-2 bg-neutral-950 text-white transition-all cursor-pointer shrink-0 flex flex-col items-center justify-center gap-1 ${
                    isVideoActive
                      ? "border-red-600 ring-2 ring-red-600/30 shadow-xs"
                      : "border-neutral-700 opacity-80 hover:opacity-100"
                  }`}
                  title="Reproducir Video Oficial"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                    <Play className="w-3 h-3 fill-white ml-0.5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Video</span>
                </button>
              )}

              {galleryImages.map((img, idx) => {
                const isSelected = !isVideoActive && selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsVideoActive(false);
                      setSelectedImageIndex(idx);
                    }}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border p-1.5 sm:p-2 bg-white transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? "border-neutral-900 ring-2 ring-neutral-900/20 shadow-xs"
                        : "border-neutral-200 hover:border-neutral-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                      {img?.startsWith("data:") ||
                      img?.startsWith("blob:") ||
                      img?.startsWith("http") ? (
                        <img
                          src={img}
                          alt={`${product.name} foto ${idx + 1}`}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <Image
                          src={img}
                          alt={`${product.name} foto ${idx + 1}`}
                          fill
                          className="object-contain p-1"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Technical Specification Grid */}
            {allSpecsList.length > 0 && (
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
                  {allSpecsList.map((spec, sIdx) => {
                    const IconComponent = getSpecIcon(spec.label);
                    return (
                      <div
                        key={spec.label + sIdx}
                        className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3 transition-colors hover:border-neutral-300"
                      >
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <IconComponent className="w-5 h-5 text-neutral-100" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                            {spec.label}
                          </span>
                          <span className="text-xs font-extrabold text-neutral-900 truncate block" title={spec.value}>
                            {spec.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Commercial Details & Purchase Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header: Brand & Title */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 tracking-wider uppercase">
                  {product.brand}
                </span>

                {/* Etiqueta Stock: Fondo negro y letras blancas */}
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-neutral-950 text-white tracking-wide">
                  En Stock
                </span>
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

              {/* Trust & Guarantee Indicators */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-800 font-medium">
                  <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span className="truncate">Garantía PulsoTech</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-800 font-medium">
                  <Truck className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span className="truncate">Envío & Entrega Segura</span>
                </div>
              </div>
            </div>

            {/* Selector de Colores Disponibles */}
            {colors.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500 font-medium">Color:</span>
                  <span className="font-extrabold text-neutral-950">{currentColor?.name}</span>
                </div>
                <div className="flex items-center gap-2.5 pt-1">
                  {colors.map((c, idx) => {
                    const isSelected = selectedColorIndex === idx;
                    return (
                      <button
                        key={c.name + idx}
                        type="button"
                        onClick={() => handleSelectColor(idx)}
                        aria-label={`Color ${c.name}`}
                        title={c.name}
                        className={`relative rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "w-8 h-8 ring-2 ring-offset-2 ring-neutral-900 shadow-sm"
                            : "w-7 h-7 hover:scale-105 opacity-75 hover:opacity-100"
                        }`}
                      >
                        <span
                          className={`w-full h-full rounded-full border border-neutral-300 block ${
                            c.hex?.toLowerCase() === "#ffffff" ? "bg-white" : ""
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector, Cart Buttons & Favorites */}
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

              {/* Action Buttons: Add to Cart + Buy Now + Favorite */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-4 rounded-xl border border-neutral-300 hover:border-black bg-white text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Añadir al Carrito</span>
                  </button>

                  <button
                    onClick={() => toggleFavorite(product.id)}
                    aria-label="Guardar en favoritos"
                    className={`p-3.5 rounded-xl border transition-all active:scale-90 cursor-pointer shrink-0 ${
                      isFav
                        ? "border-red-200 bg-red-50 text-red-500 shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-400 hover:text-red-500 hover:border-neutral-300"
                    }`}
                    title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                  >
                    <Heart className={`w-5 h-5 ${isFav ? "fill-red-500" : ""}`} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm cursor-pointer"
                >
                  <span>Comprar Ahora</span>
                </button>
              </div>

              {/* Primary WhatsApp Action */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 sm:py-4 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
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
                      <div className="w-4 h-4 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0 mt-0.5">
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
                  Compara y encuentra los audífonos ideales para ti.
                </p>
              </div>
              <Link
                href="/#catalogo"
                className="text-xs font-bold text-neutral-900 hover:text-neutral-700 flex items-center gap-1"
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

      {/* Barra Flotante Inferior para Móviles (sm:hidden): Comprar y Añadir al Carrito siempre a mano */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 p-3 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block shrink-0"
              style={{ backgroundColor: currentColor?.hex || "#18181b" }}
            />
            <span className="text-[11px] font-bold text-neutral-500 truncate max-w-[120px]">
              {currentColor?.name || "Original"}
            </span>
          </div>
          <div className="text-lg font-black text-neutral-950 font-mono tracking-tight leading-none mt-0.5">
            {STORE_SETTINGS.currencySymbol}{product.price.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className="p-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 font-bold hover:bg-neutral-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Añadir a la bolsa"
            aria-label="Añadir a la bolsa"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-900" />
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-xs tracking-wider uppercase active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            Comprar Ahora
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
