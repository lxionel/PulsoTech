"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAssetUrl } from "@/utils/paths";

interface SlideData {
  id: number;
  image: string;
  alt: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: "/images/banners/hero-audio-slider-1.png",
    alt: "Colección Completa de Audífonos y Sonido PulsoTech",
  },
  {
    id: 2,
    image: "/images/banners/hero-audio-slider-2.png",
    alt: "Audífonos Bose Over-Ear Diadema Premium",
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

  // Auto-play cada 5.5s cuando no hay hover
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

  return (
    <div
      className="relative w-full h-full min-h-[300px] overflow-hidden bg-neutral-950 select-none flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides panorámicos completos de borde a borde */}
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
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                quality={100}
                className="object-cover object-center select-none"
              />
            </div>
          );
        })}
      </div>

      {/* Flecha Anterior */}
      <button
        onClick={prevSlide}
        type="button"
        aria-label="Foto anterior"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/75 border border-white/20 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-lg hover:border-white/40"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Flecha Siguiente */}
      <button
        onClick={nextSlide}
        type="button"
        aria-label="Foto siguiente"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/75 border border-white/20 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-lg hover:border-white/40"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Indicadores inferiores - Únicamente 2 barras/puntos, SIN números */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-30 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-white/15 shadow-md">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              type="button"
              aria-label={`Ver foto ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? "w-7 bg-white shadow-xs"
                  : "w-2 bg-white/40 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
