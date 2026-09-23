"use client";

import React from "react";
import Link from "next/link";
import { Headphones, Zap, Watch, ShieldCheck, ArrowRight, MessageSquare, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function HeroSection() {
  const { whatsappNumber } = useCart();

  const categories = [
    {
      icon: Headphones,
      title: "Audífonos Inalámbricos",
      subtitle: "Modelos originales Xiaomi/Redmi sellados",
      status: "Disponible Hoy",
      statusColor: "bg-blue-950/60 text-blue-400 border-blue-800/60",
      active: true,
      href: "#catalogo",
    },
    {
      icon: Zap,
      title: "Cargadores & Cables GaN",
      subtitle: "Carga rápida inteligente multiespecificaciones",
      status: "Próximamente",
      statusColor: "bg-neutral-800/70 text-neutral-400 border-neutral-700",
      active: false,
      href: "#",
    },
    {
      icon: Watch,
      title: "Smartwatches & Pulseras",
      subtitle: "Monitoreo deportivo, llamadas y salud",
      status: "Próximamente",
      statusColor: "bg-neutral-800/70 text-neutral-400 border-neutral-700",
      active: false,
      href: "#",
    },
    {
      icon: ShieldCheck,
      title: "Garantía & Entrega Local",
      subtitle: "Mismo día en Chimbote con pago al recibir",
      status: "100% Confiable",
      statusColor: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
      active: false,
      href: "#garantia",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#09090b] pt-8 pb-12 md:pt-12 md:pb-16 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Banner Hero */}
        <div className="rounded-3xl bg-[#121216] border border-neutral-800 text-white p-8 sm:p-12 md:p-14 relative overflow-hidden shadow-2xl mb-10">
          {/* Subtle glow accent */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-24 w-80 h-80 bg-neutral-800/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-5">
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Tecnología, audio y accesorios originales.
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
              En <strong className="text-white">PulsoTech</strong> seleccionamos dispositivos garantizados en caja sellada de fábrica. Comienza explorando nuestro catálogo de audífonos con entrega el mismo día y pago seguro contra entrega en Chimbote.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#catalogo"
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                <span>Ver Catálogo Disponible</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "¡Hola PulsoTech! Deseo consultar sobre los productos disponibles y entregas en Chimbote."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Pedir por WhatsApp</span>
              </a>
            </div>

            {/* Value checklist */}
            <div className="pt-2 flex flex-wrap gap-y-2 gap-x-6 text-xs text-neutral-300 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Empaque sellado de fábrica</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Entrega hoy en Chimbote</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Efectivo o Yape al recibir</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid (Retail Structure) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Departamentos & Categorías
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              Lanzamiento inicial en Chimbote
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <a
                  key={index}
                  href={cat.href}
                  className={`group p-5 rounded-2xl border transition-all flex flex-col justify-between bg-[#121216] ${
                    cat.active
                      ? "border-blue-600/50 hover:border-blue-500 shadow-md cursor-pointer"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          cat.active ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cat.statusColor}`}
                      >
                        {cat.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  {cat.active && (
                    <div className="pt-3 border-t border-neutral-800/80 mt-3 flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:gap-1.5 transition-all">
                      <span>Explorar modelos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
