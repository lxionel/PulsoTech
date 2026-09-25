"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function FaqSection() {
  const { whatsappNumber } = useCart();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "¿Cómo funciona el pago contra entrega?",
      answer:
        "Coordinamos la entrega a tu domicilio o punto de encuentro. Cuando recibes el paquete y constatas que está en perfecto estado y con caja sellada de fábrica, realizas el pago en efectivo o transferencia inmediata por Yape / Plin.",
    },
    {
      question: "¿Los productos son 100% originales y nuevos?",
      answer:
        "Sí. Todos nuestros dispositivos son completamente originales, nuevos y sellados de fábrica con precintos intactos y números de serie oficiales comprobables.",
    },
    {
      question: "¿En cuánto tiempo llega mi pedido?",
      answer:
        "Entregamos el mismo día de la coordinación. Al escribirnos a WhatsApp, pactamos el horario exacto que mejor se acomode a tus tiempos.",
    },
    {
      question: "¿Qué cubre la Garantía Total?",
      answer:
        "Cubre cualquier falla de funcionamiento técnico o defecto de fábrica. Nos contactas directamente por WhatsApp y gestionamos la solución o cambio de inmediato sin trámites complicados.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white border-t border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Heading & Contact Help Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-neutral-700" />
                <span>Preguntas Frecuentes</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 tracking-tight leading-tight">
                Resolvemos tus dudas antes de ordenar
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Transparencia total en cada entrega. Si tienes una consulta específica, nuestro equipo te atiende de inmediato.
              </p>
            </div>

            {/* Direct WhatsApp Concierge Card */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">¿Pregunta no resuelta?</h4>
                  <p className="text-xs text-neutral-500">Chatea directo con nosotros</p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Escríbenos para consultar stock en tiempo real, solicitar fotos adicionales o coordinar tu entrega personalizada.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "¡Hola PulsoTech! Tengo una consulta sobre sus productos y entregas."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 transition-colors pt-1 cursor-pointer"
              >
                <span>Escribir por WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Modern Accordion Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen
                      ? "border-neutral-900 bg-neutral-50/50 shadow-xs"
                      : "border-neutral-200/80 bg-white hover:border-neutral-300"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-950 transition-colors cursor-pointer select-none"
                  >
                    <span>{faq.question}</span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                        isOpen ? "bg-neutral-950 text-white rotate-180" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
