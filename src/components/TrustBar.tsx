"use client";

import React from "react";
import { Truck, ShieldCheck, Banknote, MessageSquare } from "lucide-react";

export default function TrustBar() {
  const perks = [
    {
      icon: Truck,
      title: "Entrega el Mismo Día",
      description: "Delivery directo y puntual a tu dirección",
    },
    {
      icon: Banknote,
      title: "Pago Contra Entrega",
      description: "Paga con Efectivo o Yape al recibir",
    },
    {
      icon: ShieldCheck,
      title: "100% Originales",
      description: "Empaque sellado y garantía de funcionamiento",
    },
    {
      icon: MessageSquare,
      title: "Atención Inmediata",
      description: "Respuesta rápida y pedidos por WhatsApp",
    },
  ];

  return (
    <section className="border-y border-neutral-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {perks.map((perk, index) => {
            const Icon = perk.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-800">
                  <Icon className="w-5 h-5 text-neutral-900" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                    {perk.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 leading-tight truncate sm:whitespace-normal">
                    {perk.description}
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
