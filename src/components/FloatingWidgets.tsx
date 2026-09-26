"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function FloatingWidgets() {
  const pathname = usePathname();
  const { whatsappNumber } = useCart();

  // No mostrar el botón flotante de atención al cliente dentro del panel de administración
  if (
    (pathname && pathname.includes("Lionel260606")) ||
    (typeof window !== "undefined" && window.location.pathname.includes("Lionel260606"))
  ) {
    return null;
  }

  return (
    <aside aria-label="Contacto oficial por WhatsApp" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          "¡Hola PulsoTech! Deseo consultar sobre los audífonos y productos disponibles."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Atención personalizada por WhatsApp"
        className="group flex items-center gap-2.5 sm:gap-3 p-3 sm:px-4 sm:py-3.5 rounded-full bg-[#15803d] hover:bg-[#166534] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        title="Chatea con PulsoTech por WhatsApp"
      >
        {/* Official WhatsApp Vector Logo */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className="w-6 h-6 sm:w-6.5 sm:h-6.5 fill-current text-white"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.33 7.04 9.14 7.04 8.97 7.05C8.77 7.06 8.5 7.14 8.28 7.38C8.05 7.63 7.42 8.22 7.42 9.43C7.42 10.64 8.3 11.81 8.43 11.98C8.55 12.15 10.15 14.63 12.61 15.69C13.2 15.94 13.65 16.09 14.01 16.21C14.6 16.4 15.13 16.37 15.55 16.31C16.03 16.24 17.02 15.71 17.23 15.13C17.43 14.55 17.43 14.05 17.37 13.95C17.31 13.85 17.16 13.79 16.94 13.68C16.71 13.57 15.62 13.03 15.42 12.96C15.22 12.88 15.07 12.84 14.92 13.07C14.77 13.3 14.35 13.79 14.22 13.94C14.1 14.09 13.97 14.11 13.75 14C13.52 13.89 12.59 13.58 11.48 12.59C10.62 11.82 10.04 10.87 9.93 10.64C9.81 10.42 9.92 10.29 10.03 10.18C10.14 10.07 10.27 9.89 10.39 9.75C10.5 9.61 10.55 9.5 10.62 9.35C10.7 9.2 10.66 9.07 10.6 8.96C10.55 8.85 10.09 7.72 9.9 7.26C9.72 6.81 9.53 6.87 9.4 6.86L8.97 6.86C8.83 6.86 9.53 7.03 9.53 7.03Z" />
          </svg>
          {/* Subtle online beacon */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-200 rounded-full border-2 border-[#15803d]" />
        </div>

        {/* Clean text badge on desktop */}
        <div className="hidden sm:flex flex-col text-left pr-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 leading-none">
            Asesoría Online
          </span>
          <span className="text-xs font-black text-white tracking-tight leading-tight mt-0.5">
            ¿Dudas? Chatea aquí
          </span>
        </div>
      </a>
    </aside>
  );
}
