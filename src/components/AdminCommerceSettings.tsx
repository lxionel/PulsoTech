"use client";

import { useRef, useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { commerceRequirements, isStorefrontProduct, type CommerceSettings } from "@/lib/commerce";
import { COMPLAINT_BOOK_ENABLED } from "@/data/store-policies";
import SettingsSwitch from "./SettingsSwitch";

export default function AdminCommerceSettings() {
  const { commerceSettings, saveCommerceSettings, commerceReady, products } = useProducts();
  const [draft, setDraft] = useState<CommerceSettings | null>(null);
  const config = draft ?? commerceSettings;
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [notice, setNotice] = useState("");
  const missing = commerceRequirements(config);
  const complaintsReady = COMPLAINT_BOOK_ENABLED && config.ruc === process.env.NEXT_PUBLIC_STORE_RUC?.trim();
  const visibleCount = products.filter(isStorefrontProduct).length;
  const fields = [
    { key: "owner", label: "Responsable o razón social" }, { key: "ruc", label: "RUC" },
    { key: "address", label: "Dirección del negocio" }, { key: "email", label: "Correo de atención" },
    { key: "hours", label: "Horario de atención" }, { key: "deliveryArea", label: "Zonas de entrega" },
    { key: "deliveryCost", label: "Costo de entrega o forma de calcularlo" }, { key: "deliveryTime", label: "Plazo de entrega" },
  ] as const;
  return <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
    <div className="mb-6 border-b border-neutral-200 pb-5"><h3 className="text-xl font-semibold">Tienda y pedidos</h3><p className="mt-2 text-sm leading-6 text-neutral-600">Información de atención, entrega y recepción de pedidos.</p></div>
    {!commerceReady && <p role="status" className="mb-5 rounded-lg border border-neutral-300 bg-neutral-50 p-4 text-sm leading-6">Activa los ajustes comerciales en Supabase para guardar estos datos y controlar la visibilidad de los productos.</p>}
    <form onSubmit={async e => { e.preventDefault(); if (submitting.current) return; submitting.current = true; setSaving(true); setNotice(""); try { await saveCommerceSettings(config); setDraft(null); setNotice("Información guardada."); } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo guardar."); } finally { submitting.current = false; setSaving(false); } }}>
      <div className="grid gap-4 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="text-sm font-medium">{field.label}<input disabled={saving} type={field.key === "email" ? "email" : "text"} inputMode={field.key === "ruc" ? "numeric" : undefined} maxLength={field.key === "ruc" ? 11 : 300} value={config[field.key]} onChange={e => setDraft({ ...config, [field.key]: e.target.value })} className="mt-2 w-full min-h-11 rounded-lg border border-neutral-300 px-3 font-normal" /></label>)}</div>
      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div><label htmlFor="store-orders-enabled" className="text-sm font-semibold">Recibir pedidos por WhatsApp</label><p className="mt-1 text-xs leading-5 text-neutral-500">{config.ordersEnabled ? "Los clientes pueden continuar con su pedido." : "El catálogo y la bolsa siguen disponibles; el envío del pedido está pausado."}</p></div>
        <SettingsSwitch id="store-orders-enabled" label="Recibir pedidos por WhatsApp" checked={config.ordersEnabled} disabled={saving || !commerceReady || (!config.ordersEnabled && (missing.length > 0 || !complaintsReady))} onChange={ordersEnabled => setDraft({ ...config, ordersEnabled })} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4"><button disabled={saving || !commerceReady} className="min-h-11 rounded-lg bg-black px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar información"}</button><p role="status" className="text-sm text-neutral-600">{notice}</p></div>
    </form>
    <details className="mt-7 border-t border-neutral-200 pt-5" open={missing.length > 0 || !complaintsReady}><summary className="cursor-pointer text-sm font-semibold min-h-11">Información pendiente para recibir pedidos</summary><ul className="mt-3 space-y-2 text-sm text-neutral-600">
      {missing.map(item => <li key={item}>Pendiente: {item}.</li>)}
      <li>{visibleCount} {visibleCount === 1 ? "producto visible" : "productos visibles"} en la tienda. Revisa fotografías, características y garantía antes de vender.</li>
      <li>{complaintsReady ? "Libro de Reclamaciones habilitado." : "Pendiente: habilitar y probar el Libro de Reclamaciones con los datos del negocio."}</li>
      <li>Verificar dominio, correo, políticas, fotografías y redes del negocio.</li>
      <li>Probar una compra completa en celular y escritorio, confirmar stock y recuperar un respaldo.</li>
    </ul></details>
  </section>;
}
