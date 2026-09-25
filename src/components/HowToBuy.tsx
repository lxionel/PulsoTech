"use client";

import React from "react";
import { ShieldCheck, Truck, PackageCheck, Zap, ArrowRight, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function HowToBuy() {
  const { whatsappNumber } = useCart();

  return (
    <section id="como-comprar" className="py-20 bg-[#f8fafc] border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>La Experiencia PulsoTech</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 tracking-tight leading-tight">
            Tecnología original con entrega segura y sin sorpresas
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xl mx-auto">
            Diseñamos una experiencia de compra local rápida, transparente y con cero riesgo para ti.
          </p>
        </div>

        {/* Modern Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
          {/* Bento Card 1: Featured Main Card (7 Cols) - Pago Contra Entrega Seguro */}
          <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-9 border border-neutral-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60 uppercase tracking-wide">
                  Cero Riesgo
                </span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                  Pago Contra Entrega: Verificas en mano antes de pagar
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg">
                  Tu confianza es lo más importante. Coordinamos el envío a tu dirección o punto de encuentro, recibes el dispositivo, compruebas que la caja esté sellada y recién realizas el pago.
                </p>
              </div>

              {/* Payment Methods Pill Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Yape
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Plin
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Efectivo exacto
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-500">
              <span>Coordinación directa y sin comisiones ocultas</span>
              <span className="text-neutral-900 font-bold flex items-center gap-1">
                Garantizado <Check className="w-4 h-4 text-emerald-600" />
              </span>
            </div>
          </div>

          {/* Bento Card 2: Entrega el Mismo Día (5 Cols) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-7 sm:p-9 border border-neutral-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200/60 uppercase tracking-wide">
                  Sin Esperas
                </span>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
                  Despacho Express el Mismo Día
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  No esperes semanas. Coordinamos por WhatsApp y programamos la entrega para hoy mismo en el horario que mejor te acomode.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-neutral-100 text-xs font-bold text-neutral-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Envíos activos hoy</span>
            </div>
          </div>

          {/* Bento Card 3: Caja Sellada & 100% Auténtico (5 Cols) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-7 sm:p-9 border border-neutral-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wide">
                  Auténtico
                </span>
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
                  <PackageCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
                  Caja Sellada de Fábrica
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Cero dispositivos de segunda o reacondicionados. Cada producto incluye precintos originales de fábrica y número de serie verificable.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-neutral-100 text-xs font-semibold text-neutral-500">
              Número de serie comprobable al recibir
            </div>
          </div>

          {/* Bento Card 4: Garantía Total y Asesoría Directa (7 Cols) */}
          <div className="md:col-span-7 bg-neutral-950 text-white rounded-3xl p-7 sm:p-9 border border-neutral-900 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-neutral-800 text-white text-xs font-bold uppercase tracking-wide border border-neutral-700">
                  Respaldo PulsoTech
                </span>
                <span className="text-xs font-bold text-neutral-400 font-mono">
                  Garantía Total
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Garantía Total de Funcionamiento
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-lg">
                  Si tu producto presenta cualquier inconveniente técnico de fábrica, cuentas con soporte inmediato y solución directa por WhatsApp. Sin trámites engorrosos.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-neutral-400 font-medium">
                ¿Deseas asesoría para elegir tu modelo ideal?
              </span>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "¡Hola PulsoTech! Deseo asesoría para elegir el modelo de audífonos adecuado para mí."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <span>Consultar por WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
