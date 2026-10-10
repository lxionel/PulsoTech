"use client";
import type { ProductQuestion } from "@/lib/product-faq";
import { Plus, Trash2 } from "lucide-react";

export default function ProductFaqEditor({ value, onChange }: { value: ProductQuestion[]; onChange: (value: ProductQuestion[]) => void }) {
  const update = (index: number, field: keyof ProductQuestion, text: string) => onChange(value.map((row, i) => i === index ? { ...row, [field]: text } : row));
  return <section className="border-t border-neutral-200 pt-4 space-y-3">
    <div><h3 className="text-xs font-bold">Preguntas del producto</h3><p className="text-xs text-neutral-500 mt-1">Publica solo respuestas confirmadas sobre compatibilidad, uso o contenido.</p></div>
    {value.map((row, index) => <div key={index} className="rounded-xl border border-neutral-200 p-3 space-y-2">
      <div className="flex gap-2"><input aria-label={`Pregunta ${index + 1}`} maxLength={200} value={row.question} onChange={(event) => update(index, "question", event.target.value)} placeholder="Pregunta" className="flex-1 min-w-0 rounded-lg border border-neutral-200 p-2 text-xs" /><button type="button" aria-label={`Quitar pregunta ${index + 1}`} onClick={() => onChange(value.filter((_, i) => i !== index))} className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
      <textarea aria-label={`Respuesta ${index + 1}`} maxLength={1200} rows={2} value={row.answer} onChange={(event) => update(index, "answer", event.target.value)} placeholder="Respuesta confirmada" className="w-full rounded-lg border border-neutral-200 p-2 text-xs" />
    </div>)}
    <button type="button" disabled={value.length >= 8} onClick={() => onChange([...value, { question: "", answer: "" }])} className="min-h-11 flex items-center gap-2 text-xs font-semibold disabled:opacity-40"><Plus className="w-4 h-4" />Añadir pregunta</button>
  </section>;
}
