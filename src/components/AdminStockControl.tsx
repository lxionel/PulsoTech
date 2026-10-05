"use client";

import React, { useRef, useState } from "react";

export default function AdminStockControl({ stock, onChange }: { stock: number; onChange: (value: number, delta: boolean) => Promise<void> }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const working = useRef(false);
  const save = async (value: number, delta: boolean) => {
    if (working.current) return;
    if (!delta && (!Number.isSafeInteger(value) || value < 0 || value > 1e6)) { setError("Usa un stock entero entre 0 y 1 000 000."); return; }
    if (!delta && value === stock) { setDraft(null); setError(""); return; }
    working.current = true; setPending(true); setError("");
    try { await onChange(value, delta); setDraft(null); }
    catch (failure) { setDraft(null); setError(failure instanceof Error ? failure.message : "No se confirmó el stock."); }
    finally { working.current = false; setPending(false); }
  };
  const saveDraft = () => { if (draft !== null) void save(draft.trim() === "" ? NaN : Number(draft), false); };
  return <div className="max-w-40">
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Restar una unidad" title="Restar 1 unidad" disabled={pending || stock <= 0} onClick={() => { void save(-1, true); }} className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg border border-neutral-300 bg-white text-neutral-800 font-bold disabled:opacity-30 hover:bg-neutral-100">−</button>
      <input aria-label="Cantidad en stock" title="Escribe la cantidad y pulsa Enter o sal del campo para guardar" type="number" min="0" max="1000000" step="1" value={draft ?? stock} disabled={pending} onChange={(event) => setDraft(event.target.value)} onBlur={saveDraft} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); saveDraft(); } if (event.key === "Escape") { setDraft(null); setError(""); } }} className="h-9 w-14 sm:h-8 rounded-lg border border-neutral-300 text-center text-xs font-mono font-bold text-neutral-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50" />
      <button type="button" aria-label="Sumar una unidad" title="Sumar 1 unidad" disabled={pending} onClick={() => { void save(1, true); }} className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg border border-neutral-300 bg-white text-neutral-800 font-bold disabled:opacity-30 hover:bg-neutral-100">+</button>
    </div>
    {pending && <p role="status" className="mt-1 text-[10px] text-neutral-500">Guardando…</p>}
    {error && <p role="alert" className="mt-1 whitespace-normal text-[10px] text-red-600">{error}</p>}
  </div>;
}
