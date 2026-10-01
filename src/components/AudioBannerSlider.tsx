"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Volume2, Plus, X, ShieldCheck } from "lucide-react";
import { getAssetUrl } from "@/utils/paths";

interface Hotspot {
  id: string;
  brand: string;
  name: string;
  spec: string;
  highlight: string;
  x: number; // Porcentaje desde la izquierda
  y: number; // Porcentaje desde arriba
  align?: "left" | "right" | "center";
}

interface SlideData {
  id: number;
  image: string;
  alt: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  hotspots: Hotspot[];
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: "/images/banners/hero-audio-slider-1.png",
    alt: "Colección Completa de Audífonos y Sonido PulsoTech",
    badge: "STOCK DISPONIBLE · AUDÍFONOS",
    title: "Sonido puro. Cancelación extrema.",
    subtitle: "Modelos Over-Ear y True Wireless sellados de fábrica con garantía total y entrega hoy.",
    ctaText: "VER AUDÍFONOS",
    ctaHref: "#catalogo",
    hotspots: [
      {
        id: "sony-xm4",
        brand: "Sony",
        name: "WH-1000XM4",
        spec: "ANC líder en la industria · Audio Hi-Res LDAC",
        highlight: "Hasta 30h de batería",
        x: 53,
        y: 33,
        align: "center",
      },
      {
        id: "airpods-pro-2",
        brand: "Apple",
        name: "AirPods Pro (2ª Gen)",
        spec: "Audio Espacial Dinámico · Chip H2",
        highlight: "Cancelación Activa 2x",
        x: 43,
        y: 68,
        align: "center",
      },
      {
        id: "beats-buds",
        brand: "Beats",
        name: "Studio Buds",
        spec: "Graves potentes y acústica personalizada",
        highlight: "Resistencia IPX4",
        x: 63,
        y: 66,
        align: "center",
      },
      {
        id: "bose-qc45",
        brand: "Bose",
        name: "QuietComfort 45",
        spec: "Comodidad legendaria y modo Consciente",
        highlight: "24h de reproducción",
        x: 79,
        y: 52,
        align: "left",
      },
    ],
  },
  {
    id: 2,
    image: "/images/banners/hero-audio-slider-2.png",
    alt: "Audífonos Bose Over-Ear Diadema Premium",
    badge: "CANCELACIÓN ACTIVA ANC",
    title: "Aísla el mundo. Siente cada nota.",
    subtitle: "Acústica envolvente de alta fidelidad, almohadillas ergonómicas y graves profundos.",
    ctaText: "VER MODELOS DE DIADEMA",
    ctaHref: "#catalogo",
    hotspots: [
      {
        id: "bose-qc-ultra",
        brand: "Bose",
        name: "QuietComfort Ultra",
        spec: "Audio Inmersivo Espacial · ANC Personalizado",
        highlight: "Materiales de grado aeroespacial",
        x: 67,
        y: 48,
        align: "center",
      },
    ],
  },
];

