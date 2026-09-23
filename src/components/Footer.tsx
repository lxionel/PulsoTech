"use client";

import React from "react";
import { STORE_SETTINGS } from "@/data/products";
import { ShieldCheck, Truck, Headphones, MessageSquare, ArrowUpRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Footer() {
  const { whatsappNumber } = useCart();

  return (
    <footer id="garantia" className="border-t border-neutral-200 bg-white text-neutral-600 text-xs">
      {/* Guarantees bar */}
      <div className="border-b border-neutral-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 text-sm">Garantía PulsoTech</h4>
              <p className="text-neutral-500 mt-1 leading-relaxed">
                Productos 100% originales con garantía ante cualquier falla técnica.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 text-sm">Entrega el Mismo Día</h4>
              <p className="text-neutral-500 mt-1 leading-relaxed">
                Entrega puntual con coordinación inmediata por WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 text-sm">Originales Garantizados</h4>
              <p className="text-neutral-500 mt-1 leading-relaxed">
                Empaque sellado de fábrica con verificación auténtica y números de serie.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 text-sm">Asesoría Personalizada</h4>
              <p className="text-neutral-500 mt-1 leading-relaxed">
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
            <span className="text-base font-extrabold text-neutral-950 tracking-tight">
              {STORE_SETTINGS.name}
            </span>
          </div>
          <p className="text-neutral-500 max-w-sm text-xs leading-relaxed">
            Distribución de tecnología, audífonos 100% originales y accesorios garantizados. Entrega el mismo día y pago seguro contra entrega.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-neutral-600">
          <a href="#catalogo" className="hover:text-black transition-colors">
            Catálogo de Productos
          </a>
          <a href="#como-comprar" className="hover:text-black transition-colors">
            Cómo Comprar
          </a>
          <a href="#garantia" className="hover:text-black transition-colors">
            Políticas de Garantía
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
