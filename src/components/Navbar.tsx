"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Heart } from "lucide-react";
import { STORE_SETTINGS } from "@/data/products";
import Logo from "./Logo";

interface NavbarProps {
  currentCategory?: string;
  isTransparent?: boolean;
}

export default function Navbar({
  currentCategory,
  isTransparent = false,
}: NavbarProps = {}) {
  const {
    itemsCount,
    setIsCartOpen,
    subtotal,
    favoritesCount,
    setIsFavoritesOpen,
  } = useCart();

  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full transition-all duration-300 z-50 ${
        isTransparent
          ? `fixed top-0 left-0 right-0 ${
              isScrolled
                ? "bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 text-white shadow-md"
                : "bg-transparent text-white border-b-0 border-none shadow-none"
            }`
          : "sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs text-[#111113]"
      }`}
    >
      <div className="w-full max-w-[1650px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-14 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* Brand Logo PulsoTech + Nav en la esquina */}
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 shrink-0 min-w-0">
          <Logo size="md" inverted={isTransparent} />

          {/* Menú de Navegación contextual en la esquina */}
          <nav className="flex items-center text-xs sm:text-sm font-bold">
            <Link
              href="/#catalogo"
              className={`transition-colors px-2 py-1 rounded-lg ${
                isTransparent
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-neutral-800 hover:text-black hover:bg-neutral-100"
              }`}
            >
              Catálogo
            </Link>
          </nav>
        </div>

        {/* Right Actions: Social Media (Desktop) + Favorites + Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Social Media Links */}
          <div
            className={`hidden sm:flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl shadow-2xs ${
              isTransparent
                ? "bg-black/40 border border-white/15 text-white"
                : "bg-neutral-100/90 border border-neutral-200/70 text-neutral-600"
            }`}
          >
            {/* Instagram */}
            <a
              href={STORE_SETTINGS.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (@lionel_a5)"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isTransparent
                  ? "text-neutral-200 hover:text-pink-400 hover:bg-white/15"
                  : "text-neutral-600 hover:text-pink-600 hover:bg-white"
              }`}
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
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isTransparent
                  ? "text-neutral-200 hover:text-white hover:bg-white/15"
                  : "text-neutral-600 hover:text-black hover:bg-white"
              }`}
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
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isTransparent
                  ? "text-neutral-200 hover:text-blue-400 hover:bg-white/15"
                  : "text-neutral-600 hover:text-blue-600 hover:bg-white"
              }`}
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
            className={`relative flex items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all duration-200 shadow-2xs hover:scale-105 active:scale-90 cursor-pointer shrink-0 ${
              isTransparent
                ? "bg-white/10 hover:bg-white/20 border border-white/15 text-white"
                : "bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-neutral-700"
            }`}
            title="Mis Favoritos"
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                favoritesCount > 0 ? "text-red-500 fill-red-500 scale-110" : ""
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center text-[9px] font-bold px-1 rounded-full bg-red-500 text-white min-w-3.5 h-3.5 animate-in zoom-in-75">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir bolsa de compra"
            className={`group/cart relative flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 font-bold text-xs gap-2 sm:gap-2.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              isTransparent
                ? "bg-white text-neutral-950 hover:bg-neutral-100 shadow-md hover:shadow-lg"
                : "bg-neutral-950 hover:bg-neutral-800 text-white hover:shadow-md"
            }`}
          >
            <div className="relative">
              <ShoppingBag className={`w-4 h-4 transition-transform duration-200 group-hover/cart:scale-110 ${isTransparent ? "text-neutral-950" : "text-white"}`} />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center text-[9px] font-bold px-1 rounded-full bg-blue-600 text-white min-w-3.5 h-3.5 animate-in zoom-in-75">
                  {itemsCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Bolsa</span>
            <span className={`font-extrabold border-l pl-1.5 sm:pl-2 ${isTransparent ? "border-neutral-300 text-neutral-950" : "border-neutral-700 text-white"}`}>
              {STORE_SETTINGS.currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
