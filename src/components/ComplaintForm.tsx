"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import AdminCaptcha from "./AdminCaptcha";
import { getAdminCaptchaConfig } from "@/lib/admin-captcha";
import type { CaptchaProof } from "@/lib/admin-captcha";
import { getSupabaseClient } from "@/lib/supabase";

interface Receipt { reference: string; createdAt: string; provider: Record<string, string>; submission: Record<string, string | number | boolean>; }

export default function ComplaintForm() {
  const [proof, setProof] = useState<CaptchaProof | null>(null);
  const [cycle, setCycle] = useState(0);
  const [isMinor, setIsMinor] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const sending = useRef(false);
  const captcha = getAdminCaptchaConfig();
  const fieldClass = "w-full border border-neutral-300 rounded-xl bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-950";
  const fields = [
    { name: "name", label: "Nombres y apellidos", max: 200, autocomplete: "name" },
    { name: "documentNumber", label: "Número de documento", max: 30 },
    { name: "email", label: "Correo para recibir la respuesta", max: 254, type: "email", autocomplete: "email" },
    { name: "phone", label: "Teléfono", max: 30, type: "tel", autocomplete: "tel" },
    { name: "address", label: "Domicilio del consumidor", max: 500, autocomplete: "street-address" },
    { name: "product", label: "Producto o compra relacionada", max: 500 },
  ];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    if (!proof || Date.now() - proof.issuedAt >= 240000) { setError("Completa una nueva verificación de seguridad."); setProof(null); setCycle((value) => value + 1); return; }
    const client = getSupabaseClient();
    if (!client) { setError("No se pudo conectar. Contacta con PulsoTech por correo o WhatsApp."); return; }
    const form = new FormData(event.currentTarget);
    const submission = Object.fromEntries(form.entries());
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      const { data, error: failure } = await client.functions.invoke("submit-complaint", { body: { submission: { ...submission, amount: Number(form.get("amount")), isMinor, confirmed: form.get("confirmed") === "on" }, captchaToken: proof.token } });
      if (failure) {
        let message = "No pudimos confirmar el registro. Conserva los datos y contacta con PulsoTech antes de reenviarlos.";
        if (failure.context instanceof Response) {
          try { const body = await failure.context.json(); if (typeof body.error === "string") message = body.error.slice(0, 300); } catch { /* Mostrar el mensaje general sin exponer detalles del servidor. */ }
        }
        setError(message);
        return;
      }
      if (!data?.reference || !data?.createdAt || !data?.submission || !data?.provider) { setError("No pudimos confirmar el registro. Contacta con PulsoTech antes de reenviarlo."); return; }
      setReceipt(data);
    } catch { setError("No pudimos confirmar el registro. Si ya lo enviaste, contacta con PulsoTech antes de intentarlo otra vez."); }
    finally { sending.current = false; setBusy(false); setProof(null); setCycle((value) => value + 1); }
  };

  if (receipt) {
    const download = () => {
      const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `constancia-${receipt.reference}.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    return <section className="space-y-4" aria-live="polite">
      <h2 className="text-xl font-bold text-neutral-950">Solicitud registrada · {receipt.reference}</h2>
      <p className="text-sm text-neutral-600">Fecha: {new Date(receipt.createdAt).toLocaleString("es-PE", { timeZone: "America/Lima" })}. Conserva esta constancia. La respuesta se enviará al correo que indicaste en un máximo de 15 días hábiles.</p>
      <dl className="text-sm space-y-3 break-words">{Object.entries(receipt.provider).map(([key, value]) => <div key={key}><dt className="font-semibold text-neutral-900">{({ name: "Proveedor", tradeName: "Nombre comercial", address: "Domicilio", email: "Contacto", ruc: "RUC" } as Record<string, string>)[key] || key}</dt><dd className="text-neutral-600">{value}</dd></div>)}{Object.entries(receipt.submission).map(([key, value]) => <div key={key}><dt className="font-semibold text-neutral-900">{({ name: "Consumidor", documentType: "Tipo de documento", documentNumber: "Documento", email: "Correo", phone: "Teléfono", address: "Domicilio del consumidor", product: "Producto", kind: "Tipo de solicitud", detail: "Detalle", request: "Pedido del consumidor", amount: "Importe en soles", isMinor: "Menor de edad", guardian: "Madre, padre o representante" } as Record<string, string>)[key] || key}</dt><dd className="text-neutral-600 whitespace-pre-wrap">{typeof value === "boolean" ? value ? "Sí" : "No" : value}</dd></div>)}</dl>
      <div className="flex flex-wrap gap-3 print:hidden"><button type="button" onClick={download} className="rounded-xl bg-neutral-950 text-white px-4 py-3 text-xs font-bold cursor-pointer">Descargar constancia</button><button type="button" onClick={() => window.print()} className="rounded-xl border border-neutral-300 px-4 py-3 text-xs font-bold cursor-pointer">Imprimir / guardar PDF</button></div>
    </section>;
  }

  return <form onSubmit={submit} className="space-y-5">
    <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
      <legend className="text-lg font-extrabold text-neutral-950 mb-4">Hoja de reclamación</legend>
      <p className="text-sm text-neutral-600 leading-7">Un reclamo expresa disconformidad con el producto o servicio. Una queja se refiere a la atención recibida. Completa los campos para identificar tu compra y responderte.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-xs font-semibold text-neutral-700 space-y-2"><span>Tipo de documento</span><select name="documentType" required className={fieldClass}><option>DNI</option><option>CE</option><option>Pasaporte</option></select></label>
        {fields.map((field) => <label key={field.name} className="block text-xs font-semibold text-neutral-700 space-y-2"><span>{field.label}</span><input name={field.name} type={field.type || "text"} autoComplete={field.autocomplete} required maxLength={field.max} className={fieldClass} /></label>)}
        <label className="block text-xs font-semibold text-neutral-700 space-y-2"><span>Importe reclamado (S/; coloca 0 si no corresponde)</span><input name="amount" type="number" min="0" max="100000000" step="0.01" required defaultValue="0" className={fieldClass} /></label>
        <label className="block text-xs font-semibold text-neutral-700 space-y-2"><span>Tipo de solicitud</span><select name="kind" required className={fieldClass}><option value="reclamo">Reclamo</option><option value="queja">Queja</option></select></label>
      </div>
      <label className="flex gap-2 text-sm text-neutral-600"><input type="checkbox" checked={isMinor} onChange={(event) => setIsMinor(event.target.checked)} />El consumidor es menor de edad</label>
      {isMinor && <label className="block text-xs font-semibold text-neutral-700 space-y-2"><span>Nombre de la madre, padre o representante</span><input name="guardian" required maxLength={200} className={fieldClass} /></label>}
      {[{ name: "detail", label: "Detalle del reclamo o queja", max: 3000 }, { name: "request", label: "Qué solución solicitas", max: 2000 }].map((field) => <label key={field.name} className="block text-xs font-semibold text-neutral-700 space-y-2"><span>{field.label}</span><textarea name={field.name} required maxLength={field.max} rows={4} className={fieldClass} /></label>)}
      <label hidden aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="flex gap-2 text-sm text-neutral-600 leading-6"><input name="confirmed" type="checkbox" required className="mt-1" /><span>Confirmo que los datos ingresados corresponden a mi solicitud. Se utilizarán para registrarla y responderla conforme al aviso de privacidad.</span></label>
      {captcha.error || !captcha.siteKey ? <p role="alert" className="text-sm text-red-700">La verificación no está disponible. Contacta con PulsoTech por correo o WhatsApp.</p> : <AdminCaptcha key={cycle} siteKey={captcha.siteKey} resetKey={cycle} onProof={setProof} theme="light" action="complaint" />}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy || !proof || Boolean(captcha.error)} className="w-full sm:w-auto rounded-xl bg-neutral-950 text-white px-6 py-3 text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-wait">{busy ? "Registrando…" : "Registrar reclamo o queja"}</button>
      <p className="text-xs text-neutral-500 leading-6">La presentación de esta solicitud no impide que acudas a otros medios de solución de controversias ni requiere un pago. La constancia se muestra únicamente después de confirmar el registro.</p>
    </fieldset>
  </form>;
}
