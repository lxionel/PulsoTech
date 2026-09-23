"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
// AudioSpotlight oculto temporalmente hasta disponer de modelo 3D fiel al producto real
// import AudioSpotlight from "@/components/AudioSpotlight";
import ProductCatalog from "@/components/ProductCatalog";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailModal from "@/components/ProductDetailModal";
import Footer from "@/components/Footer";
import { MessageSquare, Headphones, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { whatsappNumber } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      {/* Top Banner: Minimalist */}
      <div className="w-full bg-[#f4f4f6] border-b border-neutral-200/90 py-2 px-4 text-center text-xs text-neutral-600 flex items-center justify-center gap-2 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          Entrega el mismo día en Chimbote · Envíos a todo el Perú por Olva Courier
        </span>
        <span className="text-neutral-400">•</span>
        <span className="hidden sm:inline text-neutral-500">
          Coordinación inmediata por WhatsApp
        </span>
      </div>

      {/* Main Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Main Tech Store Hero Section */}
        <HeroSection />

        {/* 2. Specialized Audio Spotlight Section with 3D Headphone Viewer */}
        {/*
          <AudioSpotlight />
          Nota: Oculto temporalmente. Se retomará más adelante con un modelo 3D fiel al producto real.
        */}

        {/* 3. Tech Department Pillars */}
        <section className="py-12 border-b border-neutral-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#f8f8fa] border border-neutral-200/70">
                <div className="p-3 rounded-xl bg-white text-neutral-900 border border-neutral-200 shrink-0 shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Audífonos Xiaomi & Redmi Originales
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Modelos True Wireless 100% auténticos con cancelación activa de ruido, gran autonomía y garantía.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#f8f8fa] border border-neutral-200/70">
                <div className="p-3 rounded-xl bg-white text-neutral-900 border border-neutral-200 shrink-0 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Entrega Local y Envíos Perú
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Entrega el mismo día en Chimbote y envíos a todo el Perú por Olva Courier con seguimiento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#f8f8fa] border border-neutral-200/70">
                <div className="p-3 rounded-xl bg-white text-neutral-900 border border-neutral-200 shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Garantía & Trato Directo
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Garantía oficial contra fallas de fábrica. Coordinación inmediata y segura vía WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Complete Products Catalog */}
        <ProductCatalog />

        {/* Floating WhatsApp Concierge Button */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            "¡Hola PulsoTech! Me gustaría consultar sobre los audífonos Xiaomi y Redmi disponibles y envíos."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hablar por WhatsApp con PulsoTech"
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl hover:shadow-2xl transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 group"
        >
          <MessageSquare className="w-5 h-5 fill-white text-white" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-bold font-sans">
            ¿Dudas? Chatea con nosotros
          </span>
        </a>
      </main>

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <ProductDetailModal />

      {/* Clean Customer Footer */}
      <Footer />
    </div>
  );
}
