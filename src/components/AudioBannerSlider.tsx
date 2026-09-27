"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { getAssetUrl } from "@/utils/paths";

interface SlideData {
  id: number;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  categoryTag: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: "/images/banners/hero-audio-slider-1.png",
    badge: "STOCK DISPONIBLE • COLECCIÓN DE AUDIO",
    title: "¡Colección Completa de Audio!",
    subtitle:
      "Modelos originales en caja sellada de fábrica, sonido inmersivo de alta fidelidad y pago contra entrega en todo Lima.",
    categoryTag: "Modelos Seleccionados",
  },
  {
    id: 2,
    image: "/images/banners/hero-audio-slider-2.jpg",
    badge: "ALTA DEFINICIÓN • OVER-EAR",
    title: "¡Audífonos de Diadema Premium!",
    subtitle:
      "Aislamiento acústico, máxima comodidad ergonómica y sonido nítido para estudio, trabajo y música.",
    categoryTag: "Diseño Over-Ear",
  },
  {
    id: 3,
    image: "/images/banners/hero-audio-slider-3.jpg",
    badge: "CONEXIÓN RÁPIDA • TRUE WIRELESS",
    title: "¡Audífonos In-Ear Inalámbricos!",
    subtitle:
      "Estuche de carga inteligente, diseño ultra portátil, bajos potentes y llamadas en alta definición.",
    categoryTag: "In-Ear & TWS",
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

  // Auto-play interval (every 5 seconds when not hovered)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  // Touch Swipe Handlers
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

  const current = SLIDES[currentSlide];

  return (
    <section
      className="relative w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] overflow-hidden bg-neutral-950 select-none flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={getAssetUrl(slide.image)}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="100vw"
                quality={100}
                className="object-cover object-[70%_center] sm:object-center select-none"
              />

              {/* Gradient overlay for readability without obscuring the products */}
              <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-neutral-950/90 via-neutral-950/50 to-neutral-950/20 sm:bg-gradient-to-r sm:from-neutral-950/90 sm:via-neutral-950/65 sm:to-transparent sm:w-3/5 lg:w-[48%]" />
            </div>
          );
        })}
      </div>

      {/* Indicador de categoría en la esquina de la imagen */}
      <div className="absolute top-20 right-4 sm:right-10 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-xs font-bold tracking-wider shadow-lg">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        <span className="tracking-widest">AUDÍFONOS</span>
      </div>

      {/* Main Commercial Content Overlay - Sin cuadros, limpio y visible */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full pt-16 sm:pt-20 pb-6 sm:pb-8">
        <div className="max-w-xl space-y-3 sm:space-y-4">
          {/* Volver al inicio link sin cuadro */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 hover:text-white drop-shadow-sm transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Volver al inicio</span>
            </Link>
          </div>

          {/* Kicker sin cuadro */}
          <p className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-sky-400 drop-shadow-sm">
            {current.badge} • <span className="text-white/80">{current.categoryTag}</span>
          </p>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white drop-shadow-md">
            {current.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm lg:text-base leading-relaxed font-normal max-w-lg text-neutral-200 drop-shadow-sm">
            {current.subtitle}
          </p>

          {/* Trust Guarantees - Lista limpia con iconos y puntos, cero cuadros */}
          <div className="pt-1.5 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm font-bold text-white drop-shadow-sm">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Caja Sellada</span>
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Garantía PulsoTech</span>
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Pago Contra Entrega</span>
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Entrega Inmediata</span>
            </span>
          </div>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={prevSlide}
        type="button"
        aria-label="Foto anterior"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        type="button"
        aria-label="Foto siguiente"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Bottom Indicators & Slide Counter */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              type="button"
              aria-label={`Ir al slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
          <span className="text-[10px] font-mono text-neutral-300 ml-1.5 font-bold">
            0{currentSlide + 1} / 0{SLIDES.length}
          </span>
        </div>
      </div>
    </section>
  );
}
