"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import { Product, ProductColor } from "@/types";
import Logo from "@/components/Logo";
import {
  TrendingUp,
  Package,
  DollarSign,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  Phone,
  Save,
  ShoppingBag,
  ArrowLeft,
  ExternalLink,
  Search,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Copy,
  RefreshCw,
  Upload,
  Eye,
  Check,
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
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    resetToDefault,
    exportProductsJson,
  } = useProducts();

  // Navegación por pestañas
  const [activeTab, setActiveTab] = useState<"inventory" | "add_product" | "sales" | "settings">("inventory");

  // Estados de WhatsApp
  const [phoneInput, setPhoneInput] = useState(whatsappNumber);
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Filtros de búsqueda en inventario
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedJson, setCopiedJson] = useState(false);

  // Registro de ventas de ejemplo
  const [sales, setSales] = useState<SaleRecord[]>([
    {
      id: "VTA-1001",
      productName: "Redmi Buds 6 Play",
      quantity: 1,
      total: 49.0,
      channel: "WhatsApp",
      customerName: "Carlos Méndez",
      date: "Hoy, 14:20",
    },
    {
      id: "VTA-1002",
      productName: "Redmi Buds 8 Lite",
      quantity: 2,
      total: 178.0,
      channel: "WhatsApp",
      customerName: "Mariana Rivas",
      date: "Hoy, 11:05",
    },
    {
      id: "VTA-1003",
      productName: "Redmi Buds 7S",
      quantity: 1,
      total: 139.0,
      channel: "Presencial",
      customerName: "Lucas Benítez",
      date: "Ayer, 18:40",
    },
  ]);

  // Venta rápida
  const [newSaleProduct, setNewSaleProduct] = useState(products[0]?.id || "");
  const [newSaleQty, setNewSaleQty] = useState(1);
  const [newSaleCustomer, setNewSaleCustomer] = useState("");
  const [newSaleChannel, setNewSaleChannel] = useState<"WhatsApp" | "Presencial">("WhatsApp");
  const [successNotice, setSuccessNotice] = useState("");

  // ====== ESTADO DEL FORMULARIO DE AGREGAR / EDITAR PRODUCTO ======
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("Xiaomi");
  const [formCategory, setFormCategory] = useState<"in-ear" | "over-ear" | "deportivos" | "estudio">("in-ear");
  const [formPrice, setFormPrice] = useState<number>(49.0);
  const [formHasPromo, setFormHasPromo] = useState(false);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(69.0);
  const [formPromoTag, setFormPromoTag] = useState("OFERTA FLASH");
  const [formStock, setFormStock] = useState<number>(15);
  const [formSubtitle, setFormSubtitle] = useState("36h de batería con estuche · Resistencia IPX4");
  const [formDescription, setFormDescription] = useState(
    "Audífonos True Wireless originales con sonido de alta fidelidad, conexión instantánea y batería de larga duración con estuche de carga."
  );
  
  // Por defecto color Blanco como solicitó el usuario
  const [formImage, setFormImage] = useState(getAssetUrl("/images/products/redmi-buds-6-play.png"));
  const [formColorName, setFormColorName] = useState("Blanco");
  const [formColorHex, setFormColorHex] = useState("#FFFFFF");

  // Specs
  const [formSpecBattery, setFormSpecBattery] = useState("36 horas");
  const [formSpecAnc, setFormSpecAnc] = useState("Sin ANC");
  const [formSpecConnectivity, setFormSpecConnectivity] = useState("Bluetooth 5.4");

  // Métricas
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalUnitsSold = sales.reduce((acc, s) => acc + s.quantity, 0);
  const lowStockCount = products.filter((p) => p.stockCount <= 5).length;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsappNumber(phoneInput);
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 3000);
  };

  const handleRecordManualSale = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((i) => i.id === newSaleProduct);
    if (!prod) return;

    if (prod.stockCount < newSaleQty) {
      alert("No hay suficiente stock para registrar esta venta.");
      return;
    }

    updateStock(prod.id, -newSaleQty, true);

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

  // Manejador para subir foto desde archivo local (computadora o celular)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Cargar datos en el formulario para editar
  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setFormName(product.name);
    setFormBrand(product.brand);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormHasPromo(!!product.originalPrice && product.originalPrice > product.price);
    setFormOriginalPrice(product.originalPrice || product.price * 1.25);
    setFormStock(product.stockCount);
    setFormSubtitle(product.subtitle || "");
    setFormDescription(product.description || "");
    setFormImage(product.colors[0]?.image || getAssetUrl("/images/products/redmi-buds-6-play.png"));
    setFormColorName(product.colors[0]?.name || "Blanco");
    setFormColorHex(product.colors[0]?.hex || "#FFFFFF");
    setFormSpecBattery(product.specs?.battery || "30h");
    setFormSpecAnc(product.specs?.anc || "Sin ANC");
    setFormSpecConnectivity(product.specs?.connectivity || "Bluetooth 5.3");
    setActiveTab("add_product");
  };

  // Limpiar formulario para nuevo producto
  const handleNewProductClick = () => {
    setEditingProductId(null);
    setFormName("");
    setFormBrand("Xiaomi");
    setFormCategory("in-ear");
    setFormPrice(49.0);
    setFormHasPromo(false);
    setFormOriginalPrice(69.0);
    setFormStock(15);
    setFormSubtitle("36h de batería con estuche · Resistencia IPX4");
    setFormDescription("Audífonos True Wireless originales con sonido de alta fidelidad y garantía.");
    setFormImage(getAssetUrl("/images/products/redmi-buds-6-play.png"));
    setFormColorName("Blanco");
    setFormColorHex("#FFFFFF");
    setFormSpecBattery("36 horas");
    setFormSpecAnc("Sin ANC");
    setFormSpecConnectivity("Bluetooth 5.4");
    setActiveTab("add_product");
  };

  // Guardar producto nuevo o editado
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Por favor ingresa el nombre del producto.");
      return;
    }

    const slug = formName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newColors: ProductColor[] = [
      {
        name: formColorName || "Blanco",
        hex: formColorHex || "#FFFFFF",
        image: formImage,
      },
    ];

    const productPayload: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      name: formName.trim(),
      slug: slug || `producto-${Date.now()}`,
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      price: formPrice,
      originalPrice: formHasPromo ? formOriginalPrice : undefined,
      brand: formBrand,
      category: formCategory,
      inStock: formStock > 0,
      stockCount: formStock,
      isFeatured: true,
      isNew: !editingProductId,
      rating: 5.0,
      reviewsCount: 1,
      colors: newColors,
      specs: {
        battery: formSpecBattery,
        anc: formSpecAnc,
        driver: "10mm Dinámico",
        connectivity: formSpecConnectivity,
        weight: "4.2g",
        latency: "60ms",
      },
      soundProfile: {
        type: "Equilibrado",
        description: "Bajos profundos y voces nítidas",
        bass: 85,
        mid: 80,
        treble: 85,
      },
      features: [
        "100% Original Sellado",
        formSpecBattery + " de reproducción",
        formSpecConnectivity,
      ],
      tags: [formBrand.toLowerCase(), formCategory, "inalambricos"],
    };

    if (editingProductId) {
      updateProduct(productPayload);
      setSuccessNotice(`¡Producto "${productPayload.name}" actualizado exitosamente!`);
    } else {
      addProduct(productPayload);
      setSuccessNotice(`¡Producto "${productPayload.name}" guardado y publicado en la tienda!`);
    }

    setTimeout(() => setSuccessNotice(""), 5000);
    setActiveTab("inventory");
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportProductsJson());
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 3000);
  };

  const filteredInventory = products.filter((item) =>
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 antialiased font-sans">
      {/* Top Admin Header - Blanco Puro y Elegante */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black px-2.5 sm:px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors font-semibold shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volver a la Tienda</span>
              <span className="sm:hidden">Tienda</span>
            </Link>

            <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

            <div className="flex items-center gap-2 min-w-0">
              <Logo size="sm" showText={false} />
              <div className="truncate">
                <span className="text-xs sm:text-sm font-black text-neutral-950 tracking-tight">
                  PulsoTech Panel
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 ml-1.5 hidden md:inline">
                  En Vivo
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleNewProductClick}
              className="px-3 sm:px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">＋ Agregar Producto</span>
              <span className="sm:hidden">Agregar</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black font-semibold"
            >
              <span>Ver Tienda</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>

        {/* Sub-nav Tabs */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 border-t border-neutral-100 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "inventory"
                ? "border-neutral-950 text-neutral-950"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventario ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("add_product")}
            className={`px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "add_product"
                ? "border-neutral-950 text-neutral-950"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{editingProductId ? "Editar Producto" : "＋ Nuevo Producto"}</span>
          </button>

          <button
            onClick={() => setActiveTab("sales")}
            className={`px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "sales"
                ? "border-neutral-950 text-neutral-950"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ventas &amp; Pedidos</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "settings"
                ? "border-neutral-950 text-neutral-950"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Ajustes &amp; WhatsApp</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner de Notificación de Éxito */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successNotice}</span>
            </div>
            <Link
              href="/#catalogo"
              target="_blank"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0 shadow-xs"
            >
              Ver en la Tienda Comercial →
            </Link>
          </div>
        )}

        {/* ================= PESTAÑA 1: INVENTARIO ================= */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold mb-2">
                  <span>INGRESOS REGISTRADOS</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-neutral-950">
                  {STORE_SETTINGS.currencySymbol}{totalRevenue.toFixed(2)}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Ventas acumuladas por WhatsApp y Presencial
                </span>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold mb-2">
                  <span>TOTAL REFERENCIAS ACTIVAS</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-neutral-950">
                  {products.length} <span className="text-sm font-semibold text-neutral-500">modelos</span>
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Disponibles en el catálogo público
                </span>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold mb-2">
                  <span>ALERTAS DE STOCK</span>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-extrabold text-amber-600">
                  {lowStockCount} <span className="text-sm font-semibold text-neutral-500">productos</span>
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Con 5 o menos unidades en bodega
                </span>
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-neutral-950 flex items-center gap-2">
                    <Package className="w-5 h-5 text-neutral-700" />
                    <span>Catálogo de Productos en Vivo</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Modifica precios, promociones, stock o edita cualquier producto en tiempo real.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por modelo o marca..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 shadow-2xs"
                    />
                  </div>

                  <button
                    onClick={handleNewProductClick}
                    className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Nuevo</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200/90 overflow-x-auto bg-white shadow-sm">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Producto</th>
                      <th className="py-3.5 px-3">Marca</th>
                      <th className="py-3.5 px-3">Precio</th>
                      <th className="py-3.5 px-3">Promoción</th>
                      <th className="py-3.5 px-3">Stock</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {filteredInventory.map((item) => {
                      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                      return (
                        <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-neutral-50 border border-neutral-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                {item.colors[0]?.image ? (
                                  <img
                                    src={item.colors[0].image}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-neutral-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-extrabold text-neutral-950 text-sm">{item.name}</div>
                                <div className="text-[11px] text-neutral-500 truncate max-w-xs">{item.subtitle}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-bold text-neutral-800">
                            {item.brand}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="font-extrabold text-neutral-950 text-sm">
                              {STORE_SETTINGS.currencySymbol}{item.price.toFixed(2)}
                            </div>
                            {hasDiscount && (
                              <div className="text-[10px] text-neutral-400 line-through">
                                {STORE_SETTINGS.currencySymbol}{item.originalPrice?.toFixed(2)}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            {hasDiscount ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                                -{Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)}% OFF
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-400">Regular</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.stockCount <= 5
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {item.stockCount} uds
                              </span>

                              <div className="inline-flex items-center border border-neutral-200 rounded-lg p-0.5 bg-neutral-50">
                                <button
                                  onClick={() => updateStock(item.id, -1, true)}
                                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-neutral-200 text-neutral-600 font-bold"
                                  title="Restar 1 unidad"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => updateStock(item.id, 1, true)}
                                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-neutral-200 text-neutral-600 font-bold"
                                  title="Sumar 1 unidad"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/producto/${item.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                                title="Ver página de detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                                title="Editar producto"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de eliminar "${item.name}" del catálogo?`)) {
                                    deleteProduct(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= PESTAÑA 2: AGREGAR / EDITAR PRODUCTO ================= */}
        {activeTab === "add_product" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-neutral-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>{editingProductId ? "Editar Información del Producto" : "Publicar Nuevo Producto"}</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Completa los datos técnicos, define el precio de venta y mira la vista previa en vivo a la derecha.
                </p>
              </div>

              {editingProductId && (
                <button
                  onClick={handleNewProductClick}
                  className="text-xs text-neutral-600 hover:text-black px-3 py-1.5 rounded-xl border border-neutral-200 bg-white"
                >
                  Cancelar edición y crear nuevo
                </button>
              )}
            </div>

            {/* Split Formulario + Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Formulario (7 Cols) */}
              <form onSubmit={handleSaveProduct} className="lg:col-span-7 space-y-6 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                {/* 1. Datos Principales */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                    1. Información Básica
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-neutral-900 block mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Redmi Buds 6 Active ANC"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-900 block mb-1">
                        Marca
                      </label>
                      <select
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white"
                      >
                        <option value="Xiaomi">Xiaomi</option>
                        <option value="Redmi">Redmi</option>
                        <option value="Soundcore">Soundcore</option>
                        <option value="Haylou">Haylou</option>
                        <option value="Sony">Sony</option>
                        <option value="Otra">Otra Marca</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-900 block mb-1">
                        Categoría
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white"
                      >
                        <option value="in-ear">In-Ear (Intraurales / Botón)</option>
                        <option value="over-ear">Over-Ear (Diadema / Vincha)</option>
                        <option value="deportivos">Deportivos con Gancho</option>
                        <option value="estudio">Audio Estudio &amp; Pro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-900 block mb-1">
                      Subtítulo o Resumen Breve
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Sin cancelación de ruido · 36h de batería · Resistencia IPX4"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* 2. Precios & Promociones */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                    2. Precios, Descuentos &amp; Stock
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-900 block mb-1">
                        Precio de Venta ({STORE_SETTINGS.currencySymbol}) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        min={1}
                        value={formPrice}
                        onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-base font-extrabold text-neutral-950 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-900 block mb-1">
                        Stock Inicial (unidades)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formStock}
                        onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-base font-extrabold text-neutral-950 focus:outline-none focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Switch Promoción */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formHasPromo}
                        onChange={(e) => setFormHasPromo(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white border-neutral-300"
                      />
                      <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-red-600" />
                        <span>Activar Precio de Oferta / Promoción Especial</span>
                      </span>
                    </label>

                    {formHasPromo && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                            Precio Original Tachado ({STORE_SETTINGS.currencySymbol})
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={formOriginalPrice}
                            onChange={(e) => setFormOriginalPrice(parseFloat(e.target.value) || 0)}
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                            Etiqueta en Tarjeta
                          </label>
                          <select
                            value={formPromoTag}
                            onChange={(e) => setFormPromoTag(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 font-semibold"
                          >
                            <option value="OFERTA FLASH">OFERTA FLASH</option>
                            <option value="MÁS VENDIDO">MÁS VENDIDO</option>
                            <option value="DESCUENTO ESPECIAL">DESCUENTO ESPECIAL</option>
                            <option value="NUEVO LANZAMIENTO">NUEVO LANZAMIENTO</option>
                          </select>
                        </div>

                        {formOriginalPrice > formPrice && (
                          <div className="sm:col-span-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            ✓ Descuento del {Math.round(((formOriginalPrice - formPrice) / formOriginalPrice) * 100)}% (Ahorro de {STORE_SETTINGS.currencySymbol}{(formOriginalPrice - formPrice).toFixed(2)})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Fotos & Color (Por defecto Blanco como solicitaste) */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                    3. Fotografía &amp; Color
                  </h3>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-900 block">
                      Imagen del Producto
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-4 h-4 text-white" />
                        <span>Subir foto desde mi computadora o celular</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>

                      <span className="text-xs text-neutral-400">o ruta de imagen:</span>

                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="flex-1 w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 font-mono"
                      />
                    </div>

                    {/* Galería de Fotos Rápidas */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-neutral-500 block mb-1.5">
                        O selecciona una de nuestras fotos de catálogo:
                      </span>
                      <div className="flex items-center gap-3">
                        {[
                          { name: "Buds 6 Play", path: getAssetUrl("/images/products/redmi-buds-6-play.png") },
                          { name: "Buds 8 Lite", path: getAssetUrl("/images/products/redmi-buds-8-lite.png") },
                          { name: "Buds 7S", path: getAssetUrl("/images/products/redmi-buds-7s.png") },
                        ].map((sample) => (
                          <button
                            type="button"
                            key={sample.name}
                            onClick={() => setFormImage(sample.path)}
                            className={`p-1.5 rounded-xl border flex items-center gap-2 bg-neutral-50 hover:bg-white text-[11px] font-semibold transition-all ${
                              formImage === sample.path ? "border-black shadow-xs bg-white" : "border-neutral-200"
                            }`}
                          >
                            <img src={sample.path} alt={sample.name} className="w-7 h-7 object-contain" />
                            <span>{sample.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Selector de Color con chips rápidos (Blanco por defecto) */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-neutral-900 block">
                      Color del Producto
                    </label>

                    {/* Chips de Colores Rápidos */}
                    <div className="flex items-center gap-2">
                      {[
                        { name: "Blanco", hex: "#FFFFFF" },
                        { name: "Negro", hex: "#111111" },
                        { name: "Azul", hex: "#1d4ed8" },
                        { name: "Titanio", hex: "#64748b" },
                      ].map((c) => (
                        <button
                          type="button"
                          key={c.name}
                          onClick={() => {
                            setFormColorName(c.name);
                            setFormColorHex(c.hex);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            formColorHex === c.hex
                              ? "border-black bg-neutral-900 text-white shadow-xs"
                              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                          Nombre del Color
                        </label>
                        <input
                          type="text"
                          value={formColorName}
                          onChange={(e) => setFormColorName(e.target.value)}
                          placeholder="Blanco Glaciar"
                          className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                          Personalizar Hex
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formColorHex}
                            onChange={(e) => setFormColorHex(e.target.value)}
                            className="w-9 h-9 rounded-lg border border-neutral-200 p-0.5 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formColorHex}
                            onChange={(e) => setFormColorHex(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Especificaciones Técnicas */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                    4. Especificaciones Rápidas
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Autonomía / Batería</label>
                      <input
                        type="text"
                        value={formSpecBattery}
                        onChange={(e) => setFormSpecBattery(e.target.value)}
                        placeholder="36 horas"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Cancelación de Ruido</label>
                      <input
                        type="text"
                        value={formSpecAnc}
                        onChange={(e) => setFormSpecAnc(e.target.value)}
                        placeholder="Sin ANC / ANC 42dB"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Bluetooth</label>
                      <input
                        type="text"
                        value={formSpecConnectivity}
                        onChange={(e) => setFormSpecConnectivity(e.target.value)}
                        placeholder="Bluetooth 5.4"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-900 block mb-1">
                      Descripción Comercial (1 o 2 oraciones)
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:bg-white leading-relaxed"
                    />
                  </div>
                </div>

                {/* Botón de Guardar */}
                <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("inventory")}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-black text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-neutral-950 text-white font-extrabold text-xs hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span>{editingProductId ? "Actualizar y Guardar Cambios" : "Guardar y Publicar en Tienda"}</span>
                  </button>
                </div>
              </form>

              {/* Live Preview de la Tarjeta en la Tienda (5 Cols) */}
              <div className="lg:col-span-5 space-y-3 sticky top-24">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
                  <span className="flex items-center gap-1.5 uppercase text-neutral-900">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Vista Previa en Tiempo Real</span>
                  </span>
                  <span>Así se verá en la web</span>
                </div>

                {/* Tarjeta idéntica a la tienda */}
                <div className="rounded-2xl bg-white text-neutral-900 border border-neutral-200/90 shadow-xl p-5 overflow-hidden flex flex-col justify-between">
                  {/* Encabezado */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        {formBrand || "XIAOMI"}
                      </span>
                      {formHasPromo ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white tracking-wide uppercase">
                          {formPromoTag}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white tracking-wide uppercase">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-950 text-white tracking-wide">
                      {formStock > 0 ? "En Stock" : "Agotado"}
                    </span>
                  </div>

                  {/* Imagen */}
                  <div className="relative w-full aspect-square rounded-xl bg-neutral-50 flex items-center justify-center p-2 overflow-hidden border border-neutral-100 mb-4">
                    {formImage ? (
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-neutral-400 text-xs flex flex-col items-center gap-1">
                        <ImageIcon className="w-8 h-8 text-neutral-300" />
                        <span>Sin foto</span>
                      </div>
                    )}
                  </div>

                  {/* Textos */}
                  <div className="space-y-1.5 mb-3">
                    <h3 className="text-lg font-extrabold text-neutral-950 leading-snug">
                      {formName || "Nombre del Producto"}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {formSubtitle || "Especificaciones breves..."}
                    </p>
                  </div>

                  {/* Badges de specs */}
                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] font-semibold text-neutral-600">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200/50">
                      {formSpecBattery}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200/50">
                      {formSpecAnc}
                    </span>
                  </div>

                  {/* Precio y CTA */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400">Precio PulsoTech</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-neutral-950">
                          {STORE_SETTINGS.currencySymbol}{formPrice.toFixed(2)}
                        </span>
                        {formHasPromo && formOriginalPrice > formPrice && (
                          <span className="text-xs text-neutral-400 line-through">
                            {STORE_SETTINGS.currencySymbol}{formOriginalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Comprar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PESTAÑA 3: VENTAS & PEDIDOS ================= */}
        {activeTab === "sales" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Registrar Venta Manual (WhatsApp o Presencial)</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Registra pedidos cerrados fuera de la web para descontar las unidades del stock automáticamente.
                </p>

                <form onSubmit={handleRecordManualSale} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                      Producto vendido:
                    </label>
                    <select
                      value={newSaleProduct}
                      onChange={(e) => setNewSaleProduct(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                    >
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({STORE_SETTINGS.currencySymbol}{item.price.toFixed(2)}) - Stock: {item.stockCount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                        Cantidad:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newSaleQty}
                        onChange={(e) => setNewSaleQty(parseInt(e.target.value) || 1)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                        Canal:
                      </label>
                      <select
                        value={newSaleChannel}
                        onChange={(e) =>
                          setNewSaleChannel(e.target.value as "WhatsApp" | "Presencial")
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none font-semibold"
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Presencial">Presencial</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                      Nombre o Teléfono del Cliente:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Sofia Martínez"
                      value={newSaleCustomer}
                      onChange={(e) => setNewSaleCustomer(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none placeholder-neutral-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Procesar Venta y Descontar Stock</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Sales History */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs uppercase text-neutral-500 block font-bold tracking-wider">
                Historial de Órdenes Recientes ({sales.length}):
              </span>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {sales.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-neutral-950 text-sm">{s.productName}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {s.customerName} • Cantidad: {s.quantity} •{" "}
                        <span className="text-emerald-700 font-bold">{s.channel}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-neutral-950 text-sm">
                        {STORE_SETTINGS.currencySymbol}{s.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-neutral-400">{s.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= PESTAÑA 4: CONFIGURACIÓN & EXPORTAR ================= */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-3xl">
            {/* WhatsApp Card */}
            <form
              onSubmit={handleSavePhone}
              className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Número de WhatsApp Receptor de Pedidos
                  </h3>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    Todos los botones de compra de la web abrirán WhatsApp enviando el mensaje a este número.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Código de país + número (ej: 51902377567)"
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-emerald-600 flex-1 shadow-2xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Teléfono</span>
                </button>
              </div>

              {phoneSaved && (
                <div className="p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>¡Número actualizado con éxito!</span>
                </div>
              )}
            </form>

            {/* Exportar Catálogo JSON */}
            <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                    <Copy className="w-4 h-4 text-blue-600" />
                    <span>Exportar Catálogo para Producción Permanente</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Puedes copiar los productos actuales en formato JSON para respaldarlos o pasármelos para dejarlos grabados en el código estático.
                  </p>
                </div>

                <button
                  onClick={handleCopyJson}
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>¡Copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <button
                  onClick={() => {
                    if (confirm("¿Deseas restablecer los productos a los valores predeterminados de fábrica?")) {
                      resetToDefault();
                      alert("Productos restablecidos.");
                    }
                  }}
                  className="text-xs text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restablecer productos originales de fábrica</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
