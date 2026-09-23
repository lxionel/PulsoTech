"use client";

import React from "react";
import { STORE_SETTINGS } from "@/data/products";
import { ShieldCheck, Truck, Headphones, MessageSquare, ArrowUpRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Footer() {
  const { whatsappNumber } = useCart();

  return (
    <footer id="garantia" className="border-t border-neutral-800 bg-[#070709] text-neutral-400 text-xs">
      {/* Guarantees bar */}
      <div className="border-b border-neutral-800/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-neutral-800 text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Garantía PulsoTech</h4>
              <p className="text-neutral-400 mt-1 leading-relaxed">
                Productos 100% originales con garantía ante cualquier falla técnica.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-neutral-800 text-blue-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Entrega el Mismo Día</h4>
              <p className="text-neutral-400 mt-1 leading-relaxed">
                Entrega local en Chimbote con coordinación inmediata por WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-neutral-800 text-blue-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Originales Garantizados</h4>
              <p className="text-neutral-400 mt-1 leading-relaxed">
                Empaque sellado de fábrica con verificación auténtica y números de serie.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-neutral-800 text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Asesoría Personalizada</h4>
              <p className="text-neutral-400 mt-1 leading-relaxed">
                Te asesoramos directamente por WhatsApp para escoger el modelo ideal para ti.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-white tracking-tight">
              {STORE_SETTINGS.name}
            </span>
          </div>
          <p className="text-neutral-400 max-w-sm text-xs leading-relaxed">
            Reventa y distribución de audífonos 100% originales y accesorios tecnológicos. Entrega local el mismo día en Chimbote.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-neutral-300">
          <a href="#catalogo" className="hover:text-white transition-colors">
            Catálogo de Productos
          </a>
          <a href="#como-comprar" className="hover:text-white transition-colors">
            Cómo Comprar
          </a>
          <a href="#garantia" className="hover:text-white transition-colors">
            Políticas de Garantía
          </a>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold text-emerald-400"
          >
            <span>WhatsApp Directo</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Bottom Bar: Clean Legal */}
      <div className="border-t border-neutral-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
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
