"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Headphones, Zap, ShieldCheck, Truck } from "lucide-react";
import ProductCatalog from "@/components/ProductCatalog";

/* ------------------------------------------------------------------ */
/* Configuracion por categoria: cada una tiene su propio hero y estilo */
/* ------------------------------------------------------------------ */
const CATEGORY_CONFIG: Record<
  string,
  {
    title: string;
    subtitle: string;
    accent: string;
    accentBg: string;
    gradientFrom: string;
    gradientVia: string;
    badges: { icon: React.ElementType; label: string }[];
    heroComponent: React.FC;
  }
> = {
  audifonos: {
    title: "Audifonos",
    subtitle:
      "Modelos originales en caja sellada. Sonido premium con la mejor calidad de audio para tu dia a dia.",
    accent: "text-blue-400",
    accentBg: "bg-blue-500",
    gradientFrom: "from-blue-950",
    gradientVia: "via-neutral-950",
    badges: [
      { icon: ShieldCheck, label: "Originales" },
      { icon: Zap, label: "Bluetooth 5.3" },
      { icon: Truck, label: "Entrega inmediata" },
    ],
    heroComponent: AudifonosHero,
  },
  cargadores: {
    title: "Cargadores portatiles",
    subtitle:
      "Powerbanks y cargadores de pared originales. Carga rapida y segura para todos tus dispositivos.",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500",
    gradientFrom: "from-emerald-950",
    gradientVia: "via-neutral-950",
    badges: [
      { icon: ShieldCheck, label: "Certificados" },
      { icon: Zap, label: "Carga rapida" },
      { icon: Truck, label: "Entrega inmediata" },
    ],
    heroComponent: CargadoresHero,
  },
};

/* Mapea el query string de la URL a la key del config */
function resolveConfigKey(categoria: string): string | null {
  const cat = categoria.toLowerCase();
  if (cat.includes("audífon") || cat.includes("audifon") || cat.includes("audio")) return "audifonos";
  if (cat.includes("cargador") || cat.includes("powerbank") || cat.includes("batería") || cat.includes("bateria")) return "cargadores";
  return null;
}

