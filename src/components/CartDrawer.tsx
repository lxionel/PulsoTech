"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import confetti from "canvas-confetti";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
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
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"contra_entrega" | "transferencia">("contra_entrega");
  const [errorMsg, setErrorMsg] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponNotice, setCouponNotice] = useState<{ text: string; isError: boolean } | null>(null);

  // Lock body scroll when cart is open
  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput.trim());
    setCouponNotice({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCodeInput("");
    }
  };

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    if (!customerName.trim() || !customerAddress.trim()) {
      setErrorMsg("Ingresa tu nombre y dirección para coordinar el envío.");
      return;
    }

    setErrorMsg("");

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

    items.forEach((item) => {
      const colorName = item.selectedColor?.name || "Original";
      lines.push(
        `• ${item.quantity}x ${item.product.name} (${colorName}) - ${STORE_SETTINGS.currencySymbol}${(
          item.product.price * item.quantity
        ).toFixed(2)}`
      );
    });

    lines.push(``);
    lines.push(`• *Entrega:* A coordinar por WhatsApp (Contra Entrega)`);
    if (appliedCoupon && discountAmount > 0) {
      lines.push(
        `• *Cupón Aplicado:* ${appliedCoupon.code} (-${STORE_SETTINGS.currencySymbol}${discountAmount.toFixed(2)})`
      );
    }
    lines.push(`• *TOTAL:* ${STORE_SETTINGS.currencySymbol}${total.toFixed(2)}`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`¡Hola PulsoTech! Armé este pedido en la web. ¿Tienen disponibilidad para coordinar la entrega?`);

    const message = lines.join("\n");
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;

    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white sm:border-l border-neutral-200 p-4 sm:p-6 flex flex-col justify-between shadow-2xl relative text-neutral-900 h-full">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-950" />
                <h2 className="text-base font-bold tracking-tight text-neutral-950">Bolsa de Compra</h2>
                <span className="text-xs font-semibold text-neutral-400">
                  ({itemsCount})
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Cerrar bolsa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Tu bolsa está vacía</h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Explora nuestros accesorios tecnológicos y audífonos para armar tu pedido.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => {
                const imgUrl =
                  item.selectedColor?.image ||
                  item.product.images?.[0] ||
                  getAssetUrl("/placeholder-earbuds.svg");
                const colorName = item.selectedColor?.name || "Original";
                return (
                  <div
                    key={`${item.product.id}-${colorName}`}
                    className="flex gap-3.5 p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0 flex items-center justify-center p-1">
                      {imgUrl.startsWith("data:") ||
                      imgUrl.startsWith("blob:") ||
                      imgUrl.startsWith("http") ? (
                        <img
                          src={imgUrl}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Image
                          src={imgUrl}
                          alt={item.product.name}
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-950 truncate">
                        {item.product.name}
                      </h4>
                      <span className="text-[11px] text-neutral-500 block">
                        {colorName}
                      </span>
                      <span className="text-xs font-bold text-neutral-950 mt-1 block">
                        {STORE_SETTINGS.currencySymbol}
                        {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.product.id, colorName)}
                        className="text-neutral-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 border border-neutral-200 rounded-full p-0.5 bg-neutral-50">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, colorName, item.quantity - 1)
                          }
                          className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1 text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, colorName, item.quantity + 1)
                          }
                          className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout Info & Actions */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-neutral-200 space-y-4">
              {/* Customer Inputs */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#fafafc] border border-neutral-200/80">
                <span className="text-xs font-bold text-neutral-750 uppercase tracking-wide block">
                  Datos de Envío:
                </span>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Tu Nombre completo *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-600 shadow-2xs"
                  />
                  <input
                    type="text"
                    placeholder="Dirección de entrega *"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-600 shadow-2xs"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("contra_entrega")}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border text-center transition-colors cursor-pointer ${
                        paymentMethod === "contra_entrega"
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      Contra Entrega
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transferencia")}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border text-center transition-colors cursor-pointer ${
                        paymentMethod === "transferencia"
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      Transferencia
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>
                )}

                {/* Sección de Cupón de Descuento */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Cupón de Descuento</span>
                    </span>
                    {appliedCoupon && (
                      <span className="text-[10px] font-bold text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Activo
                      </span>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                      <div>
                        <div className="font-extrabold text-emerald-900 font-mono">
                          {appliedCoupon.code}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          {appliedCoupon.discountType === "percentage"
                            ? `${appliedCoupon.discountValue}% de descuento aplicado`
                            : `Descuento de ${STORE_SETTINGS.currencySymbol}${appliedCoupon.discountValue.toFixed(2)}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="px-2 py-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Código de cupón"
                        value={couponCodeInput}
                        onChange={(e) => {
                          setCouponCodeInput(e.target.value.toUpperCase());
                          if (couponNotice) setCouponNotice(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold uppercase focus:outline-none focus:border-neutral-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}

                  {couponNotice && (
                    <p
                      className={`text-[11px] font-medium ${
                        couponNotice.isError ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {couponNotice.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Price summary */}
              <div className="space-y-1.5 text-xs py-2 border-t border-neutral-100">
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    {STORE_SETTINGS.currencySymbol}
                    {subtotal.toFixed(2)}
                  </span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span>
                      -{STORE_SETTINGS.currencySymbol}
                      {discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>Envío</span>
                  <span className="text-emerald-700 font-semibold">
                    A coordinar por WhatsApp
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>
                    {STORE_SETTINGS.currencySymbol}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Checkout Button - Ordenado, centrado y profesional */}
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-4 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <svg
                  className="w-5 h-5 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.33 7.04 9.14 7.04 8.97 7.05C8.77 7.06 8.5 7.14 8.28 7.38C8.05 7.63 7.42 8.22 7.42 9.43C7.42 10.64 8.3 11.81 8.43 11.98C8.55 12.15 10.15 14.63 12.61 15.69C13.2 15.94 13.65 16.09 14.01 16.21C14.6 16.4 15.13 16.37 15.55 16.31C16.03 16.24 17.02 15.71 17.23 15.13C17.43 14.55 17.43 14.05 17.37 13.95C17.31 13.85 17.16 13.79 16.94 13.68C16.71 13.57 15.62 13.03 15.42 12.96C15.22 12.88 15.07 12.84 14.92 13.07C14.77 13.3 14.35 13.79 14.22 13.94C14.1 14.09 13.97 14.11 13.75 14C13.52 13.89 12.59 13.58 11.48 12.59C10.62 11.82 10.04 10.87 9.93 10.64C9.81 10.42 9.92 10.29 10.03 10.18C10.14 10.07 10.27 9.89 10.39 9.75C10.5 9.61 10.55 9.5 10.62 9.35C10.7 9.2 10.66 9.07 10.6 8.96C10.55 8.85 10.09 7.72 9.9 7.26C9.72 6.81 9.53 6.87 9.4 6.86L8.97 6.86C8.83 6.86 9.53 7.03 9.53 7.03Z" />
                </svg>
                <span>Pedir por WhatsApp</span>
                <span className="text-xs font-semibold opacity-90">
                  ({STORE_SETTINGS.currencySymbol}{total.toFixed(2)})
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
