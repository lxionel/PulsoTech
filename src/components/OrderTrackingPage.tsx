"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Package, RefreshCw } from "lucide-react";
import Logo from "@/components/Logo";
import { fetchOrderTracking } from "@/lib/supabase";
import { ORDER_STEPS, type OrderTracking } from "@/lib/order-tracking";

export default function OrderTrackingPage() {
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const code = new URLSearchParams(window.location.hash.slice(1)).get("codigo") || "";
    const request = /^[a-f0-9]{64}$/.test(code) ? fetchOrderTracking(code, controller.signal) : Promise.resolve(null);
    request.then((value) => { if (!controller.signal.aborted) { setOrder(value); setLoading(false); } }).catch(() => { if (!controller.signal.aborted) { setError("No pudimos consultar el pedido. Vuelve a intentarlo."); setLoading(false); } });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    const change = () => { setOrder(null); setLoading(true); setError(""); setRevision((value) => value + 1); };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const current = ORDER_STEPS.findIndex((step) => step.status === order?.status);
  return <div className="min-h-dvh bg-white text-neutral-950">
    <header className="bg-black text-white px-5 sm:px-8 py-5"><div className="max-w-4xl mx-auto flex items-center justify-between"><Logo inverted /><Link href="/catalogo/" className="text-xs text-neutral-300 hover:text-white">Catálogo</Link></div></header>
    <main className="max-w-2xl mx-auto px-5 py-12 sm:py-20">
      <div className="flex items-center gap-3"><Package className="w-6 h-6" /><h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Tu pedido</h1></div>
      {loading ? <div role="status" className="mt-8 space-y-4 animate-pulse"><div className="h-6 w-2/3 bg-neutral-100 rounded" /><div className="h-24 bg-neutral-100 rounded-xl" /><span className="sr-only">Consultando pedido</span></div> : error ? <p role="alert" className="mt-6 text-sm text-neutral-600">{error}</p> : !order ? <div className="mt-8 space-y-3"><h2 className="font-semibold">Este enlace no está disponible</h2><p className="text-sm text-neutral-500 leading-6">Puede haber caducado o sido renovado. Solicita a PulsoTech el enlace actualizado de tu pedido.</p></div> : <>
        <div className="border-b border-neutral-200 py-6 mt-3"><h2 className="text-lg font-medium">{order.productName}</h2><p className="text-sm text-neutral-500 mt-1">{order.quantity} {order.quantity === 1 ? "unidad" : "unidades"}</p></div>
        {order.status === "cancelled" ? <p className="mt-8 font-semibold">Pedido cancelado</p> : <ol aria-label="Estado del pedido" className="mt-8 space-y-0">{ORDER_STEPS.map((step, index) => <li key={step.status} aria-current={index === current ? "step" : undefined} className="flex items-stretch gap-4"><div className="flex flex-col items-center"><span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs ${index <= current ? "bg-black text-white" : "bg-neutral-100 text-neutral-400"}`}>{index < current ? <Check className="w-4 h-4" /> : index + 1}</span>{index < ORDER_STEPS.length - 1 && <span className={`w-px flex-1 min-h-8 ${index < current ? "bg-black" : "bg-neutral-200"}`} />}</div><p className={`pt-1.5 pb-8 text-sm ${index === current ? "font-semibold" : index < current ? "text-neutral-700" : "text-neutral-400"}`}>{step.label}</p></li>)}</ol>}
        <p className="text-xs text-neutral-500 leading-5 mt-4">El estado se actualiza cuando PulsoTech registra el avance de la entrega.</p>
      </>}
      {!loading && (order || error) && <button type="button" onClick={() => { setLoading(true); setError(""); setRevision((value) => value + 1); }} className="mt-6 min-h-11 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"><RefreshCw className="w-4 h-4" />Actualizar estado</button>}
    </main>
  </div>;
}
