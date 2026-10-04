"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { backupSummary, decryptStoreBackup, encryptStoreBackup, MAX_OPERATIONAL_BACKUP_BYTES, validateStoreSnapshot } from "@/lib/store-backup";
import { fetchStoreBackup, getSupabaseClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";

export default function StoreBackupPanel() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const active = useRef(false);
  const pending = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const fieldClass = "w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs outline-none focus:border-neutral-900 disabled:opacity-50";
  const finish = () => {
    pending.current = false;
    if (active.current) { setBusy(false); setPassword(""); setConfirmation(""); }
  };
  const download = async (event: FormEvent) => {
    event.preventDefault();
    if (pending.current) return;
    setMessage(""); setError("");
    if (password.length < 12 || password !== confirmation) { setError("Usa al menos 12 caracteres y repite la misma contraseña."); return; }
    pending.current = true; setBusy(true);
    try {
      const snapshot = await fetchStoreBackup();
      validateStoreSnapshot(snapshot);
      const encrypted = await encryptStoreBackup(snapshot, password);
      const client = getSupabaseClient();
      if (!client) throw new Error("El acceso ya no está disponible.");
      await verifyAdminAccess(client);
      if (!active.current) return;
      const url = URL.createObjectURL(new Blob([encrypted], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url; link.download = `pulsotech_${new Date().toISOString().replaceAll(":", "-")}.pulsobackup`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      const counts = backupSummary(snapshot);
      setMessage(`Copia preparada: ${counts.products} productos, ${counts.sales} ventas, ${counts.operations} códigos y ${counts.complaints} reclamos. Comprueba el archivo descargado con «Verificar copia».`);
    } catch (failure) {
      if (active.current) setError(failure instanceof Error ? failure.message : "No se pudo preparar la copia.");
    } finally { finish(); }
  };
  const verify = async (file?: File) => {
    if (!file || pending.current) return;
    setMessage(""); setError("");
    if (password.length < 12 || file.size > MAX_OPERATIONAL_BACKUP_BYTES * 1.4 + 4096) { setError("Introduce la contraseña de la copia y selecciona un archivo de hasta 70 MB."); return; }
    pending.current = true; setBusy(true);
    try {
      const snapshot = await decryptStoreBackup(await file.text(), password);
      const counts = backupSummary(snapshot);
      if (active.current) setMessage(`Archivo verificado (${new Date(snapshot.createdAt).toLocaleString("es-PE")}): ${counts.products} productos, ${counts.sales} ventas, ${counts.operations} códigos y ${counts.complaints} reclamos. La comprobación no modifica la tienda.`);
    } catch (failure) {
      if (active.current) setError(failure instanceof Error ? failure.message : "No se pudo comprobar el archivo.");
    } finally { finish(); }
  };
  return (
    <form onSubmit={download} className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 space-y-3">
      <div>
        <h4 className="text-xs font-extrabold text-neutral-950">Copia cifrada de la tienda</h4>
        <p className="text-[11px] text-neutral-500 mt-1">Incluye inventario, ventas, configuración, códigos de pedidos y reclamos si están instalados. Lee los datos actuales de Supabase.</p>
      </div>
      <fieldset disabled={busy} className="grid gap-2 sm:grid-cols-2">
        <label className="text-[11px] font-semibold text-neutral-700">Contraseña de la copia
          <input type="password" autoComplete="new-password" minLength={12} maxLength={1024} value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-[11px] font-semibold text-neutral-700">Repetir para crear una copia
          <input type="password" autoComplete="new-password" maxLength={1024} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={fieldClass} />
        </label>
      </fieldset>
      <p className="text-[10px] text-neutral-500">Guarda esta contraseña separada del archivo: sin ella no podrás recuperarlo. La verificación solo necesita el primer campo. No incluye cuentas de acceso ni archivos externos.</p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="px-3 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">{busy ? "Procesando…" : "Descargar copia cifrada"}</button>
        <label className={`px-3 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-xs font-bold ${busy ? "opacity-50" : "cursor-pointer"}`}>
          Verificar copia
          <input type="file" accept=".pulsobackup" disabled={busy} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; void verify(file); }} />
        </label>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {message && <p role="status" className="text-xs text-neutral-700">{message}</p>}
    </form>
  );
}
