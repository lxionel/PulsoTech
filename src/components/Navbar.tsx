"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, MessageSquare, Headphones, Zap, Watch } from "lucide-react";
import { STORE_SETTINGS } from "@/data/products";

export default function Navbar() {
  const { itemsCount, setIsCartOpen, whatsappNumber } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo: Clean Apple/Nothing Style */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-neutral-900 group-hover:text-black transition-colors">
              {STORE_SETTINGS.name}
            </span>
            <span className="text-[9px] tracking-widest uppercase text-neutral-400 -mt-1 font-mono">
              TECH & GADGETS
            </span>
          </div>
        </Link>

        {/* Navigation Categories for Customers */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-600">
          <a
            href="#audio-destacado"
            className="hover:text-black transition-colors flex items-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5 text-neutral-400" />
            <span>Audífonos & Audio (3D)</span>
          </a>
          <a
            href="#catalogo"
            className="hover:text-black transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-neutral-400" />
            <span>Carga Rápida</span>
          </a>
          <a
            href="#catalogo"
            className="hover:text-black transition-colors flex items-center gap-1.5"
          >
            <Watch className="w-3.5 h-3.5 text-neutral-400" />
            <span>Wearables</span>
          </a>
          <a href="#garantia" className="hover:text-black transition-colors">
            Garantía Oficial
          </a>
        </nav>

        {/* Right Actions: WhatsApp direct + Cart */}
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "¡Hola PulsoTech! Deseo consultar sobre disponibilidad y asesoramiento de productos."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir bolsa de compra"
            className="relative flex items-center justify-center px-3.5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 transition-all font-medium text-xs gap-2 shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bolsa</span>
            {itemsCount > 0 && (
              <span className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white text-black min-w-4 h-4">
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
