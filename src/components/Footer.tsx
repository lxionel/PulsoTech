"use client";

import React from "react";
import Link from "next/link";
import { STORE_SETTINGS } from "@/data/products";
import { ArrowUpRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Logo from "./Logo";
import { COMPLAINT_BOOK_ENABLED } from "@/data/store-policies";

export default function Footer() {
  const { whatsappNumber } = useCart();

  return (
    <footer id="garantia" className="store-footer border-t border-white/10 bg-black text-neutral-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10 grid gap-7 md:grid-cols-[1.2fr_1fr] md:gap-12">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 max-w-sm">
            <Logo size="sm" inverted />
          {/* Social Networks Links */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={STORE_SETTINGS.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Lionel"
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              title="Instagram: @lionel_a5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href={STORE_SETTINGS.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok de Lionel"
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              title="TikTok: @lionel_a5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.78a8.21 8.21 0 0 0 4.77 1.48V6.8a4.83 4.83 0 0 1-1-.11z" />
              </svg>
            </a>
            <a
              href={STORE_SETTINGS.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de Lionel"
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              title="Facebook: Lionel"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          </div>
          <p className="text-xs leading-relaxed text-neutral-400">Chimbote, Perú · Pedidos por WhatsApp.</p>
        </div>

        <nav aria-label="Enlaces del pie de página" className="grid grid-cols-2 gap-6 text-xs">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Tienda</p>
            <div className="flex flex-col items-start">
              <Link href="/#inicio" className="inline-flex min-h-9 items-center hover:text-white transition-colors">Inicio</Link>
              <Link href="/#catalogo" className="inline-flex min-h-9 items-center hover:text-white transition-colors">Catálogo</Link>
              <Link href="/catalogo/?categoria=aud%C3%ADfonos#seccion-categoria" className="inline-flex min-h-9 items-center hover:text-white transition-colors">Audífonos</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Atención</p>
            <div className="flex flex-col items-start">
              <a href={`https://wa.me/${(whatsappNumber || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                WhatsApp <ArrowUpRight aria-hidden="true" className="w-3 h-3" />
              </a>
              <Link href="/garantia-y-entregas/" className="inline-flex min-h-9 items-center hover:text-white transition-colors">Garantía y entregas</Link>
              <Link href="/reclamaciones/" className="inline-flex min-h-9 items-center hover:text-white transition-colors">{COMPLAINT_BOOK_ENABLED ? "Libro de Reclamaciones" : "Atención y reclamos"}</Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto pl-5 pr-20 sm:pl-6 sm:pr-60 lg:pl-8 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-[11px] leading-relaxed text-neutral-400">
          <p>© {new Date().getFullYear()} {STORE_SETTINGS.name}. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacidad/" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/terminos/" className="hover:text-white transition-colors">Términos y condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
