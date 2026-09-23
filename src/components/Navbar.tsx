"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Headphones, MessageSquare } from "lucide-react";
import { STORE_SETTINGS } from "@/data/products";

export default function Navbar() {
  const { itemsCount, setIsCartOpen, whatsappNumber, subtotal } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo (Despegatec Inspiration) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-base tracking-tighter shadow-sm">
            ⚡
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-neutral-950 group-hover:text-blue-600 transition-colors block leading-tight">
              {STORE_SETTINGS.name}
            </span>
            <span className="text-[10px] text-neutral-500 font-semibold tracking-wider uppercase block">
              Tecnología & Audio
            </span>
          </div>
        </Link>

        {/* Navigation Categories */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-700">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Inicio
          </Link>
          <Link
            href="/#catalogo"
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600" />
            <span>Catálogo</span>
          </Link>
          <Link href="/#como-comprar" className="hover:text-blue-600 transition-colors">
            Métodos de Pago
          </Link>
          <Link href="/#faq" className="hover:text-blue-600 transition-colors">
            Preguntas Frecuentes
          </Link>
          <Link href="/#garantia" className="hover:text-blue-600 transition-colors">
            Garantía Chimbote
          </Link>
        </nav>

        {/* Right Actions: Cart with Total */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir bolsa de compra"
            className="relative flex items-center justify-center px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white transition-all font-bold text-xs gap-2.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-white" />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center text-[9px] font-bold px-1 rounded-full bg-blue-600 text-white min-w-3.5 h-3.5">
                  {itemsCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Bolsa</span>
            <span className="text-white font-extrabold border-l border-neutral-700 pl-2">
              {STORE_SETTINGS.currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
