"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function FloatingWidgets() {
  const { whatsappNumber } = useCart();

  return (
    <>
      {/* Floating WhatsApp Action Button (Despegatec Style) */}
      <aside aria-label="Contacto por WhatsApp" className="fixed bottom-6 right-6 z-50">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            "¡Hola PulsoTech! Deseo consultar sobre los audífonos y productos disponibles."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="group relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          {/* Notification Ping Badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>

          <MessageSquare className="w-7 h-7 fill-white text-white" />

          {/* Tooltip on hover */}
          <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            ¿Deseas ayuda? Escríbenos
          </span>
        </a>
      </aside>
    </>
  );
}
