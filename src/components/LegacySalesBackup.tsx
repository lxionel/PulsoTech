"use client";

import { useEffect, useState } from "react";

const LEGACY_KEY = "pulsotech_sales_records";

/** Recovery only; old local data is never used to overwrite the cloud history. */
export default function LegacySalesBackup() {
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      try { setRaw(localStorage.getItem(LEGACY_KEY)); } catch { /* Storage may be disabled. */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  if (raw === null) return null;
  const download = () => {
    const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ventas_locales_antiguas_pulsotech.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const remove = () => {
    if (!confirm("Esta copia antigua puede contener ventas que no llegaron a guardarse en la nube. Descárgala y comprueba tus órdenes antes de borrarla. ¿Eliminar únicamente esta copia del navegador?")) return;
    try { localStorage.removeItem(LEGACY_KEY); setRaw(null); }
    catch { setError("No pudimos eliminar la copia. Revisa los permisos de almacenamiento del navegador."); }
  };
  return (
    <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
      <p className="text-xs text-neutral-700">Hay una copia antigua de ventas en este navegador. Descárgala para revisar posibles órdenes sin sincronizar y después elimina la copia. Las nuevas ventas se guardan en Supabase.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={download} className="rounded-lg bg-neutral-950 px-3 py-2 text-xs font-bold text-white">Descargar copia antigua</button>
        <button type="button" onClick={remove} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700">Eliminar copia del navegador</button>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
