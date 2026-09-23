"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRODUCTS, STORE_SETTINGS, TECH_CATEGORIES } from "@/data/products";
import { useCart } from "@/context/CartContext";
import {
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
  ArrowLeft,
  ExternalLink,
  Search,
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

export default function AdminPage() {
  const { whatsappNumber, setWhatsappNumber } = useCart();
  const [phoneInput, setPhoneInput] = useState(whatsappNumber);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Inventario en memoria editable
  const [inventory, setInventory] = useState(
    PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stockCount,
      category: p.category,
      brand: p.brand,
    }))
  );

  // Registro de ventas
  const [sales, setSales] = useState<SaleRecord[]>([
    {
      id: "VTA-1001",
      productName: "Pulso Apex One (Negro Mate)",
      quantity: 1,
      total: 89.99,
      channel: "WhatsApp",
      customerName: "Carlos Méndez",
      date: "Hoy, 14:20",
    },
    {
      id: "VTA-1002",
      productName: "Pulso Pods Pro (Blanco)",
      quantity: 2,
      total: 99.98,
      channel: "WhatsApp",
      customerName: "Mariana Rivas",
      date: "Hoy, 11:05",
    },
    {
      id: "VTA-1003",
      productName: "Pulso GaN Turbo 65W",
      quantity: 1,
      total: 34.99,
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

    setInventory((prev) =>
      prev.map((item) =>
        item.id === prod.id ? { ...item, stock: item.stock - newSaleQty } : item
      )
    );

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
    setSuccessNotice(`¡Venta #${newRecord.id} registrada! Se descontaron ${newSaleQty} unidades del stock.`);
    setTimeout(() => setSuccessNotice(""), 4000);
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased">
      {/* Top Admin Header */}
      <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la Tienda Comercial</span>
            </Link>

            <div className="h-4 w-px bg-neutral-800" />

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-white tracking-tight">
                PulsoTech Admin & ERP
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                v1.0
              </span>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white font-medium"
          >
            <span>Ver Tienda en Vivo</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sistema de Ventas & Control de Stock
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Gestiona el inventario de audífonos y accesorios tecnológicos, configura tu WhatsApp de cobro y registra ventas manuales.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/40">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
              <span>INGRESOS REGISTRADOS</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              ${totalRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Ventas acumuladas por WhatsApp y Presencial
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/40">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
              <span>UNIDADES DESPACHADAS</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              {totalUnitsSold} <span className="text-sm font-normal text-neutral-400">artículos</span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              En {sales.length} órdenes procesadas
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/40">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
              <span>ALERTAS DE STOCK</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400">
              {lowStockCount} <span className="text-sm font-normal text-neutral-400">productos</span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Con 5 o menos unidades en bodega
            </span>
          </div>
        </div>

        {/* WhatsApp Setup Card */}
        <form
          onSubmit={handleSavePhone}
          className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Número de WhatsApp Receptor de Pedidos
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cualquier cliente que pulse &quot;Pedir por WhatsApp&quot; en la tienda web te enviará su pedido a este número.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Código de país + número (ej: 5491123456789)"
              className="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 w-full md:w-56"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>
        </form>

        {phoneSaved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>¡Número de WhatsApp actualizado! La web comercial ahora enlaza a este teléfono.</span>
          </div>
        )}

        {/* Main 2-Column Split: Stock vs Manual Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inventory Table (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-neutral-400" />
                  <span>Inventario de Productos & Accesorios</span>
                </h2>
                <span className="text-xs text-neutral-500">
                  {inventory.length} referencias activas
                </span>
              </div>

              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar modelo..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-3">Precio</th>
                    <th className="py-3 px-3">Stock Actual</th>
                    <th className="py-3 px-4 text-right">Ajuste de Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-900/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white font-sans">{item.name}</div>
                        <span className="text-[10px] text-neutral-500 uppercase">{item.category}</span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">${item.price.toFixed(2)}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.stock <= 5
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {item.stock} uds
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 border border-neutral-800 rounded-lg p-0.5 bg-neutral-900">
                          <button
                            onClick={() => handleStockChange(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white"
                            title="Restar 1 unidad"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleStockChange(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white"
                            title="Sumar 1 unidad"
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

          {/* Quick Sale Registration (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Registrar Venta Externa (WhatsApp o Presencial)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Registra pedidos cerrados fuera de la web para descontar las unidades del stock automáticamente.
              </p>

              {successNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  {successNotice}
                </div>
              )}

              <form onSubmit={handleRecordManualSale} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">
                    Producto vendido:
                  </label>
                  <select
                    value={newSaleProduct}
                    onChange={(e) => setNewSaleProduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600"
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (${item.price.toFixed(2)}) - Stock: {item.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">
                      Cantidad:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newSaleQty}
                      onChange={(e) => setNewSaleQty(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:outline-none"
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
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Presencial">Presencial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">
                    Nombre o Teléfono del Cliente:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Sofia Martínez"
                    value={newSaleCustomer}
                    onChange={(e) => setNewSaleCustomer(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none placeholder-neutral-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Procesar Venta y Descontar Stock</span>
                </button>
              </form>
            </div>

            {/* Sales History */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-neutral-400 block">
                Historial de Órdenes Recientes:
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {sales.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-neutral-900 bg-neutral-900/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{s.productName}</div>
                      <div className="text-[11px] text-neutral-400">
                        {s.customerName} • <span className="text-emerald-400">{s.channel}</span>
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
      </main>
    </div>
  );
}
