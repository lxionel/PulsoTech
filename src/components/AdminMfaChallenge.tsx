"use client";

import { useRef, useState, type FormEvent } from "react";
import { LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { cancelAdminEnrollment, enrollAdminAuthenticator, verifyAdminAuthenticator, type AdminAccessState } from "@/lib/admin-auth";
import { useAdministrator } from "./AdminSessionContext";

export default function AdminMfaChallenge({ access, onVerified, onRetry }: {
  access: AdminAccessState; onVerified: () => Promise<void>; onRetry: () => Promise<void>;
}) {
  const { user, logout } = useAdministrator();
  const [enrollment, setEnrollment] = useState<{ id: string; secret: string; qr: string } | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [code, setCode] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const running = useRef(false);
  const enrolling = access.step === "enroll";
  const factorId = enrolling ? enrollment?.id : access.factors.find((factor) => factor.id === selectedId)?.id || access.factors[0]?.id;

  const startEnrollment = async () => {
    if (running.current) return;
    const client = getSupabaseClient();
    if (!client) { setError("El servicio no está disponible. Intenta de nuevo."); return; }
    running.current = true;
    setBusy(true);
    setError("");
    try {
      setEnrollment(await enrollAdminAuthenticator(client));
      setCode("");
      setShowSecret(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No pudimos configurar el autenticador.");
    } finally { running.current = false; setBusy(false); }
  };

  const cancelEnrollment = async () => {
    if (running.current || !enrollment) return;
    const client = getSupabaseClient();
    if (!client) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await cancelAdminEnrollment(client, enrollment.id);
      setEnrollment(null);
      setCode("");
      setShowSecret(false);
      await onRetry();
    } catch { setError("No pudimos cancelar la configuración. Comprueba tu conexión e intenta de nuevo."); }
    finally { running.current = false; setBusy(false); }
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (running.current || !factorId) return;
    const client = getSupabaseClient();
    if (!client) { setError("El servicio no está disponible. Intenta de nuevo."); return; }
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await verifyAdminAuthenticator(client, factorId, code);
      setEnrollment(null);
      setCode("");
      setShowSecret(false);
      await onVerified();
    } catch (failure) {
      setCode("");
      setError(failure instanceof Error ? failure.message : "No pudimos verificar el código.");
    } finally { running.current = false; setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md rounded-3xl bg-[#111318] border border-white/[0.08] p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-3">
          <ShieldCheck className="w-9 h-9 text-neutral-300 mx-auto" />
          <h1 className="text-xl font-bold tracking-tight">{enrolling ? "Configura la verificación en dos pasos" : "Verifica tu identidad"}</h1>
          <p className="text-xs text-neutral-400 break-words">{user.email}</p>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">{enrolling
          ? "Añade PulsoTech a tu aplicación autenticadora y confirma el primer código para entrar al panel."
          : "Escribe el código de seis dígitos de tu aplicación autenticadora."}</p>
        {enrolling && !enrollment && <button type="button" disabled={busy} onClick={startEnrollment} className="w-full min-h-11 rounded-xl bg-white text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"><Smartphone className="w-4 h-4" />{busy ? "Preparando…" : "Configurar autenticador"}</button>}
        {enrolling && enrollment && <div className="space-y-3">
          <p className="text-xs text-neutral-400">En tu aplicación, elige añadir una cuenta y escanea este QR.</p>
          <div className="bg-white rounded-2xl p-3 w-fit mx-auto">
            {/* El QR se genera en Supabase Auth y permanece únicamente en memoria. */}
            <img src={enrollment.qr} alt="QR privado para configurar tu autenticador de PulsoTech" width={200} height={200} className="w-48 h-48" />
          </div>
          <button type="button" onClick={() => setShowSecret((shown) => !shown)} aria-expanded={showSecret} className="text-xs text-neutral-300 underline underline-offset-4 cursor-pointer">{showSecret ? "Ocultar clave manual" : "Ingresar la clave manualmente"}</button>
          {showSecret && <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-3 space-y-2"><p className="text-[11px] text-neutral-400">Cuenta: {user.email} · Clave privada:</p><code className="block text-xs break-all select-all">{enrollment.secret}</code><p className="text-[11px] text-neutral-400">Guárdala de forma segura. No la compartas ni la envíes por chat.</p></div>}
        </div>}
        {factorId && <form onSubmit={verify} className="space-y-3">
          {!enrolling && access.factors.length > 1 && <div><label htmlFor="admin-mfa-factor" className="block text-xs text-neutral-300 mb-2">Autenticador</label><select id="admin-mfa-factor" value={factorId} disabled={busy} onChange={(event) => { setSelectedId(event.target.value); setCode(""); }} className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm">{access.factors.map((factor) => <option key={factor.id} value={factor.id}>{factor.name}</option>)}</select></div>}
          <label htmlFor="admin-mfa-code" className="block text-xs font-semibold text-neutral-300">Código de verificación</label>
          <input id="admin-mfa-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} minLength={6} required disabled={busy} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-3 text-center text-xl tracking-[0.3em] outline-none focus:border-white disabled:opacity-50" />
          <button type="submit" disabled={busy || code.length !== 6} className="w-full min-h-11 rounded-xl bg-white text-neutral-950 font-bold text-xs cursor-pointer disabled:opacity-50">{busy ? "Verificando…" : enrolling ? "Activar y entrar" : "Verificar y entrar"}</button>
          {enrolling && <button type="button" disabled={busy} onClick={cancelEnrollment} className="w-full min-h-11 text-xs text-neutral-400 hover:text-white cursor-pointer disabled:opacity-50">Cancelar configuración</button>}
        </form>}
        {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">{error}</p>}
        <p className="text-[11px] text-neutral-500 leading-relaxed">Conserva acceso a tu autenticador. Si pierdes el dispositivo, la recuperación del segundo factor requiere el panel de Supabase; cambiar la contraseña no lo elimina.</p>
        <div className="flex items-center justify-between border-t border-neutral-800 pt-3 gap-3">
          <button type="button" disabled={busy} onClick={onRetry} className="min-h-11 text-xs text-neutral-400 hover:text-white cursor-pointer disabled:opacity-50">Comprobar de nuevo</button>
          <button type="button" disabled={busy} onClick={() => { void logout(); }} className="min-h-11 text-xs text-neutral-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"><LogOut className="w-3.5 h-3.5" />Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}
