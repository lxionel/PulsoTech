"use client";

import { useEffect, useState } from "react";
import { fetchComplaintsForAdmin, saveComplaintResponse } from "@/lib/supabase";
import type { ComplaintRecord } from "@/lib/supabase";

export default function AdminComplaints() {
  const [records, setRecords] = useState<ComplaintRecord[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<ComplaintRecord | null>(null);
  const [response, setResponse] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const loadPage = async (next: number) => {
    setLoading(true);
    const data = await fetchComplaintsForAdmin(next);
    if (data) { setRecords(data); setPage(next); setMessage(""); } else setMessage("El registro no está disponible. Si aún no lo instalaste, sigue docs/activar-libro-reclamaciones.md. No se modificaron las solicitudes.");
    setLoading(false);
  };
  const refresh = () => loadPage(page);
  useEffect(() => {
    let active = true;
    void fetchComplaintsForAdmin().then((data) => {
      if (!active) return;
      if (data) setRecords(data); else setMessage("El registro no está instalado o no se pudo consultar. Revisa las instrucciones de activación del Libro de Reclamaciones.");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  const save = async () => {
    if (!selected || busy || !response.trim() || !sent) return;
    setBusy(true);
    const ok = await saveComplaintResponse(selected.id, "answered", response);
    if (ok) { setSelected(null); await refresh(); setMessage("Respuesta registrada. Conserva también el correo enviado al consumidor."); }
    else setMessage("No se pudo guardar la respuesta. Los datos ingresados siguen en este formulario.");
    setBusy(false);
  };
  return <section className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-extrabold text-neutral-950">Reclamos y quejas</h3><button type="button" disabled={loading || busy} onClick={refresh} className="text-xs font-bold underline underline-offset-4 cursor-pointer">Actualizar</button></div>
    <p className="text-xs text-neutral-500 leading-6">La respuesta debe enviarse por escrito al consumidor en un máximo de 15 días hábiles. Los datos se consultan con tu sesión y no se guardan en la caché pública.</p>
    {message && <p role="status" className="text-xs text-neutral-700 leading-6">{message}</p>}
    {loading ? <p className="text-sm text-neutral-500">Consultando…</p> : records.length === 0 ? <p className="text-sm text-neutral-500">Sin solicitudes para mostrar.</p> : <div className="space-y-2">{records.map((record) => <button key={record.id} type="button" onClick={() => { setSelected(record); setResponse(record.response); setSent(false); }} className="w-full flex flex-wrap gap-2 justify-between border border-neutral-200 rounded-xl p-3 text-left text-xs cursor-pointer hover:border-neutral-500"><span className="font-bold">PT-{String(record.reference).padStart(6, "0")} · {String(record.submission.name)}</span><span className="text-neutral-500">{new Date(record.created_at).toLocaleDateString("es-PE", { timeZone: "America/Lima" })} · {({ pending: "Pendiente", in_review: "En revisión", answered: "Respondido" })[record.status]}</span></button>)}</div>}
    <div className="flex items-center gap-4 text-xs"><button type="button" disabled={loading || busy || page === 0} onClick={() => void loadPage(page - 1)} className="underline cursor-pointer disabled:opacity-40">Anterior</button><span>Página {page + 1}</span><button type="button" disabled={loading || busy || records.length < 50} onClick={() => void loadPage(page + 1)} className="underline cursor-pointer disabled:opacity-40">Siguiente</button></div>
    {selected && <div className="border-t border-neutral-200 pt-5 space-y-4">
      <h4 className="text-sm font-bold">PT-{String(selected.reference).padStart(6, "0")}</h4>
      <p className="text-xs text-neutral-600 break-words">{String(selected.submission.name)} · {String(selected.submission.email)} · {String(selected.submission.phone)}</p>
      <p className="text-sm text-neutral-700 whitespace-pre-wrap">{String(selected.submission.product)}<br />{String(selected.submission.detail)}</p>
      <p className="text-sm text-neutral-700 whitespace-pre-wrap"><strong>Solicitud:</strong> {String(selected.submission.request)}</p>
      <label className="block text-xs font-bold text-neutral-800 space-y-2"><span>Respuesta al consumidor</span><textarea value={response} onChange={(event) => { setResponse(event.target.value); setSent(false); }} maxLength={5000} rows={5} className="w-full border border-neutral-300 rounded-xl p-3 text-sm font-normal" /></label>
      <a href={`mailto:${encodeURIComponent(String(selected.submission.email))}?subject=${encodeURIComponent(`Respuesta PulsoTech PT-${String(selected.reference).padStart(6, "0")}`)}&body=${encodeURIComponent(response)}`} className="inline-flex rounded-xl border border-neutral-300 px-4 py-3 text-xs font-bold">Abrir respuesta en mi correo</a>
      <label className="flex gap-2 text-xs text-neutral-600 leading-6"><input type="checkbox" checked={sent} onChange={(event) => setSent(event.target.checked)} />Ya envié la respuesta al correo del consumidor y conservé la evidencia.</label>
      <div className="flex flex-wrap gap-3"><button type="button" disabled={busy || !sent || !response.trim()} onClick={save} className="rounded-xl bg-neutral-950 text-white px-4 py-3 text-xs font-bold disabled:opacity-40 cursor-pointer">{busy ? "Guardando…" : "Marcar como respondido"}</button><button type="button" disabled={busy} onClick={() => setSelected(null)} className="text-xs underline cursor-pointer">Cerrar detalle</button></div>
    </div>}
  </section>;
}
