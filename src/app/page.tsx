"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductCatalog from "@/components/ProductCatalog";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailModal from "@/components/ProductDetailModal";
import Footer from "@/components/Footer";
import { MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { whatsappNumber } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      {/* Main Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Main Store Hero Section */}
        <HeroSection />

        {/* 2. Complete Products Catalog */}
        <ProductCatalog />

        {/* Floating WhatsApp Concierge Button */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            "¡Hola PulsoTech! Me gustaría consultar sobre los audífonos disponibles y envíos."
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
