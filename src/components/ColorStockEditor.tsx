"use client";
import type { ProductColor } from "@/types";

export default function ColorStockEditor({ enabled, colors, onEnabled, onChange }: {
  enabled: boolean; colors: ProductColor[]; onEnabled: (value: boolean) => void; onChange: (value: ProductColor[]) => void;
}) {
  return <section className="rounded-xl border border-neutral-200 p-4 space-y-3">
    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer"><input type="checkbox" checked={enabled} onChange={(event) => onEnabled(event.target.checked)} className="w-4 h-4 accent-black" />Controlar stock por color</label>
    <p className="text-xs text-neutral-500">{enabled ? "El stock total será la suma de estas cantidades. Las ventas descontarán el color elegido." : "Actualmente las unidades se comparten entre todos los colores."}</p>
    {enabled && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{colors.map((color, index) => <label key={index} className="flex items-center gap-3 text-xs"><span aria-hidden="true" className="w-3 h-3 rounded-full border border-neutral-300 shrink-0" style={{ backgroundColor: color.hex }} /><span className="flex-1 truncate">{color.name || `Color ${index + 1}`}</span><input type="number" required min={0} max={1000000} step={1} aria-label={`Stock de ${color.name || `color ${index + 1}`}`} value={color.stockCount ?? ""} onChange={(event) => onChange(colors.map((row, i) => i === index ? { ...row, stockCount: event.target.value === "" ? undefined : Number(event.target.value) } : row))} className="w-24 rounded-lg border border-neutral-200 px-3 py-2 text-center font-mono" /></label>)}</div>}
  </section>;
}