export default function AudioBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveHotspotId(null);
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveHotspotId(null);
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play cada 6s cuando no hay hover ni hotspot abierto
  useEffect(() => {
    if (isHovered || activeHotspotId) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, activeHotspotId, nextSlide]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "Escape") {
        setActiveHotspotId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Handlers para móviles
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentData = SLIDES[currentSlide];

  return (
    <div
      className="relative w-full h-full min-h-[340px] overflow-hidden bg-neutral-950 select-none flex items-center group/slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveHotspotId(null);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides panorámicos con fundido cruzado suave */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <div className="w-full h-full relative">
                <Image
                  src={getAssetUrl(slide.image)}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  quality={100}
                  className="object-cover object-center select-none"
                />

                {/* Gradiente oscuro elegante a la izquierda para garantizar legibilidad del texto */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-neutral-950/95 via-neutral-950/65 to-neutral-950/20 sm:bg-gradient-to-r sm:from-neutral-950 sm:via-neutral-950/80 sm:to-transparent sm:w-[500px] lg:w-[540px]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido Comercial Dinámico a la izquierda */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 w-full pt-16 sm:pt-20 pb-6 sm:pb-8 pointer-events-none">
        <div className="max-w-[340px] sm:max-w-[440px] space-y-3 sm:space-y-4 pointer-events-auto">
          {/* Badge de categoría */}
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-950/90 text-white shadow-xs border border-white/15 backdrop-blur-md">
            <Volume2 className="w-3 h-3 text-neutral-300" />
            <span>{currentData.badge}</span>
          </div>

          {/* Título comercial */}
          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.12] text-white">
            {currentData.title}
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="text-xs sm:text-sm lg:text-[15px] leading-relaxed font-normal max-w-sm sm:max-w-md text-neutral-200 sm:text-neutral-300">
            {currentData.subtitle}
          </p>

          {/* Botón de acción comercial con brillo interactivo */}
          <div className="pt-1.5 sm:pt-2 flex items-center gap-3">
            <Link
              href={currentData.ctaHref}
              className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-xl hover:shadow-green-950/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
              <span>{currentData.ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Micro badge de garantía */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-neutral-300 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
              <span>Garantía Oficial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Puntos Interactivos (Hotspots) sobre los audífonos */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {currentData.hotspots.map((spot) => {
          const isSelected = activeHotspotId === spot.id;

          // Alineación de la tarjeta popover según posición horizontal
          let popoverAlignClass = "-translate-x-1/2 left-1/2";
          if (spot.align === "left") {
            popoverAlignClass = "right-0 sm:right-auto sm:left-0";
          } else if (spot.align === "right") {
            popoverAlignClass = "left-0 sm:left-auto sm:right-0";
          }

          return (
            <div
              key={spot.id}
              className="absolute pointer-events-auto"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              onMouseEnter={() => setActiveHotspotId(spot.id)}
              onMouseLeave={() => setActiveHotspotId(null)}
            >
              {/* Botón pin pulsante */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspotId(isSelected ? null : spot.id);
                }}
                aria-label={`Ver detalles de ${spot.brand} ${spot.name}`}
                className={`group relative -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                  isSelected
                    ? "bg-white text-neutral-950 scale-110 ring-4 ring-white/30"
                    : "bg-neutral-950/70 hover:bg-white text-white hover:text-neutral-950 border border-white/60 hover:scale-110 backdrop-blur-md"
                }`}
              >
                {/* Anillo de pulso sutil cuando no está seleccionado */}
                {!isSelected && (
                  <span className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-60 pointer-events-none" />
                )}

                {/* Ícono dinámico: rotación suave de + a x al abrir */}
                <Plus
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
                    isSelected ? "rotate-45" : "group-hover:rotate-90"
                  }`}
                />
              </button>

              {/* Tarjeta flotante interactiva (Popover Card) */}
              {isSelected && (
                <div
                  className={`absolute ${
                    spot.y > 55 ? "bottom-full mb-2.5" : "top-full mt-2.5"
                  } z-30 ${popoverAlignClass} w-56 sm:w-64 bg-neutral-950/90 backdrop-blur-xl border border-white/20 p-3 sm:p-3.5 rounded-2xl shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200 pointer-events-auto`}
                >
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">
                      {spot.brand}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspotId(null);
                      }}
                      className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
                      aria-label="Cerrar detalles"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight mb-1">
                    {spot.name}
                  </h3>

                  <p className="text-[11px] text-neutral-300 leading-snug mb-2 font-normal">
                    {spot.spec}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-semibold text-neutral-400 border-t border-white/10">
                    <span className="text-neutral-300 font-mono">{spot.highlight}</span>
                    <Link
                      href="#catalogo"
                      className="text-white hover:text-neutral-200 font-bold inline-flex items-center gap-1 transition-colors hover:underline"
                    >
                      <span>Ver más</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flecha Anterior Interactiva */}
      <button
        onClick={prevSlide}
        type="button"
        aria-label="Foto anterior"
        className="group/btn absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 hover:border-white/50 text-white flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover/btn:-translate-x-0.5" />
      </button>

      {/* Flecha Siguiente Interactiva */}
      <button
        onClick={nextSlide}
        type="button"
        aria-label="Foto siguiente"
        className="group/btn absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 hover:border-white/50 text-white flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
      </button>

      {/* Indicadores inferiores interactivos */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-30 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/50 hover:bg-black/70 px-3.5 py-1.5 rounded-full border border-white/15 transition-colors shadow-md">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => {
                setActiveHotspotId(null);
                setCurrentSlide(idx);
              }}
              type="button"
              aria-label={`Ver foto ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  : "w-2.5 bg-white/40 hover:w-4 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
