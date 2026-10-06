"use client";

import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { commerceRequirements, productCommerce, productRequirements, STORE_MODE, type CommerceSettings } from "@/lib/commerce";
import { COMPLAINT_BOOK_ENABLED } from "@/data/store-policies";

export default function AdminCommerceSettings() {
  const { commerceSettings, saveCommerceSettings, commerceReady, products } = useProducts();
  const [draft, setDraft] = useState<CommerceSettings | null>(null);
  const config = draft ?? commerceSettings;
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const missing = commerceRequirements(config);
  const real = products.filter(p => productCommerce(p).status === "live");
  const ready = real.filter(p => productRequirements(p).length === 0);
  const fields = [
    { key: "owner", label: "Responsable o razón social" }, { key: "ruc", label: "RUC" },
    { key: "address", label: "Dirección del negocio" }, { key: "email", label: "Correo de atención" },
    { key: "hours", label: "Horario de atención" }, { key: "deliveryArea", label: "Zonas de entrega" },
    { key: "deliveryCost", label: "Costo de entrega o forma de calcularlo" }, { key: "deliveryTime", label: "Plazo de entrega" },
  ] as const;
  return <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
    <div className="mb-6 border-b border-neutral-200 pb-5"><h3 className="text-xl font-semibold">Preparación comercial</h3><p className="mt-2 text-sm leading-6 text-neutral-600">Completa la información a medida que definas tu operación. El sitio está en modo <strong>{STORE_MODE === "live" ? "ventas" : "preparación"}</strong>; cambiar a ventas requiere revisar los pendientes y volver a publicar.</p></div>
    {!commerceReady && <p role="status" className="mb-5 rounded-lg border border-neutral-300 bg-neutral-50 p-4 text-sm leading-6">Falta activar la migración comercial en Supabase. Hasta entonces no se pueden guardar borradores ni estos ajustes; la protección debe estar activa también en la base de datos.</p>}
    <form onSubmit={async e => { e.preventDefault(); if (saving) return; setSaving(true); setNotice(""); try { await saveCommerceSettings(config); setDraft(null); setNotice("Información guardada."); } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo guardar."); } finally { setSaving(false); } }}>
      <div className="grid gap-4 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="text-sm font-medium">{field.label}<input type={field.key === "email" ? "email" : "text"} inputMode={field.key === "ruc" ? "numeric" : undefined} maxLength={field.key === "ruc" ? 11 : 300} value={config[field.key]} onChange={e => setDraft({ ...config, [field.key]: e.target.value })} className="mt-2 w-full min-h-11 rounded-lg border border-neutral-300 px-3 font-normal" /></label>)}</div>
      <label className="mt-5 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={config.ordersEnabled} disabled={STORE_MODE !== "live" || missing.length > 0 || !COMPLAINT_BOOK_ENABLED} onChange={e => setDraft({ ...config, ordersEnabled: e.target.checked })} className="mt-1 accent-black" /><span>Habilitar solicitudes de compra por WhatsApp. Requiere publicación en modo ventas, datos comerciales completos y Libro de Reclamaciones habilitado.</span></label>
      <div className="mt-5 flex flex-wrap items-center gap-4"><button disabled={saving || !commerceReady} className="min-h-11 rounded-lg bg-black px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar información"}</button><p role="status" className="text-sm text-neutral-600">{notice}</p></div>
    </form>
    <div className="mt-7 border-t border-neutral-200 pt-5"><h4 className="text-sm font-semibold">Antes de abrir ventas</h4><ul className="mt-3 space-y-2 text-sm text-neutral-600">
      {missing.map(item => <li key={item}>Pendiente: {item}.</li>)}
      <li>{ready.length} de {real.length} productos reales cumplen la revisión de publicación.</li>
      <li>{COMPLAINT_BOOK_ENABLED ? "Libro de Reclamaciones habilitado." : "Pendiente: habilitar y probar el Libro de Reclamaciones con el RUC real."}</li>
      <li>Verificar dominio, correo, políticas, fotografías y redes del negocio.</li>
      <li>Probar una compra completa en celular y escritorio, confirmar stock y recuperar un respaldo.</li>
      <li>Configurar NEXT_PUBLIC_STORE_MODE=live y volver a publicar únicamente cuando todo esté listo.</li>
    </ul></div>
  </section>;
}
