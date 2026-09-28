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
    alt: "Colección Completa de Audífonos PulsoTech",
  },
  {
    id: 2,
    image: "/images/banners/hero-audio-slider-2.jpg",
    alt: "Audífonos Over-Ear Diadema Premium",
  },
  {
    id: 3,
    image: "/images/banners/hero-audio-slider-3.jpg",
    alt: "Audífonos In-Ear Inalámbricos TWS",
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
      className="relative w-full h-[320px] sm:h-[380px] md:h-[430px] lg:h-[470px] overflow-hidden bg-neutral-950 select-none flex items-center justify-center pt-14 pb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides fotográficos puros sin textos ni degradados que tapen */}
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
              {/* Fondo ambiental suave con los colores de la misma foto */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                  src={getAssetUrl(slide.image)}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  quality={40}
                  className="object-cover blur-3xl opacity-30 scale-110 select-none"
                />
                <div className="absolute inset-0 bg-neutral-950/40" />
              </div>

              {/* Imagen fotográfica completa, más chica, centrada y sin recortes */}
              <div className="relative z-10 w-full h-full max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-center px-4 sm:px-12 py-2">
                <div className="relative w-full h-full max-h-[230px] sm:max-h-[290px] md:max-h-[340px] lg:max-h-[380px]">
                  <Image
                    src={getAssetUrl(slide.image)}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 1200px"
                    quality={100}
                    className="object-contain select-none drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flecha Anterior */}
      <button
        onClick={prevSlide}
        type="button"
        aria-label="Foto anterior"
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-lg hover:border-white/40"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Flecha Siguiente */}
      <button
        onClick={nextSlide}
        type="button"
        aria-label="Foto siguiente"
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-lg hover:border-white/40"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Indicadores inferiores y contador */}
      <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/15 shadow-md">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              type="button"
              aria-label={`Ir a la foto ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
          <span className="text-[10px] font-mono text-neutral-300 ml-1 font-bold tracking-wider">
            0{currentSlide + 1} / 0{SLIDES.length}
          </span>
        </div>
      </div>
    </div>
  );
}
