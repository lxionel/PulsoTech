"use client";

import { useProducts } from "@/context/ProductsContext";
import { STORE_POLICIES } from "@/data/store-policies";
import type { ReactNode } from "react";

export function CommercialEmail({ subject, className, children }: { subject?: string; className?: string; children?: ReactNode }) {
  const { commerceSettings: config } = useProducts();
  const email = config.email || STORE_POLICIES.email;
  return <a href={`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`} className={className}>{children || email}</a>;
}

export function CommercialIdentity() {
  const { commerceSettings: config } = useProducts();
  const owner = config.owner || STORE_POLICIES.owner;
  const address = config.address || STORE_POLICIES.address;
  const email = config.email || STORE_POLICIES.email;
  const ruc = config.ruc || STORE_POLICIES.ruc;
  return <address className="not-italic text-sm leading-7 text-neutral-600"><span className="block font-semibold text-neutral-900">PulsoTech · {owner}</span>{address && <span className="block">{address}</span>}{ruc && <span className="block">RUC: {ruc}</span>}<a href={`mailto:${email}`} className="underline underline-offset-4 break-all">{email}</a>{config.hours && <span className="block">Atención: {config.hours}</span>}</address>;
}

export function CommercialDelivery() {
  const { commerceSettings: config } = useProducts();
  const entries = [["Zonas", config.deliveryArea], ["Costo", config.deliveryCost], ["Plazo", config.deliveryTime]].filter(([, value]) => value);
  if (!entries.length) return null;
  return <section className="space-y-3"><h2 className="text-lg font-extrabold">Condiciones de entrega</h2><dl className="divide-y divide-neutral-200">{entries.map(([label, value]) => <div key={label} className="grid sm:grid-cols-[100px_1fr] gap-1 py-3 text-sm leading-6"><dt className="font-semibold">{label}</dt><dd className="text-neutral-600 whitespace-pre-line">{value}</dd></div>)}</dl></section>;
}
