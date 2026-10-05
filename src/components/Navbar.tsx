"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Heart, Menu, X, Home, LayoutGrid, Headphones, ChevronRight } from "lucide-react";
import { STORE_SETTINGS } from "@/data/products";
import Logo from "./Logo";
import SocialIcon from "./SocialIcon";
import { isAudioCategory } from "@/lib/categories";

interface NavbarProps {
  currentCategory?: string;
  isTransparent?: boolean;
}

export default function Navbar({
  currentCategory,
  isTransparent = false,
}: NavbarProps = {}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const overlaysHero = isTransparent && isHome;
  const {
    itemsCount,
    setIsCartOpen,
    subtotal,
    favoritesCount,
    setIsFavoritesOpen,
  } = useCart();

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [isCatalogVisible, setIsCatalogVisible] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const isStartActive = isHome && !isCatalogVisible;
  const isCatalogActive = (isHome && isCatalogVisible) || (pathname.startsWith("/catalogo") || pathname.startsWith("/producto"));
  const isAudioActive = !isHome && isAudioCategory(currentCategory || "");
  const lastScrollY = React.useRef(0);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  React.useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const handleOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const desktop = window.matchMedia("(min-width: 640px)");
    const handleResize = () => { if (desktop.matches) setIsMobileMenuOpen(false); };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("pointerdown", handleOutsideClick);
    desktop.addEventListener("change", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("pointerdown", handleOutsideClick);
      desktop.removeEventListener("change", handleResize);
    };
  }, [isMobileMenuOpen]);

  React.useEffect(() => {
    let ticking = false;
    let animationFrame = 0;
    const updateActiveSection = () => {
      const catalog = document.getElementById("catalogo");
      setIsCatalogVisible(Boolean(catalog && catalog.getBoundingClientRect().top <= 80));
    };

    // Inicializar posición de scroll actual
    const initialY = window.scrollY;
    lastScrollY.current = Math.max(0, initialY);
    const initializationFrame = window.requestAnimationFrame(() => {
      setIsScrolled(window.scrollY > 20);
      setIsVisible(true);
      updateActiveSection();
    });

    const handleScroll = () => {
      if (!ticking) {
        animationFrame = window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          updateActiveSection();

          // Cerca del tope superior: siempre visible y estado no-scrolled
          if (currentScrollY <= 20) {
            setIsScrolled(false);
            setIsVisible(true);
            lastScrollY.current = Math.max(0, currentScrollY);
            ticking = false;
            return;
          }

          setIsScrolled(true);

          const delta = currentScrollY - lastScrollY.current;

          // Umbral de sensibilidad para evitar oscilaciones
          if (Math.abs(delta) >= 8) {
            if (delta > 0 && currentScrollY > 70) {
              // Desplazamiento hacia abajo: ocultar encabezado
              setIsVisible(false);
            } else if (delta < 0) {
              // Desplazamiento hacia arriba: mostrar encabezado
              setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(initializationFrame);
    };
  }, [pathname]);

  return (
    <header
      ref={headerRef}
      onBlur={(event) => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) {
          setIsMobileMenuOpen(false);
        }
      }}
      className={`store-motion w-full transition-[transform,background-color,border-color,box-shadow] duration-300 ease-in-out z-50 ${
        isVisible || isMobileMenuOpen ? "translate-y-0" : "-translate-y-full pointer-events-none"
      } ${
        overlaysHero
          ? `fixed top-0 left-0 right-0 ${
              isScrolled || isMobileMenuOpen
                ? "bg-black/95 backdrop-blur-md border-b border-white/10 text-white shadow-md"
                : "bg-transparent text-white border-none shadow-none"
            }`
          : "sticky top-0 bg-black text-white border-b border-white/10 shadow-sm"
      }`}
    >
      <div className="w-full max-w-[1650px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-14 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* Brand Logo PulsoTech + Nav en la esquina */}
        <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 shrink-0 min-w-0">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="store-mobile-navigation"
            onClick={() => setIsMobileMenuOpen((previous) => !previous)}
            className="store-menu-toggle sm:hidden h-11 w-11 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            {isMobileMenuOpen ? <X aria-hidden="true" className="w-5 h-5" /> : <Menu aria-hidden="true" className="w-5 h-5" />}
          </button>
          <Logo size="md" inverted onClick={() => setIsMobileMenuOpen(false)} className="gap-2 sm:gap-2.5 [&>div:first-child]:max-w-7 [&>div:first-child]:max-h-7 sm:[&>div:first-child]:max-w-none sm:[&>div:first-child]:max-h-none [&_span]:text-lg sm:[&_span]:text-xl" />

          {/* Menú de Navegación contextual en la esquina: Inicio y Catálogo */}
          <nav aria-label="Navegación principal" className="hidden sm:flex items-center gap-2 text-sm font-bold">
            <Link
              href="/#inicio"
              aria-current={isStartActive ? "location" : undefined}
              className={`inline-flex items-center justify-center min-h-10 sm:min-h-0 transition-[color,background-color,scale] duration-200 active:scale-95 px-4 sm:px-2.5 py-1 rounded-lg ${
                isStartActive
                  ? "text-white bg-white/15"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/#catalogo"
              aria-current={isCatalogActive ? "location" : undefined}
              className={`inline-flex items-center justify-center min-h-10 sm:min-h-0 transition-[color,background-color,scale] duration-200 active:scale-95 px-4 sm:px-2.5 py-1 rounded-lg ${
                isCatalogActive
                  ? "text-white bg-white/15"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Catálogo
            </Link>
          </nav>
        </div>

        {/* Right Actions: Social Media (Desktop) + Favorites + Cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Social Media Links */}
          <div
            className="hidden lg:flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl shadow-2xs bg-white/5 border border-white/10 text-white"
          >
            {/* Instagram */}
            <a
              href={STORE_SETTINGS.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (@lionel_a5)"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer text-neutral-200 hover:text-pink-400 hover:bg-white/15"
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer text-neutral-200 hover:text-white hover:bg-white/15"
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer text-neutral-200 hover:text-blue-400 hover:bg-white/15"
              title="Facebook: Lionel"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>

          {/* Favorites Button */}
          <button
            onClick={() => { setIsMobileMenuOpen(false); setIsFavoritesOpen(true); }}
            aria-label="Ver favoritos guardados"
            className="relative min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 flex items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all duration-200 shadow-2xs hover:scale-105 active:scale-90 cursor-pointer shrink-0 bg-white/10 hover:bg-white/20 border border-white/15 text-white"
            title="Mis Favoritos"
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                favoritesCount > 0 ? "text-red-500 fill-red-500 scale-110" : ""
              }`}
            />
            {favoritesCount > 0 && (
              <span key={favoritesCount} className="store-feedback absolute -top-1.5 -right-1.5 inline-flex items-center justify-center text-[9px] font-bold px-1 rounded-full bg-red-500 text-white min-w-3.5 h-3.5">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Navigate to the full bag page. */}
          <button
            onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}
            aria-label="Abrir bolsa de compra"
            className="group/cart relative min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 font-bold text-xs gap-2 sm:gap-2.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0 bg-white text-neutral-950 hover:bg-neutral-100 shadow-md hover:shadow-lg"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 transition-transform duration-200 group-hover/cart:scale-110 text-neutral-950" />
              {itemsCount > 0 && (
                <span key={itemsCount} className="store-feedback absolute -top-1.5 -right-1.5 inline-flex items-center justify-center text-[9px] font-bold px-1 rounded-full bg-blue-600 text-white min-w-3.5 h-3.5">
                  {itemsCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Bolsa</span>
            <span className="hidden sm:inline font-extrabold border-l pl-2 border-neutral-300 text-neutral-950">
              {STORE_SETTINGS.currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
      <nav
        id="store-mobile-navigation"
        aria-label="Menú móvil"
        hidden={!isMobileMenuOpen}
        className="absolute top-[calc(100%+8px)] inset-x-3 sm:hidden max-h-[calc(100dvh-88px)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-neutral-950 text-white shadow-2xl p-3"
      >
        <p className="px-3 pt-1 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Explorar PulsoTech</p>
        <div className="space-y-1">
          {[
            { label: "Inicio", href: "/#inicio", icon: Home, active: isStartActive },
            { label: "Catálogo", href: "/#catalogo", icon: LayoutGrid, active: isCatalogActive && !isAudioActive },
            { label: "Audífonos", href: "/catalogo/?categoria=aud%C3%ADfonos#seccion-categoria", icon: Headphones, active: isAudioActive },
          ].map(({ label, href, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              onClick={closeMobileMenu}
              aria-current={active ? "location" : undefined}
              className={`flex items-center gap-3 min-h-12 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "border-white/10 bg-white/8 text-white" : "border-transparent text-neutral-300 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-neutral-400" />
              <span className="flex-1">{label}</span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 text-neutral-500" />
            </Link>
          ))}
        </div>
        <div className="mt-3 border-t border-white/10 pt-3 grid grid-cols-3 gap-2 text-[11px] font-medium text-neutral-400">
          {(["instagram", "tiktok", "facebook"] as const).map((network) => <a key={network} href={STORE_SETTINGS.social[network]} target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 hover:text-white"><SocialIcon network={network} className="h-3.5 w-3.5 shrink-0" />{network === "instagram" ? "Instagram" : network === "tiktok" ? "TikTok" : "Facebook"}</a>)}
        </div>
      </nav>
    </header>
  );
}
