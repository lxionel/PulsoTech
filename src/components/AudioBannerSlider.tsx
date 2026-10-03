"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Truck, Banknote } from "lucide-react";
import { getAssetUrl } from "@/utils/paths";
import { STORE_SETTINGS } from "@/data/products";

interface SlideData {
  id: number;
  image: string;
  alt: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: "/images/banners/hero-audio-slider-1.png",
    alt: "Colección Completa de Audífonos y Sonido PulsoTech",
    badge: "SECCIÓN OFICIAL · AUDÍFONOS",
    title: "Audífonos 100% Originales en Caja Sellada.",
    subtitle: "Modelos de Diadema y True Wireless garantizados. Entrega el mismo día en Lima con opción de pago contra entrega (Efectivo o Yape al recibir).",
    ctaText: "VER MODELOS DISPONIBLES",
    ctaHref: "#catalogo",
  },
  {
    id: 2,
    image: "/images/banners/hero-audio-slider-2.png",
    alt: "Audífonos Over-Ear Diadema Premium con Cancelación de Ruido",
    badge: "CANCELACIÓN ACTIVA ANC",
    title: "Comodidad total y cancelación de ruido pura.",
    subtitle: "Diseñados para largas sesiones de trabajo, estudio o viajes. Almohadillas ultra suaves, bajos profundos y hasta 40 horas continuas de batería.",
    ctaText: "EXPLORAR MODELOS OVER-EAR",
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

  // Auto-play cada 7s cuando el cursor no está encima
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
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
      onMouseLeave={() => setIsHovered(false)}
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
                  className="object-cover object-[75%_center] sm:object-[68%_center] md:object-[65%_center] lg:object-[60%_center] select-none"
                />

                {/* Gradiente oscuro obsidiana en el lado izquierdo para dar 100% legibilidad sin tapar los audífonos */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-neutral-950/95 via-neutral-950/70 to-neutral-950/30 sm:bg-gradient-to-r sm:from-neutral-950 sm:via-neutral-950/85 sm:to-transparent sm:w-[540px] lg:w-[620px]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido comercial limpio a la izquierda (sin tapar los audífonos físicos) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 w-full pt-16 sm:pt-20 pb-6 sm:pb-8 pointer-events-none">
        <div className="max-w-[340px] sm:max-w-[460px] lg:max-w-[500px] space-y-3 sm:space-y-4 pointer-events-auto">
          {/* Badge de sección */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-900/90 text-white shadow-xs border border-white/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{currentData.badge}</span>
            </span>
          </div>

          {/* Título comercial */}
          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.12] text-white">
            {currentData.title}
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="text-xs sm:text-sm lg:text-[15px] leading-relaxed font-normal max-w-sm sm:max-w-md text-neutral-300">
            {currentData.subtitle}
          </p>

          {/* Botones de acción comerciales */}
          <div className="pt-1.5 sm:pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              href={currentData.ctaHref}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>{currentData.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/${STORE_SETTINGS.whatsappNumber}?text=${encodeURIComponent("Hola PulsoTech, deseo consultar los modelos de audífonos disponibles en stock.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm tracking-wide border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer backdrop-blur-md"
            >
              <span>Consultar Stock</span>
            </a>
          </div>

          {/* Indicadores de confianza de compra */}
          <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Garantía Oficial 12 Meses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Envío Express Hoy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pago al Recibir</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flechas de navegación del carrusel */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Diapositiva anterior"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-200 opacity-0 group-hover/slider:opacity-100 cursor-pointer backdrop-blur-xs"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Siguiente diapositiva"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-200 opacity-0 group-hover/slider:opacity-100 cursor-pointer backdrop-blur-xs"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicadores de diapositiva en la base */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Ir a diapositiva ${index + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              index === currentSlide
                ? "w-7 h-1.5 bg-white shadow-xs"
                : "w-2 h-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
