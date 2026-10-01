"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Volume2, ShieldCheck, Zap, Watch } from "lucide-react";
import { getAssetUrl } from "@/utils/paths";

interface SlideData {
  id: number;
  image: string;
  alt: string;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: "/images/banners/hero-audio-slider-2.png",
    alt: "Audífonos Bose Over-Ear Diadema Premium",
    badge: "CANCELACIÓN ACTIVA ANC",
    badgeIcon: <Volume2 className="w-3.5 h-3.5" />,
    title: "Aísla el mundo. Siente cada nota.",
    subtitle: "Acústica envolvente de alta fidelidad, almohadillas ergonómicas y graves profundos.",
    ctaText: "VER MODELOS DE DIADEMA",
    ctaHref: "#catalogo",
  },
  {
    id: 2,
    image: "/images/banners/hero-audio-slider-1.png",
    alt: "Colección Completa de Audífonos y Sonido PulsoTech",
    badge: "AUDIO DE ALTA FIDELIDAD",
    badgeIcon: <Zap className="w-3.5 h-3.5" />,
    title: "Sonido puro. Cancelación extrema.",
    subtitle: "Modelos Over-Ear y True Wireless sellados de fábrica con garantía oficial y entrega hoy.",
    ctaText: "VER TODOS LOS AUDÍFONOS",
    ctaHref: "#catalogo",
  },
  {
    id: 3,
    image: "/images/banners/hero-tech-2.jpg",
    alt: "Accesorios Tecnológicos y Gadgets PulsoTech",
    badge: "TECNOLOGÍA & ACCESORIOS",
    badgeIcon: <Watch className="w-3.5 h-3.5" />,
    title: "Potencia e innovación para tu día.",
    subtitle: "Carga rápida GaN, smartwatches y accesorios originales con cobertura y soporte en todo el Perú.",
    ctaText: "EXPLORAR ACCESORIOS",
    ctaHref: "#catalogo",
  },
];

export default function AudioBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play cada 6s cuando no hay hover
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
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
      className="relative w-full h-full min-h-[360px] sm:min-h-[420px] overflow-hidden bg-neutral-950 select-none flex items-center group/slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides panorámicos en alta resolución con fundido cruzado limpio (SIN signos '+' sobre las fotos) */}
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

                {/* Gradiente oscuro cinematográfico para máxima legibilidad sin tapar los productos */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-neutral-950/95 via-neutral-950/60 to-neutral-950/20 sm:bg-gradient-to-r sm:from-neutral-950 sm:via-neutral-950/75 sm:to-transparent sm:w-[580px] lg:w-[640px]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido Comercial Principal: Tipografía de alto impacto y estilo editorial */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 w-full pt-16 sm:pt-20 pb-6 sm:pb-8">
        <div className="max-w-[360px] sm:max-w-[480px] space-y-4 sm:space-y-5">
          {/* Badge de categoría elegante con backdrop blur */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-semibold tracking-wider uppercase bg-black/60 text-white shadow-xs border border-white/20 backdrop-blur-md">
            {currentData.badgeIcon}
            <span>{currentData.badge}</span>
          </div>

          {/* Título comercial refinado y de excelente lectura */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
            {currentData.title}
          </h1>

          {/* Subtítulo descriptivo fluido */}
          <p className="text-xs sm:text-sm lg:text-base leading-relaxed font-normal max-w-md text-neutral-200/90 sm:text-neutral-300">
            {currentData.subtitle}
          </p>

          {/* Botones de acción: Verde institucional con brillo + Garantía */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              href={currentData.ctaHref}
              className="group relative inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#15803d] hover:bg-[#16a34a] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-lg hover:shadow-green-950/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
              <span>{currentData.ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Micro badge de garantía oficial */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-200 px-4 py-3 rounded-xl bg-white/[0.08] border border-white/15 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantía Oficial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flecha Anterior (Limpia y con efecto glass) */}
      <button
        onClick={prevSlide}
        type="button"
        aria-label="Foto anterior"
        className="group/btn absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/45 hover:bg-black/80 border border-white/20 hover:border-white/50 text-white flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer shadow-lg backdrop-blur-md"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover/btn:-translate-x-0.5" />
      </button>

      {/* Flecha Siguiente (Limpia y con efecto glass) */}
      <button
        onClick={nextSlide}
        type="button"
        aria-label="Foto siguiente"
        className="group/btn absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/45 hover:bg-black/80 border border-white/20 hover:border-white/50 text-white flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer shadow-lg backdrop-blur-md"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
      </button>

      {/* Indicadores inferiores en cápsula */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-30 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/50 hover:bg-black/70 px-3.5 py-1.5 rounded-full border border-white/15 transition-colors shadow-md backdrop-blur-md">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
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
