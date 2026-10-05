"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import { AUDIO_TYPE_OPTIONS, parsePlaybackHours } from "@/lib/audio-filters";
import { getProductVideoInfo } from "@/lib/content-security";
import { colorImages, productGallery } from "@/lib/product-media";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ShareProductButton from "@/components/ShareProductButton";
import CompareProductButton from "@/components/CompareProductButton";
import { useComparison } from "@/context/ComparisonContext";
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
  Check,
  Heart,
  Play,
} from "lucide-react";

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
  const { addItem, setIsCartOpen, whatsappNumber, toggleFavorite, isFavorite, isCartOpen, isFavoritesOpen } = useCart();
  const { isOpen: isComparisonOpen, selectedProducts } = useComparison();
  const { products } = useProducts();

  // Obtener siempre la versión más actualizada en vivo desde useProducts()
  const product = React.useMemo(() => {
    return (
      products.find((p) => p.id === initialProduct.id) || initialProduct
    );
  }, [products, initialProduct]);

  const [quantity, setQuantity] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [colorRequired, setColorRequired] = useState(false);
  const colorSelector = React.useRef<HTMLDivElement>(null);
  const purchaseActions = React.useRef<HTMLDivElement>(null);
  const [purchaseActionsVisible, setPurchaseActionsVisible] = useState(false);
  const [galleryColorIndex, setGalleryColorIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const isFav = isFavorite(product.id);
  const isOutOfStock = (product.stockCount ?? 0) <= 0 || product.inStock === false;
  const purchaseQuantity = isOutOfStock ? 0 : Math.min(quantity, product.stockCount);
  const purchaseTotal = Math.round(product.price * purchaseQuantity * 100) / 100;
  const showMobilePurchase = !purchaseActionsVisible && !isCartOpen && !isFavoritesOpen && !(isComparisonOpen && selectedProducts.length === 2);

  React.useEffect(() => {
    const target = purchaseActions.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setPurchaseActionsVisible(entry.isIntersecting && entry.intersectionRatio > 0.15), { rootMargin: "0px 0px -80px 0px", threshold: [0, 0.15] });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

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
      const addRecordedSpec = (label: string, value: string) => {
        const existing = list.find((spec) => spec.label.toLowerCase() === label.toLowerCase());
        if (existing) existing.value = value;
        else list.push({ label, value });
      };
      const audioType = AUDIO_TYPE_OPTIONS.find((option) => option.value === product.specs.audioType);
      if (audioType) addRecordedSpec("Tipo de audífono", audioType.label);
      const playbackHours = parsePlaybackHours(product.specs.playbackHours);
      if (playbackHours !== undefined) {
        addRecordedSpec("Autonomía por carga", `${playbackHours} horas (sin estuche)`);
      }
      if (product.specs.ancEnabled === "yes" || product.specs.ancEnabled === "no") {
        addRecordedSpec("Cancelación activa (ANC)", product.specs.ancEnabled === "yes" ? "Con ANC" : "Sin ANC");
      }
      if (product.specs.battery && !list.some((s) => s.label.toLowerCase().includes("batería") || s.label.toLowerCase().includes("autonomía"))) {
        list.push({ label: "Autonomía", value: product.specs.battery });
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
      (selectedColorIndex !== null ? colors[selectedColorIndex] : undefined) ||
      colors[0] || {
        name: "Estándar",
        hex: "#18181b",
        image: product.images?.[0] || fallbackImg,
      }
    );
  }, [colors, selectedColorIndex, product.images, fallbackImg]);
  const videoInfo = React.useMemo(() => getProductVideoInfo(product.videoUrl), [product.videoUrl]);

  const galleryImages = React.useMemo(() => {
    return productGallery(product, galleryColorIndex, fallbackImg);
  }, [product, galleryColorIndex, fallbackImg]);

  const activeImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const handleSelectColor = (index: number) => {
    setSelectedColorIndex(index);
    setColorRequired(false);
    setGalleryColorIndex(index);
    setIsVideoActive(false);
    setSelectedImageIndex(0);
  };

  const handleNextImage = () => {
    setIsVideoActive(false);
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setIsVideoActive(false);
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const requireColorSelection = () => {
    if (colors.length && selectedColorIndex === null) {
      setColorRequired(true);
      colorSelector.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      colorSelector.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!requireColorSelection()) return;
    addItem(product, currentColor, purchaseQuantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!requireColorSelection()) return;
    addItem(product, currentColor, purchaseQuantity);
    setIsCartOpen(true);
  };

  const relatedProducts = products.filter((p) => p.id !== product.id);

  const colorLabel = colors.length && selectedColorIndex === null ? "Elige un color" : currentColor.name;
  const waMessage = `¡Hola PulsoTech! Deseo comprar el modelo *${product.name}* (Color: ${colors.length && selectedColorIndex === null ? "por elegir" : currentColor.name}, Precio: ${STORE_SETTINGS.currencySymbol}${product.price.toFixed(2)}). ¿Tienen stock disponible para entrega hoy?`;

  return (
    <div data-purchase-actions-visible={purchaseActionsVisible} className="store-product-page min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      <Navbar currentCategory={product.category} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full pb-10">
        {/* Breadcrumb Navigation (Más grande y legible) */}
        <nav className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-neutral-500 mb-6 sm:mb-8 font-medium overflow-hidden sm:overflow-x-auto whitespace-nowrap py-1.5">
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
          <span className="text-neutral-950 font-bold truncate min-w-0 max-w-xs sm:max-w-md sm:shrink-0">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] gap-6 lg:gap-x-12 lg:gap-y-6 items-start">
          {/* Gallery first on mobile; left column on desktop. */}
          <div className="store-product-gallery lg:col-span-7 lg:col-start-1 lg:row-start-1 space-y-4">
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
                      referrerPolicy="strict-origin-when-cross-origin"
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
                      src={getAssetUrl(activeImage)}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 max-w-full max-h-full"
                    />
                  ) : (
                    <Image
                      src={getAssetUrl(activeImage)}
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
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                  <Play className="w-3 h-3 fill-white" />
                  <span>Video Oficial</span>
                </div>
              ) : galleryImages.length > 1 ? (
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2.5 py-1 rounded-lg bg-neutral-900/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                  {selectedImageIndex + 1} / {galleryImages.length}
                </div>
              ) : null}
            </div>

            {/* Gallery Thumbnails (Photos & Video) */}
            {(galleryImages.length > 0 || !!videoInfo) && (
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
                    aria-label={`Ver foto ${idx + 1} de ${galleryColorIndex === null ? "producto" : currentColor.name}`}
                    aria-pressed={isSelected}
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
                          src={getAssetUrl(img)}
                          alt={`${product.name} foto ${idx + 1}`}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <Image
                          src={getAssetUrl(img)}
                          alt={`${product.name} foto ${idx + 1}`}
                          fill
                          className="object-contain p-1"
                        />
                      )}
                    </button>
                  );
                })}
                {!!product.images?.length && galleryColorIndex !== null && <button type="button" onClick={() => { setGalleryColorIndex(null); setSelectedImageIndex(0); setIsVideoActive(false); }} className="min-h-11 shrink-0 px-2 text-xs text-neutral-500 underline underline-offset-4 hover:text-black cursor-pointer">Ver todas</button>}
              </div>
            )}
          </div>

          {/* Right Column: Commercial Details & Purchase Actions */}
          <div className="store-product-information lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 space-y-5 sm:space-y-6">
            {/* Header: Brand & Title */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-500 tracking-wide uppercase">
                {product.brand}
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.subtitle && <p className="text-sm text-neutral-500 leading-relaxed">
                {product.subtitle}
              </p>}
            </div>

            {colors.length > 0 && (
              <div ref={colorSelector} className="store-product-colors space-y-2.5">
                <div className="text-sm text-neutral-700">
                  Color{selectedColorIndex !== null && <>: <span className="font-medium text-neutral-950">{currentColor.name}</span></>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {colors.map((color, index) => {
                    const isSelected = selectedColorIndex === index;
                    const preview = colorImages(color)[0];
                    return (
                      <button key={color.name + index} type="button" onClick={() => handleSelectColor(index)} aria-label={`Color ${color.name}`} aria-pressed={isSelected} title={color.name}
                        className={`relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl border bg-white p-1.5 transition-colors duration-150 cursor-pointer flex items-center justify-center ${isSelected ? "border-neutral-950 ring-1 ring-neutral-950" : "border-neutral-200 hover:border-neutral-500"}`}>
                        {preview ? <img src={getAssetUrl(preview)} alt="" className="w-full h-full object-contain" /> : <span aria-hidden="true" className="w-6 h-6 rounded-full border border-neutral-300" style={{ backgroundColor: color.hex }} />}
                      </button>
                    );
                  })}
                </div>
                {colorRequired && <p role="alert" className="text-xs font-medium text-red-700">Elige un color para añadir el producto a la bolsa.</p>}
              </div>
            )}

            <div className="store-product-price flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold tracking-tight text-neutral-950 tabular-nums">{STORE_SETTINGS.currencySymbol}{product.price.toFixed(2)}</span>
              {!!product.originalPrice && product.originalPrice > product.price && <span className="text-sm text-neutral-400 line-through tabular-nums">{STORE_SETTINGS.currencySymbol}{product.originalPrice.toFixed(2)}</span>}
            </div>

            {/* Quantity Selector, Cart Buttons & Favorites */}
            <div className="space-y-3 pt-1">
              {!isOutOfStock && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-xs font-semibold text-neutral-700">Cantidad:</span>
                  <div className="flex items-center border border-neutral-200 rounded-xl bg-white shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, purchaseQuantity - 1))}
                      disabled={purchaseQuantity <= 1}
                      aria-label="Reducir cantidad"
                      className="w-11 h-11 text-neutral-600 hover:text-black font-bold text-sm cursor-pointer disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-bold text-neutral-900 min-w-8 text-center">
                      {purchaseQuantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockCount, purchaseQuantity + 1))}
                      disabled={purchaseQuantity >= product.stockCount}
                      aria-label="Aumentar cantidad"
                      className="w-11 h-11 text-neutral-600 hover:text-black font-bold text-sm cursor-pointer disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  {purchaseQuantity > 1 && <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold text-neutral-950 tabular-nums">Total {STORE_SETTINGS.currencySymbol}{purchaseTotal.toFixed(2)}</span>}
                </div>
              )}

              {/* Action Buttons: Add to Cart + Buy Now + Favorite */}
              <div ref={purchaseActions} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 py-3.5 px-4 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                      <span>Producto Agotado Temporalmente</span>
                    </div>
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
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 py-3.5 px-4 rounded-xl border border-neutral-300 hover:border-black bg-white text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Añadir a la bolsa</span>
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
                      <span>Comprar ahora</span>
                    </button>
                  </>
                )}
              </div>

              {/* Primary WhatsApp Action */}
              <a
                href={`https://wa.me/${(whatsappNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                  isOutOfStock
                    ? `¡Hola PulsoTech! Veo que el producto ${product.name} (ID: #${product.id}) está agotado en la web. ¿Cuándo volverán a tener unidades disponibles?`
                    : waMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-11 inline-flex items-center gap-2 text-sm text-[#15803d] hover:text-[#166534] transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? "Consultar disponibilidad"
                    : "Consultar por WhatsApp"}
                </span>
              </a>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-neutral-600">
                <Link href="/garantia-y-entregas/" className="min-h-8 inline-flex items-center gap-1.5 hover:text-neutral-950"><ShieldCheck className="w-3.5 h-3.5" />Garantía</Link>
                <Link href="/garantia-y-entregas/" className="min-h-8 inline-flex items-center gap-1.5 hover:text-neutral-950"><Truck className="w-3.5 h-3.5" />Entregas</Link>
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-x-5 gap-y-2 border-t border-neutral-200 pt-2">
              <ShareProductButton key={product.id} product={product} compact />
              <CompareProductButton product={product} compact />
            </div>

            {/* Description & Features */}
            <div className="pt-4 border-t border-neutral-200 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-950 mb-2">Descripción</h2>
                <p className="text-xs text-neutral-600 leading-relaxed">{product.description}</p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-neutral-950 mb-2">Características</h2>
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
          {/* Technical Specification Grid */}
          {allSpecsList.length > 0 && (
            <div className="store-product-specs lg:col-span-7 lg:col-start-1 lg:row-start-2 pt-4 space-y-3">
              <h2 className="text-base font-semibold text-neutral-950">Especificaciones</h2>

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
                        <span className="text-[10px] leading-relaxed text-neutral-400 font-bold uppercase tracking-wider block break-words">
                          {spec.label}
                        </span>
                        <span className="text-xs leading-relaxed font-extrabold text-neutral-900 break-words block" title={spec.value}>
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

      {/* La barra comparte el color, la cantidad y el inventario de la ficha. */}
      {showMobilePurchase && <aside aria-label="Compra rápida del producto" className="store-motion store-mobile-purchase sm:hidden fixed bottom-0 left-0 right-0 z-40 min-h-[calc(72px+env(safe-area-inset-bottom))] bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] px-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p aria-live="polite" aria-atomic="true" className="text-xl font-extrabold text-neutral-950 tracking-tight leading-none tabular-nums"><span className="sr-only">Total: </span>{STORE_SETTINGS.currencySymbol}{purchaseTotal.toFixed(2)}</p>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full border border-neutral-300 inline-block shrink-0 mt-1.5"
              style={{ backgroundColor: selectedColorIndex === null && colors.length ? "transparent" : currentColor.hex }}
            />
            <span className="text-[11px] text-neutral-500 truncate mt-1.5">
              {isOutOfStock ? "Agotado" : `${colorLabel} · ${purchaseQuantity} ${purchaseQuantity === 1 ? "ud." : "uds."}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="min-h-12 min-w-12 flex items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Añadir a la bolsa"
            aria-label="Añadir a la bolsa"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="min-h-12 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? "Agotado" : "Comprar"}
          </button>
        </div>
      </aside>}

      <Footer />
    </div>
  );
}
