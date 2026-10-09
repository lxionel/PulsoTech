"use client";

import { productHref } from "@/lib/catalog-links";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import { colorImages } from "@/lib/product-media";
import { useProducts } from "@/context/ProductsContext";
import { canAcceptOrders } from "@/lib/commerce";
import Logo from "@/components/Logo";
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
  Check,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
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
    checkoutDraft,
    setCheckoutDraft,
    isCartLoading,
  } = useCart();

  const { products, commerceSettings, commerceReady, canReceiveOrders } = useProducts();
  const ordersBlocked = !commerceReady || !canAcceptOrders(commerceSettings);
  const { customerName, customerAddress, customerReference, paymentMethod } = checkoutDraft;
  const [errorMsg, setErrorMsg] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponNotice, setCouponNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const checkoutInProgress = useRef(false);
  const [readyCheckout, setReadyCheckout] = useState<{ url: string; signature: string } | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"bag" | "delivery">("bag");
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const checkoutSignature = JSON.stringify({
    items: items.map((item) => [item.product.id, item.selectedColor?.name, item.quantity, item.product.price]),
    total, coupon: appliedCoupon?.code, whatsappNumber, customerName, customerAddress, customerReference, paymentMethod,
  });
  const money = (amount: number) => STORE_SETTINGS.currencySymbol + amount.toFixed(2);
  const hasDiscount = Boolean(appliedCoupon && discountAmount > 0);
  const closeCart = () => { if (!isCheckingStock) setIsCartOpen(false); };
  const changeStep = (next: "bag" | "delivery") => {
    setCheckoutStep(next);
    setErrorMsg("");
    setReadyCheckout(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    pageHeading.current?.focus({ preventScroll: true });
  };

  const updateDraft = (field: "customerName" | "customerAddress" | "customerReference", value: string) => {
    setCheckoutDraft((previous) => ({ ...previous, [field]: value }));
    setErrorMsg("");
  };
  const suggestedProducts = products.filter((product) => product.inStock !== false && product.stockCount > 0).slice(0, 3);

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput.trim());
    setCouponNotice({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCodeInput("");
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (ordersBlocked) { setErrorMsg("Los pedidos todavía no están habilitados."); return; }
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
      if (!canReceiveOrders()) {
        popup?.close();
        setErrorMsg("Los pedidos no están disponibles en este momento.");
        return;
      }

      const lines: string[] = [
        `Hola, PulsoTech. Mi nombre es ${customerName.trim()} y me gustaría realizar el siguiente pedido:`,
        "",
      ];

      verified.items.forEach((item) => {
        const color = item.product.colors?.length ? item.selectedColor?.name : undefined;
        lines.push(
          `${item.quantity} ${item.quantity === 1 ? "unidad" : "unidades"} de ${item.product.name}${color ? `, en color ${color}` : ""}.`
        );
      });

      const discountNote = verified.coupon && verified.discountAmount > 0
        ? ` Este importe incluye un descuento de ${money(verified.discountAmount)} con el cupón ${verified.coupon.code}.`
        : "";
      lines.push("", `El total de los productos indicado en la web es de ${money(verified.total)}.${discountNote}`);
      lines.push("", `La entrega sería en ${customerAddress.trim()}.`);
      if (customerReference.trim()) lines.push(`Como referencia: ${customerReference.trim()}.`);
      lines.push(`Preferiría pagar ${paymentMethod === "contra_entrega" ? "contra entrega" : "por transferencia"}.`);
      lines.push("", "¿Podrían confirmarme la disponibilidad, el costo de envío y la fecha de entrega? Muchas gracias.");

      const message = lines.join("\n");
      const encoded = encodeURIComponent(message);
      const cleanNumber = verified.whatsappNumber;
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

  const checkoutAction = () => <>
    <button
      type={checkoutStep === "bag" ? "button" : "submit"}
      form={checkoutStep === "delivery" ? "cart-delivery-form" : undefined}
      onClick={checkoutStep === "bag" ? (event) => { event.preventDefault(); changeStep("delivery"); } : undefined}
      disabled={(checkoutStep === "delivery" && ordersBlocked) || isCheckingStock || isInventoryLoading || stockIssues.size > 0}
      aria-busy={isCheckingStock}
      className="w-full min-h-12 px-4 py-3 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {checkoutStep === "delivery" && <MessageCircle aria-hidden="true" className="w-[18px] h-[18px]" />}
      <span>{isCheckingStock ? "Comprobando stock…" : isInventoryLoading ? "Cargando disponibilidad…" : checkoutStep === "bag" ? "Continuar" : ordersBlocked ? "Pedidos no disponibles" : "Pedir por WhatsApp"}</span>
      {checkoutStep === "bag" && <ArrowRight aria-hidden="true" className="w-4 h-4" />}
    </button>
    {stockIssues.size > 0 && <p role="status" className="text-xs text-neutral-600">Corrige o retira los productos marcados para continuar.</p>}
    {readyCheckout?.signature === checkoutSignature && !ordersBlocked && stockIssues.size === 0 && <a href={readyCheckout.url} target="_blank" rel="noopener noreferrer" className="block min-h-11 text-center text-sm font-semibold underline underline-offset-4">Abrir pedido en WhatsApp</a>}
  </>;

  return (
    <div className="store-cart-page min-h-dvh flex flex-col bg-white text-neutral-950">
      <header className="border-b border-white/10 bg-black text-white pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 sm:min-h-20 flex items-center justify-between gap-4">
          <Logo inverted size="sm" />
          <button type="button" disabled={isCheckingStock} onClick={closeCart} aria-label="Seguir comprando" className="min-h-11 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white cursor-pointer disabled:opacity-50">
            <ArrowLeft aria-hidden="true" className="w-5 h-5" /><span className="hidden sm:inline">Seguir comprando</span>
          </button>
        </div>
      </header>

      <main className={"flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-10 " + (items.length ? "pb-44 lg:pb-16" : "pb-12 sm:pb-16")}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-6 sm:pb-8 border-b border-neutral-200">
          <div>
            <h1 ref={pageHeading} tabIndex={-1} className="text-3xl sm:text-4xl font-semibold tracking-tight outline-none">{checkoutStep === "delivery" && items.length ? "Entrega" : "Tu bolsa"}</h1>
            {!isCartLoading && <p className="text-sm text-neutral-500 mt-2">{itemsCount} {itemsCount === 1 ? "unidad" : "unidades"}</p>}
          </div>
          {!!items.length && <ol aria-label="Pasos del pedido" className="flex items-center gap-3 sm:gap-4 text-sm">
            <li aria-current={checkoutStep === "bag" ? "step" : undefined}>
              <button type="button" disabled={isCheckingStock} onClick={() => changeStep("bag")} className="min-h-11 inline-flex items-center gap-2 cursor-pointer font-medium">
                <span className="w-7 h-7 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs">{checkoutStep === "delivery" ? <Check aria-hidden="true" className="w-4 h-4" /> : "1"}</span>Bolsa
              </button>
            </li>
            <li aria-hidden="true" className="w-10 sm:w-14 h-px bg-neutral-200" />
            <li aria-current={checkoutStep === "delivery" ? "step" : undefined}>
              <button type="button" disabled={isCheckingStock || isInventoryLoading || stockIssues.size > 0} onClick={() => changeStep("delivery")} className={"min-h-11 inline-flex items-center gap-2 cursor-pointer font-medium " + (checkoutStep === "delivery" ? "text-neutral-950" : "text-neutral-500")}>
                <span className={"w-7 h-7 rounded-full flex items-center justify-center text-xs " + (checkoutStep === "delivery" ? "bg-neutral-950 text-white" : "border border-neutral-300")}>2</span>Entrega
              </button>
            </li>
          </ol>}
        </div>

        {stockNotice && <div role="status" className="flex items-start gap-3 p-4 mt-5 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-700">
          <p className="flex-1 leading-6">{stockNotice}</p>
          <button type="button" onClick={clearStockNotice} aria-label="Cerrar aviso de disponibilidad" className="shrink-0 min-w-11 min-h-11 -mt-2 -mr-2 flex items-center justify-center cursor-pointer"><X aria-hidden="true" className="w-4 h-4" /></button>
        </div>}
        {isCartLoading ? <div role="status" className="py-12 space-y-5">
          <span className="sr-only">Cargando tu bolsa</span>
          <div className="h-32 rounded-xl bg-neutral-100 animate-pulse" />
          <div className="h-12 w-1/2 rounded-lg bg-neutral-100 animate-pulse" />
        </div> : !items.length ? <>
          <section aria-label="Bolsa vacía" className="text-center py-12 sm:py-16">
            <div className="mx-auto w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-5"><ShoppingBag aria-hidden="true" className="w-8 h-8 text-neutral-500" /></div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Tu bolsa está vacía</h2>
            <p className="text-sm text-neutral-500 mt-3">Encuentra tus próximos audífonos y accesorios.</p>
            <Link href="/#catalogo" className="inline-flex items-center justify-center min-h-12 mt-6 px-7 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold">Ver catálogo</Link>
          </section>
          {suggestedProducts.length > 0 && <section className="border-t border-neutral-200 pt-7 sm:pt-9">
            <h2 className="text-lg font-semibold mb-5">Explora la tienda</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedProducts.map((product) => <Link key={product.id} href={productHref(product)} className="flex items-center gap-5 p-4 sm:p-5 rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors">
                <img src={getAssetUrl(product.images?.[0] || "/placeholder-earbuds.svg")} alt="" className="w-24 h-24 object-contain shrink-0" />
                <div className="min-w-0"><h3 className="text-sm font-semibold leading-6">{product.name}</h3><p className="text-sm mt-2 tabular-nums">{money(product.price)}</p></div>
              </Link>)}
            </div>
          </section>}
        </> : <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 pt-6 sm:pt-8 items-start">
          <section aria-label={checkoutStep === "bag" ? "Productos de tu bolsa" : "Datos de entrega"} className="min-w-0">
            {checkoutStep === "bag" ? <>
              <div className="divide-y divide-neutral-200 border-b border-neutral-200">
                {items.map((item) => {
                  const imgUrl = colorImages(item.selectedColor)[0] || item.product.images?.[0] || "/placeholder-earbuds.svg";
                  const colorName = item.selectedColor?.name || "Original";
                  const stockIssue = stockIssues.get(item.product.id + ":" + colorName);
                  const limit = quantityLimit(item.product.id, colorName);
                  const itemHref = productHref(item.product);
                  return <article key={item.product.id + "-" + colorName} className="relative grid grid-cols-[64px_minmax(0,1fr)] min-[360px]:grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[128px_minmax(0,1fr)] gap-x-3 min-[360px]:gap-x-4 sm:gap-x-6 py-5 sm:py-6 first:pt-0">
                    <Link href={itemHref} aria-label={"Ver " + item.product.name} className="row-span-2 w-16 h-20 min-[360px]:w-20 min-[360px]:h-24 sm:w-32 sm:h-36 flex items-center justify-center rounded-xl bg-neutral-50 overflow-hidden">
                      <img src={getAssetUrl(imgUrl)} alt={item.product.name} className="w-auto h-auto max-w-full max-h-full object-contain p-2" />
                    </Link>
                    <div className="min-w-0 pr-9">
                      <p className="hidden sm:block text-xs text-neutral-500 uppercase tracking-wide mb-1">{item.product.brand}</p>
                      <Link href={itemHref} className="block text-sm sm:text-base font-semibold leading-6 hover:underline underline-offset-4">{item.product.name}</Link>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-2 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full border border-neutral-300" style={{ backgroundColor: item.selectedColor?.hex }} aria-hidden="true" />{colorName}</p>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1 tabular-nums">{money(item.product.price)} / unidad</p>
                    </div>
                    <button type="button" disabled={isCheckingStock} onClick={() => removeItem(item.product.id, colorName)} aria-label={"Eliminar " + item.product.name + ", " + colorName} title="Eliminar producto" className="absolute right-0 top-3 first:top-0 min-w-11 min-h-11 inline-flex items-center justify-center text-neutral-500 hover:text-red-700 cursor-pointer"><Trash2 aria-hidden="true" className="w-4 h-4" /></button>
                    <div className="col-start-2 mt-4">
                      <div role="group" aria-label={"Cantidad de " + item.product.name + ", " + colorName} className="inline-flex items-center rounded-lg border border-neutral-300">
                        <button type="button" disabled={isCheckingStock || isInventoryLoading || item.quantity <= 1} aria-label={"Reducir cantidad de " + item.product.name + ", " + colorName} onClick={() => updateQuantity(item.product.id, colorName, item.quantity - 1)} className="w-11 h-11 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><Minus aria-hidden="true" className="w-3.5 h-3.5" /></button>
                        <span className="min-w-6 text-center text-sm font-medium tabular-nums" aria-label={"Cantidad: " + item.quantity}>{item.quantity}</span>
                        <button type="button" disabled={isCheckingStock || isInventoryLoading || item.quantity >= limit || Boolean(stockIssue)} aria-label={"Aumentar cantidad de " + item.product.name + ", " + colorName} title={item.quantity >= limit ? "Has alcanzado el stock disponible" : "Aumentar cantidad"} onClick={() => updateQuantity(item.product.id, colorName, item.quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><Plus aria-hidden="true" className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {stockIssue && <p role="status" className="col-span-2 mt-3 text-sm text-red-700">{stockIssue}</p>}
                  </article>;
                })}
              </div>
              <div className="flex items-start gap-3 py-5 text-sm text-neutral-500"><Truck aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5" /><p className="leading-6">La fecha y el costo de entrega se coordinan por WhatsApp.</p></div>
            </> : <>
              <button type="button" disabled={isCheckingStock} onClick={() => changeStep("bag")} className="inline-flex items-center gap-2 min-h-11 mb-3 text-sm text-neutral-500 hover:text-neutral-950 cursor-pointer"><ArrowLeft aria-hidden="true" className="w-4 h-4" />Editar bolsa</button>
              <form id="cart-delivery-form" onSubmit={(event) => { event.preventDefault(); void handleWhatsAppCheckout(); }} className="space-y-7">
                <fieldset className="space-y-5">
                  <legend className="text-lg font-semibold mb-5">¿Dónde entregamos tu pedido?</legend>
                  <label className="block text-sm font-medium" htmlFor="cart-customer-name">Nombre completo<input id="cart-customer-name" required autoComplete="name" maxLength={150} disabled={isCheckingStock} placeholder="Nombre y apellidos" value={customerName} onChange={(event) => updateDraft("customerName", event.target.value)} className="block w-full mt-2 px-4 min-h-12 rounded-lg border border-neutral-300 text-base font-normal focus:outline-2 focus:outline-offset-2 focus:outline-neutral-950" /></label>
                  <label className="block text-sm font-medium" htmlFor="cart-customer-address">Dirección de entrega<input id="cart-customer-address" required autoComplete="street-address" maxLength={300} disabled={isCheckingStock} placeholder="Calle, número, urbanización" value={customerAddress} onChange={(event) => updateDraft("customerAddress", event.target.value)} className="block w-full mt-2 px-4 min-h-12 rounded-lg border border-neutral-300 text-base font-normal focus:outline-2 focus:outline-offset-2 focus:outline-neutral-950" /></label>
                  <label className="block text-sm font-medium" htmlFor="cart-customer-reference">Referencia <span className="font-normal text-neutral-500">(opcional)</span><input id="cart-customer-reference" maxLength={300} disabled={isCheckingStock} placeholder="Ej.: frente al parque, puerta azul" value={customerReference} onChange={(event) => updateDraft("customerReference", event.target.value)} className="block w-full mt-2 px-4 min-h-12 rounded-lg border border-neutral-300 text-base font-normal focus:outline-2 focus:outline-offset-2 focus:outline-neutral-950" /></label>
                </fieldset>
                <fieldset>
                  <legend className="text-lg font-semibold mb-4">Forma de pago</legend>
                  <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                    {([['contra_entrega', 'Contra entrega', Truck], ['transferencia', 'Transferencia', Wallet]] as const).map(([value, label, Icon]) => <label key={value} className={"min-h-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3 sm:flex sm:gap-3 sm:p-4 rounded-lg border cursor-pointer " + (paymentMethod === value ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400")}>
                      <Icon aria-hidden="true" className="w-5 h-5 shrink-0 text-neutral-600" />
                      <span className="order-3 col-span-2 min-w-0 text-sm font-medium sm:order-none sm:flex-1">{label}</span>
                      <input type="radio" name="payment-method" value={value} checked={paymentMethod === value} disabled={isCheckingStock} onChange={() => setCheckoutDraft((previous) => ({ ...previous, paymentMethod: value }))} className="order-2 sm:order-none w-4 h-4 accent-neutral-950 shrink-0" />
                    </label>)}
                  </div>
                </fieldset>
                <p className="text-sm leading-6 text-neutral-500">Revisaremos tu pedido y coordinaremos la entrega y el pago por WhatsApp.</p>
                {errorMsg && <p role="alert" className="text-sm font-medium text-red-700">{errorMsg}</p>}
              </form>
            </>}
          </section>

          <aside aria-label="Resumen del pedido" className="min-w-0 border-t border-neutral-200 pt-5 lg:sticky lg:top-6 lg:rounded-xl lg:border lg:bg-neutral-50/70 lg:p-6">
            <h2 className={"text-xl font-semibold tracking-tight " + (checkoutStep === "bag" ? "hidden lg:block" : "")}>Resumen</h2>
            {checkoutStep === "delivery" && <div className="mt-5 space-y-4 pb-5 border-b border-neutral-200">
              {items.map((item) => <div key={item.product.id + item.selectedColor?.name} className="flex items-center gap-3">
                <img src={getAssetUrl(colorImages(item.selectedColor)[0] || item.product.images?.[0] || "/placeholder-earbuds.svg")} alt="" className="w-12 h-14 shrink-0 object-contain rounded-md bg-white p-1" />
                <div className="min-w-0 flex-1"><p className="text-xs font-medium leading-5">{item.product.name}</p><p className="text-xs text-neutral-500 mt-1">{item.selectedColor?.name || "Original"} · {item.quantity} {item.quantity === 1 ? "ud." : "uds."}</p></div>
                <span className="text-xs tabular-nums shrink-0 text-neutral-500">{money(item.product.price)} / ud.</span>
              </div>)}
            </div>}
            <dl className={(checkoutStep === "delivery" ? "mt-5" : "lg:mt-5") + " space-y-3 text-sm"}>
              {hasDiscount && <>
                <div className="flex justify-between gap-4"><dt className="text-neutral-600">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
                <div className="flex justify-between gap-4 text-emerald-700"><dt>Descuento · {appliedCoupon?.code}</dt><dd className="tabular-nums">−{money(discountAmount)}</dd></div>
              </>}
              <div className="flex justify-between gap-4"><dt className="text-neutral-600">Entrega</dt><dd className="text-neutral-500">Por coordinar</dd></div>
              <div className="hidden lg:flex justify-between items-baseline gap-4 pt-5 border-t border-neutral-200"><dt className="font-semibold">Total de productos</dt><dd aria-live="polite" aria-atomic="true" className="text-2xl font-semibold tracking-tight tabular-nums">{money(total)}</dd></div>
            </dl>
            <details className="group mt-5 border-t border-neutral-200" open={appliedCoupon ? true : undefined}>
              <summary className="min-h-12 flex items-center justify-between gap-2 text-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2"><Tag aria-hidden="true" className="w-4 h-4 text-neutral-500" />{appliedCoupon ? "Cupón: " + appliedCoupon.code : "Añadir cupón"}</span>
                <ChevronDown aria-hidden="true" className="w-4 h-4 text-neutral-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-3 space-y-3">
                {appliedCoupon ? <div className="flex justify-between items-center gap-3 text-sm"><p className={discountAmount > 0 ? "text-emerald-700" : "text-neutral-600"}>{discountAmount > 0 ? "Descuento aplicado" : appliedCoupon.minPurchase && subtotal < appliedCoupon.minPurchase ? "Compra mínima: " + money(appliedCoupon.minPurchase) : "El cupón no se aplica a esta bolsa."}</p><button type="button" disabled={isCheckingStock} onClick={() => { removeCoupon(); setCouponNotice(null); }} className="shrink-0 min-h-11 font-medium underline underline-offset-4 cursor-pointer">Quitar cupón</button></div> : <div className="flex items-center gap-2">
                  <input aria-label="Código de cupón" disabled={isCheckingStock} placeholder="Código de cupón" value={couponCodeInput} onChange={(event) => { setCouponCodeInput(event.target.value.toUpperCase()); setCouponNotice(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleApplyCoupon(); } }} className="min-w-0 flex-1 px-3 rounded-lg border border-neutral-300 text-base uppercase h-12 bg-white focus:outline-2 focus:outline-offset-2 focus:outline-neutral-950" />
                  <button type="button" disabled={isCheckingStock || !couponCodeInput.trim()} onClick={handleApplyCoupon} className="min-h-12 px-4 rounded-lg bg-neutral-950 text-white text-sm font-semibold cursor-pointer disabled:opacity-40">Aplicar</button>
                </div>}
                {couponNotice && (!appliedCoupon || couponNotice.isError) && <p role="status" className={"text-sm " + (couponNotice.isError ? "text-red-700" : "text-emerald-700")}>{couponNotice.text}</p>}
              </div>
            </details>
            <div className="hidden lg:block space-y-3 mt-3">{checkoutAction()}</div>
          </aside>
        </div>}
      </main>

      <footer className={"border-t border-neutral-200 text-xs text-neutral-500 " + (items.length ? "hidden lg:block" : "")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4"><p>© {new Date().getFullYear()} PulsoTech</p><div className="flex gap-5"><Link href="/garantia-y-entregas/" className="hover:text-black">Garantía y entregas</Link><Link href="/privacidad/" className="hover:text-black">Privacidad</Link></div></div>
      </footer>
      {!!items.length && !isCartLoading && <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-neutral-200 bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] space-y-3">
        <div className="flex items-center justify-between gap-3"><span className="text-sm text-neutral-600">Total de productos</span><span aria-live="polite" aria-atomic="true" className="text-xl font-semibold tabular-nums">{money(total)}</span></div>
        {checkoutAction()}
      </div>}
    </div>
  );
}
