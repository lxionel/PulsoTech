"use client";

import { useRef, useState, type FormEvent } from "react";
import { KeyRound, LogOut, Shield } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { useAdministrator } from "./AdminSessionContext";

export default function AdminPasswordSettings({ recovery = false, onChanged }: { recovery?: boolean; onChanged?: () => void }) {
  const { user, logout } = useAdministrator();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const submitting = useRef(false);

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    if (password.length < 12) { setNotice({ text: "Usa una contraseña de al menos 12 caracteres.", isError: true }); return; }
    if (password !== confirmation) { setNotice({ text: "Las nuevas contraseñas no coinciden.", isError: true }); return; }
    const client = getSupabaseClient();
    if (!client) { setNotice({ text: "El servicio no está disponible. Intenta de nuevo.", isError: true }); return; }
    submitting.current = true;
    setBusy(true);
    setNotice(null);
    try {
      await verifyAdminAccess(client);
      const { error } = await client.auth.updateUser({ password, ...(recovery ? {} : { current_password: current }) });
      if (error) { setNotice({ text: "No pudimos actualizar la contraseña. Revisa los datos e intenta de nuevo.", isError: true }); return; }
      setCurrent("");
      setPassword("");
      setConfirmation("");
      setNotice({ text: "Contraseña actualizada correctamente.", isError: false });
      onChanged?.();
    } catch {
      setNotice({ text: "No pudimos verificar tu sesión. Vuelve a iniciar sesión.", isError: true });
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const fieldClass = "w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 outline-none focus:bg-white focus:border-neutral-900 disabled:opacity-50";
  return (
    <form onSubmit={changePassword} className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100"><Shield className="w-4 h-4 text-neutral-900" /><h3 className="text-sm font-extrabold text-neutral-950">{recovery ? "Restablecer contraseña" : "Seguridad de la cuenta"}</h3></div>
      <p className="text-xs text-neutral-600 break-words">Cuenta administradora: {user.email}</p>
      {!recovery && <p className="text-xs text-neutral-600 leading-relaxed rounded-xl bg-neutral-50 border border-neutral-200 p-3">Verificación en dos pasos activa. El panel requiere tu contraseña y el código de tu aplicación autenticadora. Cambiar la contraseña mantiene esta protección.</p>}
      <div className={`grid grid-cols-1 ${recovery ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3`}>
        {!recovery && <div><label htmlFor="current-admin-password" className="text-[11px] font-bold text-neutral-700 block mb-1">Contraseña actual</label><input id="current-admin-password" type="password" autoComplete="current-password" required disabled={busy} value={current} onChange={(event) => setCurrent(event.target.value)} className={fieldClass} /></div>}
        <div><label htmlFor="new-admin-password" className="text-[11px] font-bold text-neutral-700 block mb-1">Nueva contraseña</label><input id="new-admin-password" type="password" autoComplete="new-password" minLength={12} required disabled={busy} value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} /></div>
        <div><label htmlFor="confirm-admin-password" className="text-[11px] font-bold text-neutral-700 block mb-1">Repite la contraseña</label><input id="confirm-admin-password" type="password" autoComplete="new-password" minLength={12} required disabled={busy} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={fieldClass} /></div>
      </div>
      <p className="text-[11px] text-neutral-500">Usa al menos 12 caracteres y evita reutilizar una contraseña.</p>
      {notice && <p role={notice.isError ? "alert" : "status"} className={`p-3 rounded-xl text-xs ${notice.isError ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}>{notice.text}</p>}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => { void logout(); }} className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"><LogOut className="w-3.5 h-3.5" />Cerrar sesión</button>
        <button type="submit" disabled={busy} className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"><KeyRound className="w-3.5 h-3.5" />{busy ? "Actualizando…" : "Actualizar contraseña"}</button>
      </div>
    </form>
  );
}
