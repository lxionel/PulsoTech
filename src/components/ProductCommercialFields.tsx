"use client";

import type { ProductCommerce } from "@/lib/commerce";
import SettingsSwitch from "./SettingsSwitch";

export default function ProductCommercialFields({ value, onChange }: { value: ProductCommerce; onChange: (next: ProductCommerce) => void }) {
  return <fieldset className="rounded-xl border border-neutral-200 p-4 space-y-4">
    <legend className="px-2 text-sm font-semibold">Visibilidad y condiciones</legend>
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-4">
      <div><label htmlFor="product-visible" className="text-sm font-semibold">Visible en la tienda</label><p className="mt-1 text-xs leading-5 text-neutral-500">Desactívalo para ocultar este producto mientras lo editas.</p></div>
      <SettingsSwitch id="product-visible" label="Visible en la tienda" checked={value.visible} onChange={visible => onChange({ ...value, visible })} />
    </div>
    {([{ key: "warranty", label: "Garantía", hint: "Plazo, cobertura y cómo solicitar atención" }, { key: "included", label: "Contenido de la caja", hint: "Producto y accesorios incluidos" }, { key: "delivery", label: "Entrega particular de este producto (opcional)", hint: "Solo si difiere de la entrega general" }] as const).map(field => <label key={field.key} className="block text-xs font-medium">{field.label}<textarea maxLength={1000} rows={2} value={value[field.key]} placeholder={field.hint} onChange={e => onChange({ ...value, [field.key]: e.target.value })} className="mt-2 w-full rounded-lg border border-neutral-300 p-3 text-sm font-normal" /></label>)}
  </fieldset>;
}
