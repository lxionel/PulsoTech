"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { STORE_SETTINGS } from "@/data/products";
import confetti from "canvas-confetti";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageSquare,
} from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    shipping,
    total,
    itemsCount,
    freeShippingRemaining,
    whatsappNumber,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"contra_entrega" | "transferencia">("contra_entrega");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isCartOpen) return null;

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
      `🛍️ *PEDIDO EN PULSOTECH*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Cliente:* ${customerName.trim()}`,
      `📍 *Dirección de Entrega:* ${customerAddress.trim()}`,
      `💳 *Pago:* ${paymentMethod === "contra_entrega" ? "Contra Entrega" : "Transferencia Bancaria"}`,
      ``,
      `📦 *ARTÍCULOS:*`,
    ];

    items.forEach((item) => {
      lines.push(
        `• ${item.quantity}x ${item.product.name} (${item.selectedColor.name}) - ${STORE_SETTINGS.currencySymbol}${(
          item.product.price * item.quantity
        ).toFixed(2)}`
      );
    });

    lines.push(``);
    lines.push(`🚚 *Envío:* ${shipping === 0 ? "GRATIS" : `${STORE_SETTINGS.currencySymbol}${shipping.toFixed(2)}`}`);
    lines.push(`💰 *TOTAL A PAGAR:* ${STORE_SETTINGS.currencySymbol}${total.toFixed(2)}`);
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

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-neutral-200 p-6 flex flex-col justify-between shadow-2xl relative text-neutral-900">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-950" />
                <h2 className="text-base font-bold tracking-tight text-neutral-950">Bolsa de Compra</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-semibold">
                  {itemsCount} {itemsCount === 1 ? "artículo" : "artículos"}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping bar */}
            <div className="py-3 border-b border-neutral-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-neutral-700 font-medium">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  {freeShippingRemaining === 0 ? (
                    <strong className="text-emerald-600">¡Tienes Envío Gratis!</strong>
                  ) : (
                    <span>
                      Faltan <strong className="text-neutral-950">{STORE_SETTINGS.currencySymbol}{freeShippingRemaining.toFixed(2)}</strong> para Envío Gratis
                    </span>
                  )}
                </span>
                <span className="text-neutral-400 text-[11px] font-medium">Meta {STORE_SETTINGS.currencySymbol}{STORE_SETTINGS.freeShippingThreshold}</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (subtotal / STORE_SETTINGS.freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
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
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor.name}`}
                  className="flex gap-3.5 p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0">
                    <Image
                      src={item.selectedColor.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-950 truncate">
                      {item.product.name}
                    </h4>
                    <span className="text-[11px] text-neutral-500 block">
                      {item.selectedColor.name}
                    </span>
                    <span className="text-xs font-bold text-neutral-950 mt-1 block">
                      {STORE_SETTINGS.currencySymbol}
                      {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedColor.name)}
                      className="text-neutral-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 border border-neutral-200 rounded-full p-0.5 bg-neutral-50">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.selectedColor.name, item.quantity - 1)
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
                          updateQuantity(item.product.id, item.selectedColor.name, item.quantity + 1)
                        }
                        className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
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
                      💵 Contra Entrega
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
                      🏦 Transferencia
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>
                )}
              </div>

              {/* Price summary */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>Subtotal</span>
                  <span>
                    {STORE_SETTINGS.currencySymbol}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>Envío</span>
                  <span className={shipping === 0 ? "text-emerald-600 font-bold" : ""}>
                    {shipping === 0 ? "GRATIS" : `${STORE_SETTINGS.currencySymbol}${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>
                    {STORE_SETTINGS.currencySymbol}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Checkout Button */}
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white text-white" />
                <span>
                  Pedir por WhatsApp ({STORE_SETTINGS.currencySymbol}
                  {total.toFixed(2)})
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Garantía Total 12 Meses • Pago Seguro</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
