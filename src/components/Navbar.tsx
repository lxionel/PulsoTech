"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Heart } from "lucide-react";
import { STORE_SETTINGS } from "@/data/products";
import Logo from "./Logo";
import TopBanner from "./TopBanner";

export default function Navbar() {
  const {
    itemsCount,
    setIsCartOpen,
    subtotal,
    favoritesCount,
    setIsFavoritesOpen,
  } = useCart();

  return (
    <div className="sticky top-0 z-40 w-full transition-all">
      <TopBanner />
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs transition-all">
      <div className="w-full max-w-[1650px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-14 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* Brand Logo PulsoTech + Nav */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 shrink-0 min-w-0">
          <Logo size="md" />

          {/* Menú de Navegación */}
          <nav className="hidden md:flex items-center text-sm font-bold text-neutral-800">
            <Link
              href="/#catalogo"
              className="text-neutral-800 hover:text-black transition-colors px-2.5 py-1 rounded-lg hover:bg-neutral-100"
            >
              Catálogo
            </Link>
          </nav>
        </div>

        {/* Right Actions: Social Media (Desktop) + Favorites + Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Social Media Links (Visible on tablets and desktop, clean in footer for mobile) */}
          <div className="hidden sm:flex items-center gap-0.5 sm:gap-1 bg-neutral-100/90 p-1 rounded-xl border border-neutral-200/70 shadow-2xs">
            {/* Instagram */}
            <a
              href={STORE_SETTINGS.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (@lionel_a5)"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-neutral-600 hover:text-pink-600 hover:bg-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Instagram: @lionel_a5"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href={STORE_SETTINGS.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok (@lionel_a5)"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-neutral-600 hover:text-black hover:bg-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="TikTok: @lionel_a5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.78a8.21 8.21 0 0 0 4.77 1.48V6.8a4.83 4.83 0 0 1-1-.11z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={STORE_SETTINGS.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook (Lionel)"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-neutral-600 hover:text-blue-600 hover:bg-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Facebook: Lionel"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>

          {/* Favorites Button */}
          <button
            onClick={() => setIsFavoritesOpen(true)}
            aria-label="Ver favoritos guardados"
            className="relative flex items-center justify-center p-2 sm:p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-red-500 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
            title="Mis Favoritos"
          >
            <Heart
              className={`w-4 h-4 ${
                favoritesCount > 0 ? "text-red-500 fill-red-500" : ""
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center text-[9px] font-bold px-1 rounded-full bg-red-500 text-white min-w-3.5 h-3.5">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir bolsa de compra"
            className="relative flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white transition-all font-bold text-xs gap-2 sm:gap-2.5 shadow-sm active:scale-95 cursor-pointer shrink-0"
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
            <span className="text-white font-extrabold border-l border-neutral-700 pl-1.5 sm:pl-2">
              {STORE_SETTINGS.currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </header>
    </div>
  );
}
