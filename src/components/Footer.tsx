"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { STORE_SETTINGS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { STORE_MODE } from "@/lib/commerce";
import { COMPLAINT_BOOK_ENABLED } from "@/data/store-policies";
import Logo from "./Logo";
import SocialIcon from "./SocialIcon";

const sections = [
  {
    title: "Tienda",
    links: [
      { label: "Catálogo", href: "/#catalogo" },
      { label: "Audífonos", href: "/catalogo/?categoria=aud%C3%ADfonos#seccion-categoria" },
      { label: "Mis favoritos", href: "/favoritos/" },
      { label: "Mi bolsa", href: "/bolsa/" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Garantía y entregas", href: "/garantia-y-entregas/" },
      { label: COMPLAINT_BOOK_ENABLED ? "Libro de Reclamaciones" : "Atención y reclamos", href: "/reclamaciones/" },
    ],
  },
  {
    title: "Información",
    links: [
      { label: "Privacidad", href: "/privacidad/" },
      { label: "Términos y condiciones", href: "/terminos/" },
    ],
  },
];

const networks = [
  { name: "instagram", label: "Instagram" },
  { name: "tiktok", label: "TikTok" },
  { name: "facebook", label: "Facebook" },
] as const;

export default function Footer() {
  const { whatsappNumber } = useCart();
  const { commerceSettings } = useProducts();
  const footerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const whatsapp = `https://wa.me/${(whatsappNumber || "").replace(/\D/g, "")}`;

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} id="garantia" data-in-view={inView} className="store-footer bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-white/20 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-10">
          <div>
            <Logo size="lg" inverted className="w-fit" />
            <p className="mt-3 text-sm leading-relaxed">Chimbote, Perú</p>
            {commerceSettings.owner && <p className="mt-2 text-xs leading-6">{commerceSettings.owner}{commerceSettings.ruc && <> · RUC {commerceSettings.ruc}</>}</p>}
            {STORE_MODE === "preparation" && <p className="mt-2 text-xs leading-6 text-white/70">Tienda en preparación · Apertura prevista para 2027</p>}
          </div>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-fit items-center justify-center gap-5 rounded-lg border border-white px-5 py-3 text-sm font-semibold transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            Contactar por WhatsApp <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[1fr_3fr] lg:gap-16">
          <div className="order-last border-t border-white/20 pt-6 lg:order-first lg:border-0 lg:pt-0">
            <h2 className="text-sm font-semibold">Síguenos</h2>
            <nav aria-label="Redes sociales de PulsoTech" className="mt-3 flex items-center gap-2">
              {networks.map((network) => (
                <a key={network.name} href={STORE_SETTINGS.social[network.name]} target="_blank" rel="noopener noreferrer" aria-label={`${network.label} de PulsoTech`} title={network.label} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  <SocialIcon network={network.name} className="h-[18px] w-[18px]" />
                </a>
              ))}
            </nav>
          </div>
          <nav aria-label="Enlaces del pie de página" className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 sm:gap-8">
            {sections.map((section) => (
              <div key={section.title} className={section.title === "Información" ? "col-span-2 border-t border-white/20 pt-5 sm:col-span-1 sm:border-0 sm:pt-0" : ""}>
                <h2 className="mb-2 text-sm font-semibold">{section.title}</h2>
                <ul className={section.title === "Información" ? "flex flex-wrap gap-x-6 sm:block" : ""}>
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="inline-flex min-h-11 items-center py-2 text-[13px] leading-relaxed underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/20 py-5 text-xs leading-relaxed sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p>© {new Date().getFullYear()} {STORE_SETTINGS.name}. Todos los derechos reservados.</p>
          <span>Perú</span>
        </div>
      </div>
    </footer>
  );
}
