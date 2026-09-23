"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  Volume2,
  Package,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";

export default function HeroSection() {
  const { whatsappNumber } = useCart();

  const slides = [
    {
      id: "slide-1",
      tagline: "COLECCIÓN OFICIAL 2026",
      title: "¡Impulsa tu sonido!",
      subtitle:
        "Encuentra audífonos inalámbricos potentes y modernos, ideales para trabajar, estudiar o entrenar sin límites.",
      buttonText: "VER AUDÍFONOS",
      buttonLink: "#catalogo",
      image: getAssetUrl("/images/banners/hero-audio-1.jpg"),
      alt: "Audífonos Inalámbricos PulsoTech",
      badge: "STOCK EN CHIMBOTE",
      isWhatsApp: false,
    },
    {
      id: "slide-2",
      tagline: "AISLAMIENTO ACÚSTICO INTELIGENTE",
      title: "¡Cancelación de ruido activa!",
      subtitle:
        "Hasta 42dB de reducción de ruido ambiental. Sumérgete en tu música y llamadas nítidas en cualquier lugar.",
      buttonText: "VER MODELOS ANC",
      buttonLink: "/producto/redmi-buds-8-lite",
      image: getAssetUrl("/images/banners/hero-audio-2.jpg"),
      alt: "Cancelación de Ruido Activa PulsoTech",
      badge: "HASTA 42dB ANC",
      isWhatsApp: false,
    },
    {
      id: "slide-3",
      tagline: "ENTREGA LOCAL INMEDIATA",
      title: "¡Recibe hoy y paga al recibir!",
      subtitle:
        "Productos 100% originales en caja sellada de fábrica. Coordinamos tu entrega hoy en Chimbote con pago contra entrega en Efectivo o Yape.",
      buttonText: "PEDIR POR WHATSAPP",
      buttonLink: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "¡Hola PulsoTech! Deseo consultar sobre la disponibilidad y entregas hoy en Chimbote."
      )}`,
      image: getAssetUrl("/images/banners/hero-audio-3.jpg"),
      alt: "Entrega Inmediata y Pago Seguro en Chimbote",
      badge: "PAGO CONTRA ENTREGA",
      isWhatsApp: true,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const categories = [
    {
      icon: Headphones,
      label: "Audífonos",
      subtitle: "Inalámbricos TWS",
      href: "#catalogo",
    },
    {
      icon: Volume2,
      label: "Cancelación ANC",
      subtitle: "Aislamiento Activo",
      href: "/producto/redmi-buds-8-lite",
    },
    {
      icon: Package,
      label: "Cajas Selladas",
      subtitle: "100% Originales",
      href: "#catalogo",
    },
    {
      icon: ShieldCheck,
      label: "Garantía Local",
      subtitle: "Entregas Chimbote",
      href: "#garantia",
    },
  ];

  return (
    <section className="w-full bg-white">
      {/* Cinematic E-Commerce Slider (Inspired by Despegatec Layout) */}
      <div
        className="relative w-full overflow-hidden bg-neutral-100 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-700 ease-out h-[420px] sm:h-[480px] lg:h-[540px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative w-full h-full shrink-0 flex items-center overflow-hidden"
            >
              {/* Background Panoramic Photography */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  className="object-cover object-right lg:object-center"
                />
                {/* Legibility Gradient Overlay (Left to Right) */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 sm:via-white/70 to-transparent lg:w-3/5 z-1" />
              </div>

              {/* Foreground Commercial Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
                <div className="max-w-xl space-y-4 sm:space-y-5">
                  {/* Subtle Badge */}
                  <span className="inline-block px-3 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest uppercase bg-neutral-950 text-white shadow-xs">
                    {slide.badge}
                  </span>

                  {/* Big Bold Headline */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 leading-[1.08]">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm lg:text-base text-neutral-700 leading-relaxed font-normal max-w-lg">
                    {slide.subtitle}
                  </p>

                  {/* Action CTA Button (Despegatec Blue Style) */}
                  <div className="pt-2">
                    {slide.isWhatsApp ? (
                      <a
                        href={slide.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3.5 sm:py-4 rounded-xl bg-[#155dfc] hover:bg-[#0d47c4] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{slide.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link
                        href={slide.buttonLink}
                        className="inline-flex items-center gap-2 px-8 py-3.5 sm:py-4 rounded-xl bg-[#155dfc] hover:bg-[#0d47c4] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{slide.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Previous Slide Arrow */}
        <button
          onClick={prevSlide}
          aria-label="Slide anterior"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-neutral-800 hover:text-black flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Slide Arrow */}
        <button
          onClick={nextSlide}
          aria-label="Siguiente slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-neutral-800 hover:text-black flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Pagination Dots (Despegatec Style) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir a slide ${idx + 1}`}
              className={`rounded-full transition-all cursor-pointer ${
                currentSlide === idx
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Iconic Categories Bar (Directly below hero banner, exact Despegatec structure) */}
      <div className="border-b border-neutral-200/80 bg-white py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center justify-center">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={cat.href}
                  className="group flex flex-col items-center justify-center text-center p-3 rounded-2xl hover:bg-neutral-50/80 transition-all cursor-pointer"
                >
                  {/* Clean Minimalist Line Icon */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-50 group-hover:bg-blue-50 border border-neutral-200/60 group-hover:border-blue-200 flex items-center justify-center text-neutral-900 group-hover:text-[#155dfc] group-hover:-translate-y-1 transition-all duration-300 shadow-2xs mb-2.5">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.6]" />
                  </div>

                  {/* Category Title */}
                  <h3 className="text-sm sm:text-base font-extrabold text-neutral-950 group-hover:text-[#155dfc] transition-colors">
                    {cat.label}
                  </h3>

                  {/* Category Subtitle */}
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {cat.subtitle}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