export default function ProductCatalogWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoria = searchParams.get("categoria") || "todos";

  const configKey = resolveConfigKey(categoria);
  const config = configKey ? CATEGORY_CONFIG[configKey] : null;

  const handleCategoryChange = (newCat: string) => {
    router.push(`/catalogo?categoria=${encodeURIComponent(newCat)}`, {
      scroll: false,
    });
  };

  return (
    <div>
      {/* Hero dedicado de la categoria */}
      {config ? (
        <section className="relative w-full overflow-hidden bg-neutral-950 select-none">
          {/* Fondo gradiente */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${config.gradientFrom} ${config.gradientVia} to-neutral-950 opacity-90`}
          />

          {/* Patron sutil de puntos */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16">
            {/* Breadcrumb de regreso */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-semibold mb-6 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Volver al inicio
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
              {/* Lado izquierdo: textos */}
              <div className="space-y-4 max-w-xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
                  {config.title}
                </h1>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-lg">
                  {config.subtitle}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {config.badges.map((badge) => (
                    <span
                      key={badge.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white/90 text-[11px] font-bold tracking-wide border border-white/5"
                    >
                      <badge.icon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lado derecho: ilustracion animada unica de la categoria */}
              <div className="hidden md:flex items-center justify-center lg:justify-end shrink-0">
                <config.heroComponent />
              </div>
            </div>
          </div>

          {/* Borde inferior con acento de color */}
          <div className={`h-1 w-full ${config.accentBg}`} />
        </section>
      ) : (
        /* Hero generico cuando no es una categoria especifica */
        <section className="relative w-full overflow-hidden bg-neutral-950 select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950 opacity-90" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-semibold mb-6 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Catalogo
            </h1>
            <p className="text-sm text-neutral-400 mt-2">
              Todos los productos disponibles en un solo lugar.
            </p>
          </div>
          <div className="h-1 w-full bg-neutral-800" />
        </section>
      )}

      {/* Catalogo de productos con el filtro aplicado */}
      <ProductCatalog
        externalSelectedCategory={categoria}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}

/* ================================================================== */
/* Ilustraciones SVG animadas unicas por categoria                    */
/* ================================================================== */

function AudifonosHero() {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center">
      {/* Anillo exterior pulsante */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ping" style={{ animationDuration: "3s" }} />
      <div className="absolute inset-3 rounded-full border border-blue-400/10" />

      {/* Circulos concentricos de "ondas de sonido" */}
      <div className="absolute inset-6 rounded-full border border-blue-300/10 animate-pulse" style={{ animationDuration: "2.5s" }} />

      {/* Circulo de fondo */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent" />

      {/* Icono central del audifono */}
      <svg
        viewBox="0 0 80 80"
        className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 relative z-10 drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diadema */}
        <path
          d="M 16 44 C 16 18, 27 8, 40 8 C 53 8, 64 18, 64 44"
          stroke="#60a5fa"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Pasadores */}
        <rect x="13" y="36" width="8" height="8" rx="2" fill="#93bbfc" />
        <rect x="59" y="36" width="8" height="8" rx="2" fill="#93bbfc" />
        {/* Almohadilla izquierda */}
        <rect x="10" y="40" width="14" height="26" rx="6" fill="#60a5fa" />
        <rect x="17" y="44" width="4" height="18" rx="2" fill="#1e3a5f" opacity="0.4" />
        {/* Almohadilla derecha */}
        <rect x="56" y="40" width="14" height="26" rx="6" fill="#60a5fa" />
        <rect x="59" y="44" width="4" height="18" rx="2" fill="#1e3a5f" opacity="0.4" />
      </svg>

      {/* Particulas flotantes */}
      <div className="absolute top-4 right-6 w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-bounce" style={{ animationDuration: "2s", animationDelay: "0s" }} />
      <div className="absolute bottom-10 left-4 w-1 h-1 rounded-full bg-blue-300/30 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
      <div className="absolute top-14 left-2 w-1.5 h-1.5 rounded-full bg-blue-400/20 animate-bounce" style={{ animationDuration: "3s", animationDelay: "1s" }} />
    </div>
  );
}

function CargadoresHero() {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center">
      {/* Anillo exterior */}
      <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping" style={{ animationDuration: "3s" }} />
      <div className="absolute inset-3 rounded-full border border-emerald-400/10" />

      {/* Brillo central */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent" />

      {/* Icono del cargador */}
      <svg
        viewBox="0 0 80 80"
        className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 relative z-10 drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cuerpo de la bateria */}
        <rect x="18" y="14" width="28" height="52" rx="7" fill="#34d399" opacity="0.9" />
        {/* Conectores superiores */}
        <rect x="22" y="10" width="7" height="4" rx="1" fill="#6ee7b7" />
        <rect x="35" y="10" width="7" height="4" rx="1" fill="#6ee7b7" />
        {/* Rayo */}
        <path d="M 34 26 L 26 39 L 32 39 L 30 52 L 40 37 L 33 37 Z" fill="#064e3b" opacity="0.5" />
        {/* LEDs */}
        <circle cx="23" cy="20" r="1.5" fill="#ecfdf5" />
        <circle cx="28" cy="20" r="1.5" fill="#ecfdf5" />
        <circle cx="33" cy="20" r="1.5" fill="#ecfdf5" />
        <circle cx="38" cy="20" r="1.5" fill="#ecfdf5" />
        {/* Cubo cargador */}
        <rect x="52" y="34" width="16" height="20" rx="4" fill="#34d399" opacity="0.9" />
        <rect x="55" y="54" width="2.5" height="6" rx="1" fill="#6ee7b7" />
        <rect x="61.5" y="54" width="2.5" height="6" rx="1" fill="#6ee7b7" />
        <rect x="56" y="42" width="8" height="3" rx="1" fill="#064e3b" opacity="0.4" />
      </svg>

      {/* Particulas */}
      <div className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-bounce" style={{ animationDuration: "2s" }} />
      <div className="absolute bottom-8 left-6 w-1 h-1 rounded-full bg-emerald-300/30 animate-bounce" style={{ animationDuration: "2.8s", animationDelay: "0.3s" }} />
    </div>
  );
}
