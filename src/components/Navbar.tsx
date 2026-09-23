"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Headphones, Truck, MessageSquare } from "lucide-react";
import { STORE_SETTINGS } from "@/data/products";

export default function Navbar() {
  const { itemsCount, setIsCartOpen, whatsappNumber } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full transition-all shadow-xs">
      {/* Top Retail Announcement Bar */}
      <div className="bg-neutral-900 text-white text-[11px] sm:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">
              Entregas el mismo día en Chimbote · Pago seguro contra entrega
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-neutral-300">
            <span>Atención rápida vía WhatsApp</span>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>+51 {STORE_SETTINGS.whatsappDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Retail Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm tracking-tight shadow-sm">
              P
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-neutral-950 group-hover:text-blue-600 transition-colors block leading-tight">
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
              <span>Audífonos</span>
            </Link>
            <Link href="/#como-comprar" className="hover:text-blue-600 transition-colors">
              Cómo Comprar
            </Link>
            <Link href="/#garantia" className="hover:text-blue-600 transition-colors">
              Garantía Local
            </Link>
          </nav>

          {/* Right Actions: WhatsApp + Cart */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                "¡Hola PulsoTech! Deseo consultar sobre disponibilidad de audífonos y pedidos en Chimbote."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir bolsa de compra"
              className="relative flex items-center justify-center px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white transition-all font-semibold text-xs gap-2 shadow-xs active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bolsa</span>
              {itemsCount > 0 && (
                <span className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white min-w-4 h-4">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
