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
      className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] overflow-hidden bg-neutral-950 select-none flex items-center"
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
                quality={95}
                className="object-cover object-[65%_center] sm:object-center select-none"
              />

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/65 to-neutral-950/30 sm:bg-gradient-to-r sm:from-neutral-950/95 sm:via-neutral-950/75 sm:to-transparent sm:w-3/5 lg:w-[52%]" />
            </div>
          );
        })}
      </div>

      {/* Main Commercial Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full py-6 sm:py-8">
        <div className="max-w-xl space-y-3.5 sm:space-y-4">
          {/* Volver al inicio link */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-neutral-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver al inicio</span>
            </Link>
          </div>

          {/* Badge & Category Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-950 text-white shadow-xs border border-white/15">
              {current.badge}
            </span>
            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-500/30 backdrop-blur-xs">
              {current.categoryTag}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white">
            {current.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm lg:text-base leading-relaxed font-normal max-w-lg text-neutral-200 sm:text-neutral-300">
            {current.subtitle}
          </p>

          {/* Trust Guarantees */}
          <div className="pt-1 flex flex-wrap gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-tight border border-white/10 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-200" />
              <span>100% Caja Sellada</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-tight border border-white/10 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-neutral-200" />
              <span>Garantía PulsoTech</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-tight border border-white/10 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-neutral-200" />
              <span>Pago Contra Entrega</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-tight border border-white/10 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-200" />
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
