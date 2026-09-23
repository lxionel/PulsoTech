"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Headphones } from "lucide-react";
import { STORE_SETTINGS } from "@/data/products";

export default function Navbar() {
  const { itemsCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm">
            P
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900 group-hover:text-black transition-colors">
            {STORE_SETTINGS.name}
          </span>
        </Link>

        {/* Navigation Categories */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-600">
          <a
            href="#catalogo"
            className="hover:text-black transition-colors flex items-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5 text-neutral-400" />
            <span>Audífonos</span>
          </a>
          <a href="#garantia" className="hover:text-black transition-colors">
            Garantía y Entregas
          </a>
        </nav>

        {/* Right Actions: Cart */}
        <div className="flex items-center gap-3">

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
