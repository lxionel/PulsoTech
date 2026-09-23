"use client";

import React from "react";
import { Search, MessageSquare, CheckCircle } from "lucide-react";

export default function HowToBuy() {
  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Elige tu modelo",
      description:
        "Explora nuestro catálogo con especificaciones reales de batería, cancelación de ruido y precios finales sin sorpresas.",
    },
    {
      step: "02",
      icon: MessageSquare,
      title: "Coordina tu entrega",
      description:
        "Agrégalo a tu bolsa en la web o escríbenos directamente a WhatsApp indicando tu dirección en Chimbote.",
    },
    {
      step: "03",
      icon: CheckCircle,
      title: "Recibe y paga seguro",
      description:
        "Te lo entregamos el mismo día. Verificas el empaque sellado y pagas cómodamente contra entrega con Efectivo o Yape.",
    },
  ];

  return (
    <section id="como-comprar" className="py-16 bg-[#f4f4f7] border-y border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
            Proceso Simple y Confiable
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 tracking-tight">
            ¿Cómo comprar en PulsoTech?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Comprar audífonos originales en Chimbote nunca fue tan rápido y transparente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-extrabold font-mono text-neutral-300">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                      <Icon className="w-5 h-5 text-neutral-900" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-neutral-950 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
