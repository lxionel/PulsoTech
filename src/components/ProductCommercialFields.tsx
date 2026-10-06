"use client";

import type { ProductCommerce } from "@/lib/commerce";

export default function ProductCommercialFields({ value, onChange }: { value: ProductCommerce; onChange: (next: ProductCommerce) => void }) {
  return <fieldset className="rounded-xl border border-neutral-200 p-4 space-y-4">
    <legend className="px-2 text-sm font-semibold">Publicación y condiciones</legend>
    <label className="block text-xs font-medium">Estado
      <select value={value.status} onChange={e => onChange({ ...value, status: e.target.value as ProductCommerce["status"] })} className="mt-2 w-full min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm">
        <option value="draft">Borrador · oculto en la tienda</option>
        <option value="demo">Demostración · datos de prueba</option>
        <option value="live">Producto real · listo para vender</option>
      </select>
    </label>
    <p className="text-xs leading-5 text-neutral-500">En preparación puedes mostrar productos reales y de prueba. Al abrir ventas, solo se mostrarán productos reales verificados. Los productos existentes se consideran de demostración hasta que revises su información.</p>
    {([{ key: "warranty", label: "Garantía", hint: "Plazo, cobertura y cómo solicitar atención" }, { key: "included", label: "Contenido de la caja", hint: "Producto y accesorios incluidos" }, { key: "delivery", label: "Entrega particular de este producto (opcional)", hint: "Solo si difiere de la entrega general" }] as const).map(field => <label key={field.key} className="block text-xs font-medium">{field.label}<textarea maxLength={1000} rows={2} value={value[field.key]} placeholder={field.hint} onChange={e => onChange({ ...value, [field.key]: e.target.value })} className="mt-2 w-full rounded-lg border border-neutral-300 p-3 text-sm font-normal" /></label>)}
    <label className="flex items-start gap-3 text-xs leading-5"><input type="checkbox" checked={value.verified} onChange={e => onChange({ ...value, verified: e.target.checked })} className="mt-1 accent-black" /><span>Revisé marca, modelo, características, precio, fotografías y condiciones. Corresponden al producto que entregaré.</span></label>
  </fieldset>;
}
