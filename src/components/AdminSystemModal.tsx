"use client";

import React, { useState } from "react";
import { PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import {
  X,
  TrendingUp,
  Package,
  DollarSign,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  Phone,
  Layers,
  Save,
  ShoppingBag,
} from "lucide-react";

interface SaleRecord {
  id: string;
  productName: string;
  quantity: number;
  total: number;
  channel: "WhatsApp" | "Presencial" | "Web";
  customerName: string;
  date: string;
}

export default function AdminSystemModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { whatsappNumber, setWhatsappNumber } = useCart();
  const [phoneInput, setPhoneInput] = useState(whatsappNumber);
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Inventario en memoria editable
  const [inventory, setInventory] = useState(
    PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stockCount,
      category: p.category,
    }))
  );

  // Registro de ventas simulado
  const [sales, setSales] = useState<SaleRecord[]>([
    {
      id: "VTA-1001",
      productName: "Redmi Buds 6 Play",
      quantity: 1,
      total: 49.00,
      channel: "WhatsApp",
      customerName: "Carlos Méndez",
      date: "Hoy, 14:20",
    },
    {
      id: "VTA-1002",
      productName: "Redmi Buds 8 Lite",
      quantity: 2,
      total: 178.00,
      channel: "WhatsApp",
      customerName: "Mariana Rivas",
      date: "Hoy, 11:05",
    },
    {
      id: "VTA-1003",
      productName: "Redmi Buds 7S",
      quantity: 1,
      total: 139.00,
      channel: "Presencial",
      customerName: "Lucas Benítez",
      date: "Ayer, 18:40",
    },
  ]);

  // Formulario de venta rápida
  const [newSaleProduct, setNewSaleProduct] = useState(inventory[0]?.id || "");
  const [newSaleQty, setNewSaleQty] = useState(1);
  const [newSaleCustomer, setNewSaleCustomer] = useState("");
  const [newSaleChannel, setNewSaleChannel] = useState<"WhatsApp" | "Presencial">("WhatsApp");
  const [successNotice, setSuccessNotice] = useState("");

  if (!isOpen) return null;

  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalUnitsSold = sales.reduce((acc, s) => acc + s.quantity, 0);
  const lowStockCount = inventory.filter((item) => item.stock <= 5).length;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsappNumber(phoneInput);
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 3000);
  };

  const handleStockChange = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
      )
    );
  };

  const handleRecordManualSale = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = inventory.find((i) => i.id === newSaleProduct);
    if (!prod) return;

    if (prod.stock < newSaleQty) {
      alert("No hay suficiente stock para registrar esta venta.");
      return;
    }

    // Descontar inventario
    setInventory((prev) =>
      prev.map((item) =>
        item.id === prod.id ? { ...item, stock: item.stock - newSaleQty } : item
      )
    );

    // Registrar venta
    const newRecord: SaleRecord = {
      id: `VTA-${1000 + sales.length + 1}`,
      productName: prod.name,
      quantity: newSaleQty,
      total: prod.price * newSaleQty,
      channel: newSaleChannel,
      customerName: newSaleCustomer.trim() || "Cliente WhatsApp",
      date: "Justo ahora",
    };

    setSales([newRecord, ...sales]);
    setNewSaleCustomer("");
    setNewSaleQty(1);
    setSuccessNotice(`¡Venta #${newRecord.id} registrada! Se descontó el inventario.`);
    setTimeout(() => setSuccessNotice(""), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Sistema de Ventas & Stock PulsoTech</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Panel de Administración
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Control de inventario en tiempo real, registro de pedidos por WhatsApp y métricas comerciales.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-neutral-400 font-mono uppercase">Ventas Totales</span>
              <div className="text-2xl font-bold font-mono text-white">
                ${totalRevenue.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-neutral-400 font-mono uppercase">Audífonos Vendidos</span>
              <div className="text-2xl font-bold font-mono text-white">
                {totalUnitsSold} <span className="text-sm font-normal text-neutral-400">unidades</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-neutral-400 font-mono uppercase">Alertas de Stock Bajo</span>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {lowStockCount} <span className="text-sm font-normal text-neutral-400">modelos</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Configuration Bar */}
        <form
          onSubmit={handleSavePhone}
          className="mb-8 p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Número de WhatsApp para recibir pedidos
              </h4>
              <p className="text-xs text-neutral-400">
                Aquí llegarán automáticamente los pedidos armados por los clientes en la tienda web.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Ej: 5491123456789"
              className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-blue-500 w-full sm:w-44"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>
        </form>

        {phoneSaved && (
          <div className="mb-4 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>¡Número de WhatsApp actualizado! La web ahora enviará los pedidos a este número.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Inventory Manager (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-400" />
                <span>Control de Inventario en Tiempo Real</span>
              </h3>
              <span className="text-xs text-neutral-500 font-mono">
                {inventory.length} referencias
              </span>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 overflow-hidden bg-neutral-900/30">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Modelo</th>
                    <th className="py-3 px-3">Precio</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-4 text-right">Ajuste Rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white font-sans">{item.name}</div>
                        <span className="text-[10px] text-neutral-500 uppercase">{item.category}</span>
                      </td>
                      <td className="py-3 px-3 text-white font-bold">${item.price.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.stock <= 4
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {item.stock} uds
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 border border-neutral-800 rounded-lg p-0.5 bg-neutral-950">
                          <button
                            onClick={() => handleStockChange(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white"
                            title="Restar 1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleStockChange(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white"
                            title="Sumar 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Manual Sale Entry & Recent Log (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Sale Form */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Registrar Venta Directa (WhatsApp / Local)</span>
              </h3>

              {successNotice && (
                <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                  {successNotice}
                </div>
              )}

              <form onSubmit={handleRecordManualSale} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">
                    Audífono vendido:
                  </label>
                  <select
                    value={newSaleProduct}
                    onChange={(e) => setNewSaleProduct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600"
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (${item.price.toFixed(2)}) - Stock: {item.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">
                      Cantidad:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newSaleQty}
                      onChange={(e) => setNewSaleQty(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">
                      Canal:
                    </label>
                    <select
                      value={newSaleChannel}
                      onChange={(e) =>
                        setNewSaleChannel(e.target.value as "WhatsApp" | "Presencial")
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Presencial">Presencial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">
                    Nombre del Cliente:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Laura Gómez"
                    value={newSaleCustomer}
                    onChange={(e) => setNewSaleCustomer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none placeholder-neutral-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Descontar Stock y Registrar Venta</span>
                </button>
              </form>
            </div>

            {/* Recent Sales History */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-neutral-400 block">
                Últimas Ventas Registradas:
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sales.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-neutral-900 bg-neutral-900/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{s.productName}</div>
                      <div className="text-[11px] text-neutral-400">
                        {s.customerName} • <span className="text-blue-400">{s.channel}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-white">${s.total.toFixed(2)}</div>
                      <div className="text-[10px] text-neutral-500">{s.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
