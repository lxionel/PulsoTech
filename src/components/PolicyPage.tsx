import Link from "next/link";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { STORE_POLICIES } from "@/data/store-policies";
import { CommercialIdentity } from "./CommercialInformation";

const pages = [
  { href: "/terminos/", label: "Términos" },
  { href: "/garantia-y-entregas/", label: "Garantía, entregas y cambios" },
  { href: "/privacidad/", label: "Privacidad" },
  { href: "/reclamaciones/", label: "Atención y reclamos" },
];

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3"><h2 className="text-lg font-extrabold text-neutral-950 tracking-tight">{title}</h2><div className="space-y-3 text-sm leading-7 text-neutral-600">{children}</div></section>;
}

export function PolicyIdentity() {
  return <CommercialIdentity />;
}

export default function PolicyPage({ title, intro, current, children }: { title: string; intro: string; current: string; children: ReactNode }) {
  return <div className="min-h-screen flex flex-col bg-[#fbfbfd]">
    <Navbar />
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-10 pb-16">
      <Link href="/#inicio" className="inline-flex min-h-11 items-center text-xs font-semibold text-neutral-500 hover:text-neutral-950">← Volver a la tienda</Link>
      <header className="mt-3 mb-7 space-y-3 max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">PulsoTech · Información de la tienda</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 leading-tight">{title}</h1>
        <p className="text-sm text-neutral-600 leading-7">{intro}</p>
        <p className="text-xs text-neutral-400">Actualización: {STORE_POLICIES.updatedAt}</p>
      </header>
      <nav aria-label="Políticas de la tienda" className="flex flex-wrap gap-2 mb-8">
        {pages.map((page) => <Link key={page.href} href={page.href} aria-current={current === page.href ? "page" : undefined} className={`inline-flex items-center min-h-11 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${current === page.href ? "bg-neutral-950 text-white border-neutral-950" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-500"}`}>{page.label}</Link>)}
      </nav>
      <article className="rounded-2xl sm:rounded-3xl bg-white border border-neutral-200 p-5 sm:p-9 space-y-8 shadow-xs">{children}</article>
    </main>
    <Footer />
  </div>;
}
