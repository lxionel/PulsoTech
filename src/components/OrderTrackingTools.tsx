"use client";
import { useRef, useState } from "react";
import { Link2, Copy, Check } from "lucide-react";
import { createOrderTrackingLink } from "@/lib/supabase";
import { orderTrackingUrl } from "@/lib/order-tracking";
import { basePath } from "@/utils/paths";

export default function OrderTrackingTools({ saleId }: { saleId: string }) {
  const [link, setLink] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const working = useRef(false);
  const create = async () => {
    if (working.current) return;
    working.current = true; setPending(true); setError(""); setCopied(false); setLink("");
    try {
      const result = await createOrderTrackingLink(saleId);
      setLink(orderTrackingUrl(window.location.origin, basePath, result.code)); setExpiresAt(result.expiresAt);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se confirmó el enlace."); }
    finally { working.current = false; setPending(false); }
  };
  return <div className="border-t border-neutral-100 pt-3 space-y-2">
    <button type="button" disabled={pending} onClick={() => { void create(); }} className="min-h-11 inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-black disabled:opacity-50"><Link2 className="w-4 h-4" />{pending ? "Creando enlace…" : link ? "Renovar enlace de seguimiento" : "Crear enlace de seguimiento"}</button>
    {link && <><div className="flex gap-2"><input aria-label="Enlace privado del pedido" value={link} readOnly className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-xs" /><button type="button" aria-label="Copiar enlace del pedido" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setError("Selecciona el enlace para copiarlo manualmente."); } }} className="w-11 h-11 border border-neutral-200 rounded-lg flex items-center justify-center">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button></div><p className="text-[11px] text-neutral-500">Válido hasta {new Date(expiresAt).toLocaleDateString("es-PE")}. Renovarlo invalida el anterior. Compártelo únicamente con el cliente.</p></>}
    {copied && <p role="status" className="text-xs text-green-700">Enlace copiado.</p>}
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
  </div>;
}
