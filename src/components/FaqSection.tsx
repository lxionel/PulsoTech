"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "¿Cómo funciona el pago contra entrega en Chimbote?",
      answer:
        "Coordinamos la entrega a tu dirección o punto de encuentro en Chimbote. Una vez que tienes el producto en mano y verificas su caja sellada, realizas el pago en efectivo o mediante transferencia digital inmediata (Yape o Plin).",
    },
    {
      question: "¿Los productos son originales y vienen en caja sellada?",
      answer:
        "Totalmente. Solo comercializamos audífonos 100% auténticos y nuevos en sus cajas selladas de fábrica con números de serie comprobables.",
    },
    {
      question: "¿Cuánto demora en llegar mi pedido?",
      answer:
        "Las entregas locales en Chimbote se realizan el mismo día de la coordinación. Acordamos contigo el horario que más te convenga para recibirlo.",
    },
    {
      question: "¿Cuentan con garantía ante fallas?",
      answer:
        "Sí, todos nuestros modelos cuentan con garantía de funcionamiento ante cualquier defecto técnico o de fábrica, respaldada con atención directa por WhatsApp.",
    },
  ];

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Preguntas Frecuentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Resolvemos tus dudas antes de comprar
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Transparencia total sobre nuestras entregas locales y formas de pago.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-neutral-200/80 rounded-2xl overflow-hidden transition-all bg-[#fbfbfd]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-neutral-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200/70">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
