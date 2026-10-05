"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import confetti from "canvas-confetti";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowLeft,
  ArrowRight,
  Truck,
  Wallet,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    discountAmount,
    total,
    itemsCount,
    whatsappNumber,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    stockIssues,
    stockNotice,
    clearStockNotice,
    isCheckingStock,
    isInventoryLoading,
    quantityLimit,
    validateCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"contra_entrega" | "transferencia">("contra_entrega");
  const [errorMsg, setErrorMsg] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponNotice, setCouponNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const checkoutInProgress = useRef(false);
  const [readyCheckout, setReadyCheckout] = useState<{ url: string; signature: string } | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"bag" | "delivery">("bag");
  const closeButton = useRef<HTMLButtonElement>(null);
  const contentPanel = useRef<HTMLDivElement>(null);
  const checkoutSignature = JSON.stringify({
    items: items.map((item) => [item.product.id, item.selectedColor?.name, item.quantity, item.product.price]),
    total, coupon: appliedCoupon?.code, customerName, customerAddress, paymentMethod,
  });

  useBodyScrollLock(isCartOpen);

  useEffect(() => {
    if (!isCartOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    return () => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, [isCartOpen]);

  const closeCart = () => {
    if (isCheckingStock) return;
    setIsCartOpen(false);
    setCheckoutStep("bag");
    setErrorMsg("");
    setReadyCheckout(null);
  };

  const changeStep = (next: "bag" | "delivery") => {
    setCheckoutStep(next);
    setErrorMsg("");
    contentPanel.current?.scrollTo({ top: 0 });
  };

  if (!isCartOpen) return null;

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput.trim());
    setCouponNotice({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCodeInput("");
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (items.length === 0 || checkoutInProgress.current || isInventoryLoading || stockIssues.size > 0) return;

    if (!customerName.trim() || !customerAddress.trim()) {
      setErrorMsg("Ingresa tu nombre y dirección para coordinar el envío.");
      return;
    }

    setErrorMsg("");
    setReadyCheckout(null);
    checkoutInProgress.current = true;
    // Abrir desde el clic mantiene la compatibilidad con los bloqueadores de ventanas.
    let popup: Window | null = null;
    try {
      popup = window.open("about:blank", "_blank");
      if (popup) popup.opener = null;
      const verified = await validateCart();
      if (!verified) {
        popup?.close();
        return;
      }

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignorar si falla canvas
      }

      const lines: string[] = [
        `*PEDIDO EN PULSOTECH*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `• *Cliente:* ${customerName.trim()}`,
        `• *Dirección de Entrega:* ${customerAddress.trim()}`,
        `• *Pago:* ${paymentMethod === "contra_entrega" ? "Contra Entrega" : "Transferencia Bancaria"}`,
        ``,
        `*ARTÍCULOS:*`,
      ];

      verified.items.forEach((item) => {
        const colorName = item.selectedColor?.name || "Original";
        lines.push(
          `• ${item.quantity}x ${item.product.name} (${colorName}) - ${STORE_SETTINGS.currencySymbol}${(
            item.product.price * item.quantity
          ).toFixed(2)}`
        );
      });

      lines.push(``);
      lines.push(`• *Entrega:* A coordinar por WhatsApp`);
      if (appliedCoupon && verified.discountAmount > 0) {
        lines.push(
          `• *Cupón Aplicado:* ${appliedCoupon.code} (-${STORE_SETTINGS.currencySymbol}${verified.discountAmount.toFixed(2)})`
        );
      }
      lines.push(`• *Total de productos:* ${STORE_SETTINGS.currencySymbol}${verified.total.toFixed(2)}`);
      lines.push(`• *Costo de entrega:* A confirmar antes de aceptar el pedido`);
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`¡Hola PulsoTech! Armé este pedido en la web. ¿Tienen disponibilidad para coordinar la entrega?`);

      const message = lines.join("\n");
      const encoded = encodeURIComponent(message);
      const cleanNumber = (whatsappNumber || STORE_SETTINGS.whatsappNumber).replace(/\D/g, "");
      const waUrl = `https://wa.me/${cleanNumber}?text=${encoded}`;

      if (popup && !popup.closed) popup.location.replace(waUrl);
      else setReadyCheckout({ url: waUrl, signature: checkoutSignature });
    } catch {
      popup?.close();
      setErrorMsg("No pudimos abrir tu pedido. Intenta de nuevo.");
    } finally {
      checkoutInProgress.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[3px] flex items-end justify-center sm:justify-end animate-in fade-in duration-200">
      <div className="absolute inset-0" aria-hidden="true" onClick={closeCart} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); closeCart(); }
          if (event.key !== "Tab") return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), summary, [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
        className="store-drawer store-cart-drawer relative flex flex-col w-full max-h-[90dvh] sm:h-dvh sm:max-h-dvh sm:max-w-[440px] rounded-t-3xl sm:rounded-none bg-white shadow-2xl text-neutral-950 overflow-hidden"
      >
        <header className="shrink-0 px-5 pt-3 sm:pt-5 pb-4 border-b border-neutral-100">
          <div className="w-9 h-1 rounded-full bg-neutral-200 mx-auto mb-3 sm:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center"><ShoppingBag className="w-[18px] h-[18px]" /></span>
              <div>
                <h2 id="cart-drawer-title" className="text-lg font-extrabold tracking-tight">{checkoutStep === "bag" || !items.length ? "Tu bolsa" : "Coordinar entrega"}</h2>
                <p className="text-[11px] text-neutral-500">{itemsCount} {itemsCount === 1 ? "unidad" : "unidades"} · Pedido por WhatsApp</p>
              </div>
            </div>
            <button ref={closeButton} type="button" disabled={isCheckingStock} onClick={closeCart} aria-label="Cerrar bolsa" className="w-11 h-11 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black inline-flex items-center justify-center transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          {!!items.length && <ol aria-label="Pasos del pedido" className="flex items-center gap-3 mt-4 text-[11px] font-semibold">
            <li aria-current={checkoutStep === "bag" ? "step" : undefined} className="flex items-center gap-1.5"><span className="rounded-full w-5 h-5 flex items-center justify-center bg-neutral-950 text-white">1</span>Bolsa</li>
            <li className="h-px w-8 bg-neutral-200" aria-hidden="true" />
            <li aria-current={checkoutStep === "delivery" ? "step" : undefined} className={"flex items-center gap-1.5 " + (checkoutStep === "delivery" ? "text-neutral-950" : "text-neutral-400")}><span className={"rounded-full w-5 h-5 flex items-center justify-center " + (checkoutStep === "delivery" ? "bg-neutral-950 text-white" : "bg-neutral-100")}>2</span>Entrega</li>
          </ol>}
        </header>

        <div ref={contentPanel} className="min-h-0 sm:flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
          {stockNotice && <div role="status" className="flex items-start gap-2 p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-700">
            <p className="flex-1 leading-relaxed">{stockNotice}</p>
            <button type="button" onClick={clearStockNotice} aria-label="Cerrar aviso de disponibilidad" className="shrink-0 w-8 flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
          </div>}
          {!items.length ? (
            <div className="flex flex-col items-center text-center py-8 gap-3">
              <ShoppingBag className="w-10 h-10 text-neutral-300" />
              <h3 className="font-bold">Tu bolsa está vacía</h3>
              <p className="text-sm text-neutral-500 max-w-xs">Encuentra tus próximos audífonos y accesorios.</p>
              <Link href="/#catalogo" onClick={closeCart} className="mt-1 inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-neutral-950 text-white text-sm font-bold">Ver catálogo<ArrowRight className="w-4 h-4" /></Link>
            </div>
          ) : checkoutStep === "bag" ? (
            <>
              <div className="space-y-3">
                {items.map((item) => {
                  const imgUrl = item.selectedColor?.image || item.product.images?.[0] || getAssetUrl("/placeholder-earbuds.svg");
                  const colorName = item.selectedColor?.name || "Original";
                  const stockIssue = stockIssues.get(item.product.id + ":" + colorName);
                  const limit = quantityLimit(item.product.id, colorName);
                  const productHref = "/producto/?id=" + encodeURIComponent(item.product.id) + "&slug=" + encodeURIComponent(item.product.slug);
                  return (
                    <article key={item.product.id + "-" + colorName} className="rounded-2xl border border-neutral-200 p-3">
                      <div className="flex items-start gap-3">
                        <Link href={productHref} onClick={closeCart} aria-label={"Ver " + item.product.name} className="relative w-[72px] h-[72px] rounded-xl overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100 p-1">
                          {imgUrl.startsWith("data:") || imgUrl.startsWith("blob:") || imgUrl.startsWith("http") ? <img src={imgUrl} alt={item.product.name} className="w-full h-full object-contain" /> : <Image src={getAssetUrl(imgUrl)} alt={item.product.name} fill className="object-contain" />}
                        </Link>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <Link href={productHref} onClick={closeCart} className="text-sm font-bold leading-snug line-clamp-2 hover:underline underline-offset-2">{item.product.name}</Link>
                          <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-neutral-300" style={{ backgroundColor: item.selectedColor?.hex }} aria-hidden="true" />{colorName}</p>
                          <p className="text-[11px] text-neutral-500 mt-1">{STORE_SETTINGS.currencySymbol}{item.product.price.toFixed(2)} / unidad</p>
                        </div>
                        <button type="button" disabled={isCheckingStock} onClick={() => removeItem(item.product.id, colorName)} aria-label={"Eliminar " + item.product.name + ", " + colorName} title="Eliminar producto" className="shrink-0 w-8 inline-flex items-center justify-center text-neutral-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-3">
                        <div className="flex items-center rounded-xl border border-neutral-200 overflow-hidden">
                          <button type="button" disabled={isCheckingStock || isInventoryLoading || item.quantity <= 1} aria-label={"Reducir cantidad de " + item.product.name + ", " + colorName} onClick={() => updateQuantity(item.product.id, colorName, item.quantity - 1)} className="w-11 h-11 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-sm font-bold min-w-7 text-center" aria-label={"Cantidad: " + item.quantity}>{item.quantity}</span>
                          <button type="button" disabled={isCheckingStock || isInventoryLoading || item.quantity >= limit || Boolean(stockIssue)} aria-label={"Aumentar cantidad de " + item.product.name + ", " + colorName} title={item.quantity >= limit ? "Has alcanzado el stock disponible" : "Aumentar cantidad"} onClick={() => updateQuantity(item.product.id, colorName, item.quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <span className="text-base font-extrabold tabular-nums" aria-label={"Total de " + item.product.name}>{STORE_SETTINGS.currencySymbol}{(Math.round(item.product.price * item.quantity * 100) / 100).toFixed(2)}</span>
                      </div>
                      {stockIssue && <p role="status" className="mt-2 text-xs text-red-700">{stockIssue}</p>}
                    </article>
                  );
                })}
              </div>
              <details className="rounded-xl border border-neutral-200 group" open={appliedCoupon ? true : undefined}>
                <summary className="min-h-11 flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold cursor-pointer list-none">
                  <span className="inline-flex items-center gap-2"><Tag className="w-4 h-4 text-neutral-500" />{appliedCoupon ? "Cupón: " + appliedCoupon.code : "¿Tienes un cupón?"}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-3 pb-3 space-y-2">
                  {appliedCoupon ? <div className="flex justify-between items-center gap-2 text-xs">
                    <p className="text-emerald-700 font-semibold">Descuento aplicado</p>
                    <button type="button" disabled={isCheckingStock} onClick={removeCoupon} className="px-3 font-semibold underline cursor-pointer">Quitar cupón</button>
                  </div> : <div className="flex items-center gap-2">
                    <input aria-label="Código de cupón" disabled={isCheckingStock} placeholder="Código de cupón" value={couponCodeInput} onChange={(event) => { setCouponCodeInput(event.target.value.toUpperCase()); setCouponNotice(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleApplyCoupon(); } }} className="min-w-0 flex-1 px-3 rounded-lg border border-neutral-200 text-sm uppercase h-11 focus:outline-none focus:border-neutral-950" />
                    <button type="button" disabled={isCheckingStock || !couponCodeInput.trim()} onClick={handleApplyCoupon} className="min-h-11 px-3 rounded-lg bg-neutral-950 text-white text-xs font-bold cursor-pointer disabled:opacity-40">Aplicar</button>
                  </div>}
                  {couponNotice && <p role="status" className={"text-xs " + (couponNotice.isError ? "text-red-700" : "text-emerald-700")}>{couponNotice.text}</p>}
                </div>
              </details>
              <Link href="/#catalogo" onClick={closeCart} className="inline-flex items-center gap-1.5 min-h-11 text-xs font-semibold text-neutral-500 hover:text-black"><ArrowLeft className="w-3.5 h-3.5" />Seguir comprando</Link>
            </>
          ) : (
            <div className="space-y-4">
              <button type="button" disabled={isCheckingStock} onClick={() => changeStep("bag")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 cursor-pointer"><ArrowLeft className="w-4 h-4" />Volver a la bolsa</button>
              <div className="space-y-3">
                <label className="block text-xs font-semibold" htmlFor="cart-customer-name">Nombre completo<input id="cart-customer-name" autoComplete="name" maxLength={150} disabled={isCheckingStock} placeholder="¿Quién recibirá el pedido?" value={customerName} onChange={(event) => { setCustomerName(event.target.value); setErrorMsg(""); }} className="block w-full mt-1.5 px-3 h-11 rounded-xl border border-neutral-200 text-sm font-normal focus:outline-none focus:border-neutral-950" /></label>
                <label className="block text-xs font-semibold" htmlFor="cart-customer-address">Dirección de entrega<input id="cart-customer-address" autoComplete="street-address" maxLength={300} disabled={isCheckingStock} placeholder="Calle, número y referencia" value={customerAddress} onChange={(event) => { setCustomerAddress(event.target.value); setErrorMsg(""); }} className="block w-full mt-1.5 px-3 h-11 rounded-xl border border-neutral-200 text-sm font-normal focus:outline-none focus:border-neutral-950" /></label>
              </div>
              <fieldset>
                <legend className="text-xs font-semibold mb-2">Forma de pago</legend>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" aria-pressed={paymentMethod === "contra_entrega"} disabled={isCheckingStock} onClick={() => setPaymentMethod("contra_entrega")} className={"min-h-14 px-2 py-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1.5 cursor-pointer " + (paymentMethod === "contra_entrega" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 hover:border-neutral-400")}><Truck className="w-4 h-4" />Contra entrega</button>
                  <button type="button" aria-pressed={paymentMethod === "transferencia"} disabled={isCheckingStock} onClick={() => setPaymentMethod("transferencia")} className={"min-h-14 px-2 py-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1.5 cursor-pointer " + (paymentMethod === "transferencia" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 hover:border-neutral-400")}><Wallet className="w-4 h-4" />Transferencia</button>
                </div>
              </fieldset>
              <p className="text-[11px] leading-relaxed text-neutral-500 bg-neutral-50 rounded-xl p-3">Coordinaremos disponibilidad, entrega y pago por WhatsApp antes de confirmar tu pedido.</p>
              {errorMsg && <p role="alert" className="text-xs font-medium text-red-700">{errorMsg}</p>}
            </div>
          )}
        </div>

        {!!items.length && <footer className="shrink-0 border-t border-neutral-100 bg-white px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] space-y-3">
          {appliedCoupon && discountAmount > 0 && <div className="space-y-1 text-xs">
            <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{STORE_SETTINGS.currencySymbol}{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-emerald-700"><span>Descuento · {appliedCoupon.code}</span><span>−{STORE_SETTINGS.currencySymbol}{discountAmount.toFixed(2)}</span></div>
          </div>}
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-semibold text-neutral-600">Total de productos</p><p className="text-[10px] text-neutral-500 mt-0.5">Entrega: costo a coordinar</p></div>
            <p aria-live="polite" aria-atomic="true" className="text-xl font-extrabold tabular-nums tracking-tight">{STORE_SETTINGS.currencySymbol}{total.toFixed(2)}</p>
          </div>
          <button type="button" onClick={checkoutStep === "bag" ? () => changeStep("delivery") : handleWhatsAppCheckout} disabled={isCheckingStock || isInventoryLoading || stockIssues.size > 0} aria-busy={isCheckingStock} className="w-full min-h-12 py-3 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {checkoutStep === "delivery" && <MessageCircle className="w-[18px] h-[18px]" />}
            <span>{isCheckingStock ? "Comprobando stock…" : isInventoryLoading ? "Cargando disponibilidad…" : checkoutStep === "bag" ? "Continuar con mi pedido" : "Pedir por WhatsApp"}</span>
            {checkoutStep === "bag" && <ArrowRight className="w-4 h-4" />}
          </button>
          {stockIssues.size > 0 && <p role="status" className="text-[11px] text-neutral-600">Corrige o retira los productos marcados para continuar.</p>}
          {readyCheckout?.signature === checkoutSignature && stockIssues.size === 0 && <a href={readyCheckout.url} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-bold underline underline-offset-4">Abrir pedido en WhatsApp</a>}
        </footer>}
      </section>
    </div>
  );
}
