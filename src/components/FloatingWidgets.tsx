"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function FloatingWidgets() {
  const { whatsappNumber } = useCart();

  return (
    <>
      {/* Right Edge Social Icons (Despegatec Style) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col shadow-md rounded-l-lg overflow-hidden">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="w-10 h-10 bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center transition-colors text-xs font-bold"
        >
          f
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="w-10 h-10 bg-[#e4405f] hover:bg-[#c13584] text-white flex items-center justify-center transition-colors text-xs font-bold"
        >
          ig
        </a>
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="w-10 h-10 bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-colors text-xs font-bold"
        >
          tk
        </a>
      </div>

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
