"use client";

import React from "react";
import { STORE_SETTINGS } from "@/data/products";
import { ArrowUpRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Logo from "./Logo";

export default function Footer() {
  const { whatsappNumber } = useCart();

  return (
    <footer id="garantia" className="border-t border-neutral-200 bg-white text-neutral-600 text-xs">

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-3">
          <Logo size="sm" />
          <p className="text-neutral-500 max-w-sm text-xs leading-relaxed">
            Distribución de tecnología, audífonos 100% originales y accesorios garantizados. Entrega el mismo día y pago seguro contra entrega.
          </p>
          {/* Social Networks Links */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={STORE_SETTINGS.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Lionel"
              className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-pink-600 flex items-center justify-center transition-colors"
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
              className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black flex items-center justify-center transition-colors"
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
              className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-blue-600 flex items-center justify-center transition-colors"
              title="Facebook: Lionel"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-neutral-600">
          <a href="#catalogo" className="hover:text-black transition-colors">
            Catálogo de Productos
          </a>
          <a href="#como-comprar" className="hover:text-black transition-colors">
            Cómo Comprar
          </a>
          <a href="#garantia" className="hover:text-black transition-colors">
            Garantía Total
          </a>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-700 transition-colors flex items-center gap-1 font-semibold text-emerald-600"
          >
            <span>WhatsApp Directo</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Bottom Bar: Clean Legal */}
      <div className="border-t border-neutral-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <div>
            © {new Date().getFullYear()} {STORE_SETTINGS.name}. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacidad</span>
            <span>Términos y Condiciones</span>
            <span>Libro de Reclamaciones</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
