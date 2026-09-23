"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  Watch,
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";

export default function HeroSection() {
  const { whatsappNumber } = useCart();

  const slides = [
    {
      id: "slide-1",
      tagline: "TIENDA OFICIAL DE TECNOLOGÍA",
      titlePrefix: "¡Tecnología y audio ",
      highlight: "original!",
      title: "¡Tecnología y audio original!",
      subtitle:
        "Encuentra audífonos, smartwatches y accesorios garantizados en caja sellada de fábrica. Entrega el mismo día con pago seguro contra entrega.",
      buttonText: "VER CATÁLOGO",
      buttonLink: "#catalogo",
      image: getAssetUrl("/images/banners/hero-tech-1.png"),
      alt: "PulsoTech Tecnología y Audio Original",
      badge: "STOCK DISPONIBLE",
      features: [
        "100% Caja sellada",
        "Garantía oficial",
        "Pago contra entrega",
      ],
      theme: "dark" as const,
      isWhatsApp: false,
    },
    {
      id: "slide-2",
      tagline: "COLECCIÓN OFICIAL DE AUDÍFONOS",
      titlePrefix: "¡Impulsa ",
      highlight: "tu sonido!",
      title: "¡Impulsa tu sonido!",
      subtitle:
        "Audífonos inalámbricos Xiaomi y Redmi con sonido envolvente, cancelación de ruido y hasta 36 horas de batería.",
      buttonText: "VER AUDÍFONOS",
      buttonLink: "#catalogo",
      image: getAssetUrl("/images/banners/hero-audio-1.jpg"),
      alt: "Audífonos Inalámbricos TWS PulsoTech",
      badge: "AUDIO DE ALTA FIDELIDAD",
      features: [
        "Cancelación de ruido",
        "Bluetooth 5.4",
        "Batería hasta 36h",
      ],
      theme: "light" as const,
      isWhatsApp: false,
    },
    {
      id: "slide-3",
      tagline: "ECOSISTEMA & CARGA RÁPIDA",
      titlePrefix: "¡Potencia ",
      highlight: "tus dispositivos!",
      title: "¡Potencia tus dispositivos!",
      subtitle:
        "Cargadores inteligentes, accesorios y wearables con garantía de funcionamiento. Coordinamos tu entrega en minutos por WhatsApp.",
      buttonText: "PEDIR POR WHATSAPP",
      buttonLink: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "¡Hola PulsoTech! Deseo consultar sobre los productos disponibles y coordinar una entrega hoy."
      )}`,
      image: getAssetUrl("/images/banners/hero-tech-2.jpg"),
      alt: "Ecosistema Tecnológico PulsoTech",
      badge: "ENTREGA EL MISMO DÍA",
      features: [
        "Atención inmediata",
        "Coordinación directa",
        "Envíos exprés",
      ],
      theme: "dark" as const,
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
      icon: Watch,
      label: "Smartwatches",
      subtitle: "Relojes & Pulseras",
      href: "#catalogo",
    },
    {
      icon: Zap,
      label: "Carga & Cables",
      subtitle: "GaN Inteligente",
      href: "#catalogo",
    },
    {
      icon: ShieldCheck,
      label: "Garantía Local",
      subtitle: "Envíos Directos",
      href: "#garantia",
    },
  ];

  return (
    <section className="w-full bg-white">
      {/* Cinematic E-Commerce Slider */}
      <div
        className="relative w-full overflow-hidden bg-neutral-950 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-700 ease-out h-[480px] sm:h-[540px] lg:h-[600px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const isDark = slide.theme === "dark";
            return (
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
                    className="object-cover object-center"
                  />

                  {/* Soft atmospheric gradient */}
                  <div
                    className={`absolute inset-0 z-1 pointer-events-none transition-opacity duration-500 ${
                      isDark
                        ? "bg-gradient-to-r from-black/70 via-black/35 to-transparent"
                        : "bg-gradient-to-r from-white/70 via-white/35 to-transparent"
                    }`}
                  />
                </div>

                {/* Foreground Commercial Content with Glassmorphic Card */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full flex items-center">
                  <div
                    className={`w-full max-w-lg lg:max-w-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl space-y-4 sm:space-y-5 transition-all duration-300 ${
                      isDark
                        ? "bg-neutral-950/65 backdrop-blur-xl border border-white/10 shadow-black/70"
                        : "bg-white/85 backdrop-blur-xl border border-neutral-200/90 shadow-neutral-900/10"
                    }`}
                  >
                    {/* Glowing Pill Badge */}
                    <div>
                      <div
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase backdrop-blur-md ${
                          isDark
                            ? "bg-blue-500/15 border border-blue-400/30 text-blue-400"
                            : "bg-blue-50 border border-blue-200 text-blue-600"
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              isDark ? "bg-blue-400" : "bg-blue-500"
                            }`}
                          />
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              isDark ? "bg-blue-500" : "bg-blue-600"
                            }`}
                          />
                        </span>
                        <span>{slide.badge}</span>
                      </div>
                    </div>

                    {/* Big Bold Headline with Gradient Accent */}
                    <h1
                      className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] ${
                        isDark ? "text-white" : "text-neutral-950"
                      }`}
                    >
                      {slide.titlePrefix}
                      <span
                        className={
                          isDark
                            ? "bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent"
                            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent"
                        }
                      >
                        {slide.highlight}
                      </span>
                    </h1>

                    {/* Subtitle */}
                    <p
                      className={`text-xs sm:text-sm lg:text-[15px] leading-relaxed font-normal ${
                        isDark ? "text-neutral-300/90" : "text-neutral-600"
                      }`}
                    >
                      {slide.subtitle}
                    </p>

                    {/* Value Proposition Micro-chips */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-0.5">
                      {slide.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold ${
                            isDark ? "text-neutral-300" : "text-neutral-700"
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isDark ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action CTA Button */}
                    <div className="pt-2">
                      {slide.isWhatsApp ? (
                        <a
                          href={slide.buttonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                        >
                          <span>{slide.buttonText}</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      ) : (
                        <Link
                          href={slide.buttonLink}
                          className={`group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer ${
                            isDark
                              ? "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30 hover:shadow-blue-600/50"
                              : "bg-neutral-950 hover:bg-neutral-800 shadow-neutral-950/20 hover:shadow-neutral-950/40"
                          }`}
                        >
                          <span>{slide.buttonText}</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Previous Slide Arrow */}
        <button
          onClick={prevSlide}
          aria-label="Slide anterior"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Slide Arrow */}
        <button
          onClick={nextSlide}
          aria-label="Siguiente slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Pagination Dots (Despegatec Style) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-xs px-3.5 py-1.5 rounded-full">
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
