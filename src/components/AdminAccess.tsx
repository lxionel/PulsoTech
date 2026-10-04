"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import AdminPasswordSettings from "./AdminPasswordSettings";
import AdminMfaChallenge from "./AdminMfaChallenge";
import AdminCaptcha from "./AdminCaptcha";
import { AdministratorContext } from "./AdminSessionContext";
import { getSupabaseClient } from "@/lib/supabase";
import { AdminAccessError, resolveAdminAccess, type AdminAccessState } from "@/lib/admin-auth";
import { getAdminCaptchaConfig, signInAdmin, requestAdminRecovery, authRetrySeconds, type CaptchaProof } from "@/lib/admin-captcha";

export { useAdministrator } from "./AdminSessionContext";

export default function AdminAccess({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AdminAccessState | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [captchaProof, setCaptchaProof] = useState<CaptchaProof | null>(null);
  const [captchaCycle, setCaptchaCycle] = useState(0);
  const [retryUntil, setRetryUntil] = useState(0);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const captcha = getAdminCaptchaConfig();
  const captchaBlocked = Boolean(captcha.error) || (captcha.required && !captchaProof);
  const mounted = useRef(false);
  const revision = useRef(0);
  const submitting = useRef(false);
  const refreshAccess = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (!retryUntil) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
      setRetrySeconds(remaining);
      if (!remaining) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, [retryUntil]);

  const pauseRequests = (seconds: number) => {
    setRetrySeconds(seconds);
    setRetryUntil(Date.now() + seconds * 1000);
  };

  useEffect(() => {
    mounted.current = true;
    try {
      localStorage.removeItem("pulsotech_admin_pin");
      sessionStorage.removeItem("pulsotech_admin_authenticated");
    } catch { /* El acceso depende de Auth, no del almacenamiento antiguo. */ }
    const client = getSupabaseClient();
    if (!client) {
      const timer = setTimeout(() => {
        setChecking(false);
        setError("El acceso administrativo no está disponible. Intenta de nuevo más tarde.");
      }, 0);
      return () => { mounted.current = false; clearTimeout(timer); };
    }

    let timer: ReturnType<typeof setTimeout>;
    const recheck = async () => {
      const currentRevision = ++revision.current;
      setChecking(true);
      try {
        const verified = await resolveAdminAccess(client);
        if (mounted.current && currentRevision === revision.current) {
          setUser(verified.user);
          setAccess(verified);
          setError("");
        }
      } catch (failure) {
        if (mounted.current && currentRevision === revision.current) {
          setUser(null);
          setAccess(null);
          if (!(failure instanceof AdminAccessError) || failure.code !== "signed_out") {
            setError(failure instanceof AdminAccessError ? failure.message : "No pudimos verificar tu acceso. Intenta de nuevo.");
          }
        }
      } finally {
        if (mounted.current && currentRevision === revision.current) setChecking(false);
      }
    };
    refreshAccess.current = recheck;
    const scheduleCheck = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { void recheck(); }, 0);
    };
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      // No llamar a otros métodos de Auth dentro del callback: evita bloquear su sesión.
      if (event === "SIGNED_OUT") {
        ++revision.current;
        clearTimeout(timer);
        setUser(null);
        setAccess(null);
        setChecking(false);
        setRecovery(false);
        setPassword("");
        return;
      }
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (session || event === "INITIAL_SESSION") scheduleCheck();
    });
    const invalidate = () => {
      ++revision.current;
      setUser(null);
      setAccess(null);
      setError("Tu acceso ya no está disponible. Vuelve a iniciar sesión.");
      scheduleCheck();
    };
    const onVisible = () => { if (document.visibilityState === "visible") scheduleCheck(); };
    window.addEventListener("focus", scheduleCheck);
    window.addEventListener("pulsotech-admin-access-invalid", invalidate);
    document.addEventListener("visibilitychange", onVisible);
    scheduleCheck();
    const cancelPending = () => {
      mounted.current = false;
      ++revision.current;
    };
    return () => {
      cancelPending();
      clearTimeout(timer);
      subscription.unsubscribe();
      window.removeEventListener("focus", scheduleCheck);
      window.removeEventListener("pulsotech-admin-access-invalid", invalidate);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || Date.now() < retryUntil || captchaBlocked) return;
    const client = getSupabaseClient();
    if (!client) { setError("El acceso administrativo no está disponible."); return; }
    submitting.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { error: loginError } = await signInAdmin(client, email, password, captcha, captchaProof);
      if (loginError) {
        const seconds = authRetrySeconds(loginError);
        if (seconds) pauseRequests(seconds);
        setError(seconds ? "Hay demasiados intentos. Espera antes de volver a ingresar." : "No se pudo iniciar sesión. Comprueba tus datos y la verificación de seguridad.");
        return;
      }
      const verified = await resolveAdminAccess(client);
      if (mounted.current) {
        ++revision.current;
        setUser(verified.user);
        setAccess(verified);
        setChecking(false);
        setPassword("");
      }
    } catch (failure) {
      await client.auth.signOut({ scope: "local" });
      if (mounted.current) setError(failure instanceof AdminAccessError ? failure.message : "No pudimos verificar tu acceso. Intenta de nuevo.");
    } finally {
      submitting.current = false;
      if (mounted.current) { setBusy(false); setPassword(""); setCaptchaProof(null); setCaptchaCycle((cycle) => cycle + 1); }
    }
  };

  const logout = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    const { error: logoutError } = await client.auth.signOut({ scope: "local" });
    if (logoutError) {
      setError("No se pudo cerrar la sesión. Comprueba tu conexión e intenta de nuevo.");
      return;
    }
    ++revision.current;
    setUser(null);
    setAccess(null);
    setRecovery(false);
    setPassword("");
  };

  const resetPassword = async () => {
    if (submitting.current || Date.now() < retryUntil || captchaBlocked) return;
    if (!email.trim()) { setError("Escribe tu correo para solicitar la recuperación."); return; }
    const client = getSupabaseClient();
    if (!client) { setError("La recuperación no está disponible en este momento."); return; }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const redirectTo = new URL(window.location.href);
      redirectTo.search = "";
      redirectTo.hash = "";
      const { error: resetError } = await requestAdminRecovery(client, email, redirectTo.toString(), captcha, captchaProof);
      if (resetError) {
        const seconds = authRetrySeconds(resetError);
        if (seconds) pauseRequests(seconds);
        setError(seconds ? "Se alcanzó el límite de solicitudes. Espera antes de intentarlo otra vez." : "No se pudo solicitar la recuperación. Comprueba la verificación de seguridad e intenta más tarde.");
      } else {
        pauseRequests(60);
        setNotice("Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.");
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo solicitar la recuperación. Comprueba tu conexión.");
    } finally {
      submitting.current = false;
      if (mounted.current) { setBusy(false); setCaptchaProof(null); setCaptchaCycle((cycle) => cycle + 1); }
    }
  };

  const checkingScreen = (
    <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4">
      <div role="status" className="flex flex-col items-center gap-3">
        <div aria-hidden="true" className="w-10 h-10 border-2 border-white/40 border-t-transparent rounded-full motion-safe:animate-spin" />
        <span className="text-xs font-medium text-neutral-400">Verificando acceso seguro…</span>
      </div>
    </div>
  );

  if (checking && !user) return checkingScreen;

  if (user && access) return (
    <AdministratorContext.Provider value={{ user, logout }}>
      {checking && <div className="fixed inset-0 z-[60]">{checkingScreen}</div>}
      {error && <p role="alert" className="fixed top-3 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-white border border-red-200 px-4 py-3 text-xs text-red-700 shadow-lg">{error}</p>}
      <div inert={checking} aria-hidden={checking || undefined}>
        {access.step !== "ready"
          ? <AdminMfaChallenge access={access} onVerified={() => refreshAccess.current()} onRetry={() => refreshAccess.current()} />
          : recovery ? <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4"><div className="w-full max-w-lg"><AdminPasswordSettings recovery onChanged={() => setRecovery(false)} /></div></div> : children}
      </div>
    </AdministratorContext.Provider>
  );

  return (
    <div className="store-motion min-h-screen bg-[#090a0f] text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <header className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <Logo size="sm" inverted />
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white py-1.5 px-3 rounded-xl bg-neutral-900/80 border border-neutral-800"><ArrowLeft className="w-3.5 h-3.5" />Volver a la tienda</Link>
      </header>
      <main className="max-w-[420px] w-full mx-auto my-auto py-6 z-10">
        <form onSubmit={login} className="rounded-3xl bg-[#111318]/90 border border-white/[0.08] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-neutral-900 border border-neutral-800"><Lock className="w-7 h-7 text-neutral-300" /></div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Acceso Administrativo</h1>
            <p className="text-xs text-neutral-400">Ingresa con tu cuenta de administrador de PulsoTech.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-xs font-semibold text-neutral-300">Correo electrónico</label>
            <input id="admin-email" name="email" type="email" autoComplete="username" required value={email} disabled={busy} onChange={(event) => setEmail(event.target.value)} className="w-full px-3 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-sm outline-none focus:border-white disabled:opacity-50" />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-xs font-semibold text-neutral-300">Contraseña</label>
            <div className="relative">
              <input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} disabled={busy} onChange={(event) => setPassword(event.target.value)} className="w-full pl-3 pr-11 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-sm outline-none focus:border-white disabled:opacity-50" />
              <button type="button" onClick={() => setShowPassword((previous) => !previous)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 cursor-pointer">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          {captcha.error && <p role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{captcha.error}</p>}
          {captcha.required && !captcha.error && <AdminCaptcha key={captchaCycle} siteKey={captcha.siteKey} resetKey={captchaCycle} onProof={setCaptchaProof} />}
          {error && <p role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</p>}
          {notice && <p role="status" className="text-xs text-neutral-300 leading-relaxed">{notice}</p>}
          {retrySeconds > 0 && <p role="status" className="text-xs text-neutral-400">Puedes volver a intentarlo en {retrySeconds} s.</p>}
          <button type="submit" disabled={busy || captchaBlocked || retrySeconds > 0} className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-wait">{busy ? "Comprobando…" : "Entrar al panel"}</button>
          <button type="button" disabled={busy || captchaBlocked || retrySeconds > 0} onClick={resetPassword} className="w-full text-center text-xs text-neutral-400 hover:text-white cursor-pointer disabled:opacity-50">Olvidé mi contraseña</button>
        </form>
      </main>
      <footer className="text-center text-[11px] text-neutral-500 flex items-center justify-center gap-2"><ShieldCheck className="w-3.5 h-3.5" />Acceso reservado para administración</footer>
    </div>
  );
}
