"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { CaptchaProof } from "@/lib/admin-captcha";

interface TurnstileApi {
  render: (container: HTMLElement, options: {
    sitekey: string; theme: "dark" | "light"; size: "compact"; language: "es"; "response-field": false; action?: string;
    callback: (token: string) => void; "expired-callback": () => void;
    "error-callback": () => boolean; "timeout-callback": () => void;
  }) => string;
  remove: (widgetId: string) => void;
}
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function AdminCaptcha({ siteKey, resetKey, onProof, theme = "dark", action }: {
  siteKey: string; resetKey: number; onProof: (proof: CaptchaProof | null) => void; theme?: "dark" | "light"; action?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Preparando la verificación de seguridad…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => {
      onProof(null);
      setFailed(true);
      setStatus("La verificación está tardando demasiado. Comprueba tu conexión y recarga la página.");
    }, 15000);
    return () => clearTimeout(timer);
  }, [ready, onProof]);

  useEffect(() => {
    if (!ready || !container.current) return;
    const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
    if (!api) return;
    let active = true;
    let widgetId: string | undefined;
    const invalidate = (message: string) => {
      if (!active) return;
      onProof(null);
      setStatus(message);
    };
    // Vaciar el token antes de crear cada challenge. No guardar tokens en almacenamiento.
    onProof(null);
    // Next Script.onReady ya confirmó la carga. Turnstile.ready() rechaza scripts async/defer.
    // Posponer el montaje permite cancelar el primer efecto de React Strict Mode.
    const renderTimer = setTimeout(() => {
      if (!active || !container.current) return;
      try {
        widgetId = api.render(container.current, {
          sitekey: siteKey, theme, action, size: "compact", language: "es", "response-field": false,
          callback: (token) => {
            if (!active) return;
            onProof({ token, issuedAt: Date.now() });
            setFailed(false);
            setStatus("Verificación de seguridad completada.");
          },
          "expired-callback": () => invalidate("La verificación caducó. Espera a que se renueve."),
          "timeout-callback": () => invalidate("La verificación agotó el tiempo. Intenta de nuevo."),
          "error-callback": () => { if (active) setFailed(true); invalidate("No pudimos completar la verificación. Comprueba tu conexión y recarga la página."); return true; },
        });
      } catch { setFailed(true); invalidate("No pudimos iniciar la verificación. Recarga la página."); }
    }, 0);
    return () => {
      active = false;
      clearTimeout(renderTimer);
      onProof(null);
      if (widgetId !== undefined) {
        try { api.remove(widgetId); } catch { /* El widget ya pudo haberse retirado. */ }
      }
    };
  }, [siteKey, ready, resetKey, onProof, theme, action]);

  return (
    <div className="space-y-2">
      <Script id="pulsotech-admin-turnstile" src={SCRIPT_URL} strategy="afterInteractive" onReady={() => setReady(true)} onError={() => { onProof(null); setFailed(true); setStatus("No se pudo cargar la verificación. Comprueba tu conexión y recarga la página."); }} />
      <div ref={container} className="flex justify-center" />
      <p role="status" className="text-[11px] text-neutral-400 text-center leading-relaxed">{status}</p>
      {failed && <button type="button" onClick={() => window.location.reload()} className="w-full min-h-11 text-xs text-neutral-300 underline underline-offset-4 cursor-pointer">Recargar página</button>}
    </div>
  );
}
