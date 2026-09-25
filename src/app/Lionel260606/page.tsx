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
  ArrowRight,
  Filter,
  Video as VideoIcon,
  Plus,
  Layers,
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

export const generate6DigitId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export interface SpecFieldTemplate {
  label: string;
  placeholder: string;
}

export const CATEGORY_SPEC_TEMPLATES: Record<string, SpecFieldTemplate[]> = {
  "Audífonos Inalámbricos": [
    { label: "Autonomía de Auriculares", placeholder: "Ej: Hasta 6 horas continuas" },
    { label: "Autonomía con Estuche", placeholder: "Ej: Hasta 30 horas totales" },
    { label: "Tiempo / Carga Rápida", placeholder: "Ej: 10 min de carga = 2h de uso" },
    { label: "Versión de Bluetooth", placeholder: "Ej: Bluetooth 5.3" },
    { label: "Cancelación de Ruido", placeholder: "Ej: Cancelación Activa de Ruido (ANC) / Reducción IA" },
    { label: "Resistencia al Agua", placeholder: "Ej: Certificación IP54 / IPX4" },
    { label: "Driver Acústico", placeholder: "Ej: Diafragma dinámico de 12.4mm" },
    { label: "Compatibilidad", placeholder: "Ej: Android, iOS, Windows, Mac" },
  ],
  "Smartwatches": [
    { label: "Pantalla & Resolución", placeholder: "Ej: AMOLED 1.75'' Ultra HD (60Hz)" },
    { label: "Autonomía de Batería", placeholder: "Ej: Hasta 12 días de uso típico" },
    { label: "Resistencia al Agua", placeholder: "Ej: Sumergible 5 ATM (50 metros)" },
    { label: "Sensores de Salud", placeholder: "Ej: Ritmo Cardíaco 24/7, SpO2, Sueño" },
    { label: "Modos Deportivos", placeholder: "Ej: Más de 120 modos de entrenamiento" },
    { label: "Llamadas Bluetooth", placeholder: "Ej: Micrófono y altavoz integrados" },
    { label: "Compatibilidad", placeholder: "Ej: Android 6.0+ / iOS 12.0+" },
  ],
  "Altavoces Bluetooth": [
    { label: "Potencia de Audio (RMS)", placeholder: "Ej: 20W RMS Audio Envolvente 360°" },
    { label: "Autonomía de Batería", placeholder: "Ej: Hasta 16 horas de reproducción continua" },
    { label: "Tiempo de Carga & Puerto", placeholder: "Ej: 3 horas vía USB Tipo C" },
    { label: "Versión de Bluetooth", placeholder: "Ej: Bluetooth 5.3 (Rango de 15m)" },
    { label: "Resistencia al Agua", placeholder: "Ej: Certificación IPX7 sumergible" },
    { label: "Funciones Adicionales", placeholder: "Ej: Emparejamiento Estéreo TWS / Manos Libres" },
  ],
  "Accesorios": [
    { label: "Material & Construcción", placeholder: "Ej: Polímero reforzado / Aleación de aluminio" },
    { label: "Conectores / Puertos", placeholder: "Ej: USB Tipo C con soporte Power Delivery" },
    { label: "Compatibilidad Universal", placeholder: "Ej: Compatible con dispositivos USB Tipo C" },
    { label: "Garantía de Fábrica", placeholder: "Ej: 6 meses de garantía directa PulsoTech" },
  ],
};

export function getCategorySpecTemplate(categoryName: string): SpecFieldTemplate[] {
  const norm = (categoryName || "").toLowerCase().trim();
  if (
    norm.includes("audífono") ||
    norm.includes("audifono") ||
    norm.includes("ear") ||
    norm.includes("auricular") ||
    norm.includes("headphone") ||
    norm.includes("tws")
  ) {
    return CATEGORY_SPEC_TEMPLATES["Audífonos Inalámbricos"];
  }
  if (
    norm.includes("smartwatch") ||
    norm.includes("reloj") ||
    norm.includes("watch") ||
    norm.includes("band")
  ) {
    return CATEGORY_SPEC_TEMPLATES["Smartwatches"];
  }
  if (
    norm.includes("altavoz") ||
    norm.includes("parlante") ||
    norm.includes("speaker") ||
    norm.includes("bocina")
  ) {
    return CATEGORY_SPEC_TEMPLATES["Altavoces Bluetooth"];
  }
  if (norm.includes("accesorio") || norm.includes("cable") || norm.includes("cargador")) {
    return CATEGORY_SPEC_TEMPLATES["Accesorios"];
  }
  return [
    { label: "Rendimiento / Potencia", placeholder: "Ej: Alto rendimiento" },
    { label: "Autonomía / Batería", placeholder: "Ej: Batería de larga duración" },
    { label: "Conectividad", placeholder: "Ej: Inalámbrico / USB-C" },
    { label: "Material & Protección", placeholder: "Ej: Resistente al uso diario" },
    { label: "Compatibilidad", placeholder: "Ej: Universal" },
  ];
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
    brands,
    addBrand,
    deleteBrand,
    categories,
    addCategory,
    deleteCategory,
  } = useProducts();

  // Navegación por pestañas
  const [activeTab, setActiveTab] = useState<"inventory" | "add_product" | "filters" | "sales" | "settings">("inventory");

  // Estados de WhatsApp
  const [phoneInput, setPhoneInput] = useState(whatsappNumber);
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Filtros de búsqueda en inventario
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedJson, setCopiedJson] = useState(false);

  // Estados para gestión de filtros (marcas y categorías)
  const [newBrandInput, setNewBrandInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");

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

  // ====== ESTADO DEL FORMULARIO DE AGREGAR / EDITAR PRODUCTO (INICIALMENTE LIMPIO) ======
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formCustomId, setFormCustomId] = useState(generate6DigitId());
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState(brands[0] || "Xiaomi");
  const [formCategory, setFormCategory] = useState(categories[0] || "Audífonos Inalámbricos");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formHasPromo, setFormHasPromo] = useState(false);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | "">("");
  const [formPromoTag, setFormPromoTag] = useState("OFERTA FLASH");
  const [formStock, setFormStock] = useState<number>(10);
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  
  // Múltiples Colores Detallados con sus Fotografías (empieza con 1 casilla limpia)
  const [formColors, setFormColors] = useState<ProductColor[]>([
    {
      name: "Negro",
      hex: "#18181b",
      image: "",
    },
  ]);
  const [previewColorIndex, setPreviewColorIndex] = useState(0);

  // Imagen Secundaria (Para el efecto de transición / hover al pasar el cursor)
  const [formSecondaryImage, setFormSecondaryImage] = useState("");

  // Especificaciones Técnicas Dinámicas por Categoría
  const [formCustomSpecs, setFormCustomSpecs] = useState<{ label: string; value: string }[]>(() => {
    return getCategorySpecTemplate(categories[0] || "Audífonos Inalámbricos").map((item) => ({
      label: item.label,
      value: "",
    }));
  });

  const handleCategoryChange = (newCat: string) => {
    setFormCategory(newCat);
    // Si no hay valores rellenados, cambiar automáticamente a la plantilla técnica de la nueva categoría
    const hasValues = formCustomSpecs.some((s) => s.value.trim().length > 0);
    if (!hasValues) {
      const template = getCategorySpecTemplate(newCat);
      setFormCustomSpecs(template.map((t) => ({ label: t.label, value: "" })));
    }
  };

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

  // Manejadores de colores detallados
  const handleAddColor = () => {
    const palette = [
      { name: "Negro", hex: "#18181b" },
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Beige", hex: "#f5f0e6" },
      { name: "Azul", hex: "#1d4ed8" },
      { name: "Verde", hex: "#059669" },
      { name: "Gris", hex: "#64748b" },
      { name: "Rosa", hex: "#f43f5e" },
    ];
    const nextColor = palette[formColors.length % palette.length];
    setFormColors([
      ...formColors,
      {
        name: nextColor.name,
        hex: nextColor.hex,
        image: formColors[0]?.image || getAssetUrl("/images/products/redmi-buds-6-play.png"),
      },
    ]);
  };

  const handleRemoveColor = (index: number) => {
    if (formColors.length <= 1) {
      alert("El producto debe tener al menos un color disponible.");
      return;
    }
    setFormColors(formColors.filter((_, i) => i !== index));
    if (previewColorIndex >= formColors.length - 1) {
      setPreviewColorIndex(0);
    }
  };

  const handleUpdateColor = (index: number, field: keyof ProductColor, value: string) => {
    setFormColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleColorImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          handleUpdateColor(index, "image", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSecondaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormSecondaryImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handlers para Marcas y Categorías
  const handleAddBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandInput.trim()) return;
    addBrand(newBrandInput.trim());
    setSuccessNotice(`¡Marca "${newBrandInput.trim()}" agregada exitosamente!`);
    setNewBrandInput("");
    setTimeout(() => setSuccessNotice(""), 3500);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    addCategory(newCategoryInput.trim());
    setSuccessNotice(`¡Categoría "${newCategoryInput.trim()}" agregada exitosamente!`);
    setNewCategoryInput("");
    setTimeout(() => setSuccessNotice(""), 3500);
  };

  // Cargar datos en el formulario para editar
  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setFormCustomId(product.id);
    setFormName(product.name);
    setFormBrand(product.brand || brands[0] || "Xiaomi");
    setFormCategory(product.category || categories[0] || "Audífonos Inalámbricos");
    setFormPrice(product.price);
    setFormHasPromo(!!product.originalPrice && product.originalPrice > product.price);
    setFormOriginalPrice(product.originalPrice || "");
    setFormPromoTag("OFERTA FLASH");
    setFormStock(product.stockCount);
    setFormSubtitle(product.subtitle || "");
    setFormDescription(product.description || "");
    setFormVideoUrl(product.videoUrl || "");
    setFormColors(
      product.colors && product.colors.length > 0
        ? product.colors
        : [
            {
              name: "Negro",
              hex: "#18181b",
              image: product.images?.[0] || "",
            },
          ]
    );
    setFormSecondaryImage(product.images?.[1] || "");
    setPreviewColorIndex(0);

    // Cargar especificaciones técnicas personalizadas
    const loadedSpecs: { label: string; value: string }[] = [];
    if (product.customSpecs && product.customSpecs.length > 0) {
      product.customSpecs.forEach((s) => {
        loadedSpecs.push({ label: s.label, value: s.value });
      });
    } else if (product.specs) {
      if (product.specs.battery) loadedSpecs.push({ label: "Autonomía de Batería", value: product.specs.battery });
      if (product.specs.anc) loadedSpecs.push({ label: "Cancelación de Ruido", value: product.specs.anc });
      if (product.specs.connectivity) loadedSpecs.push({ label: "Versión de Bluetooth", value: product.specs.connectivity });
      if (product.specs.driver) loadedSpecs.push({ label: "Driver Acústico", value: product.specs.driver });
      if (product.specs.latency) loadedSpecs.push({ label: "Latencia", value: product.specs.latency });
    }
    if (loadedSpecs.length === 0) {
      const template = getCategorySpecTemplate(product.category || "Audífonos Inalámbricos");
      template.forEach((t) => loadedSpecs.push({ label: t.label, value: "" }));
    }
    setFormCustomSpecs(loadedSpecs);

    setActiveTab("add_product");
  };

  // Limpiar formulario para nuevo producto (100% LIMPIO, SIN EJEMPLOS PRECARGADOS)
  const handleNewProductClick = () => {
    setEditingProductId(null);
    setFormCustomId(generate6DigitId());
    setFormName("");
    setFormBrand(brands[0] || "Xiaomi");
    const initialCat = categories[0] || "Audífonos Inalámbricos";
    setFormCategory(initialCat);
    setFormPrice("");
    setFormHasPromo(false);
    setFormOriginalPrice("");
    setFormPromoTag("OFERTA FLASH");
    setFormStock(10);
    setFormSubtitle("");
    setFormDescription("");
    setFormVideoUrl("");
    setFormColors([
      {
        name: "Negro",
        hex: "#18181b",
        image: "",
      },
    ]);
    setFormSecondaryImage("");
    setPreviewColorIndex(0);

    const template = getCategorySpecTemplate(initialCat);
    setFormCustomSpecs(template.map((t) => ({ label: t.label, value: "" })));

    setActiveTab("add_product");
  };

  // Guardar producto nuevo o editado
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Por favor ingresa el nombre del producto.");
      return;
    }

    const priceNum = typeof formPrice === "number" ? formPrice : parseFloat(formPrice as string) || 0;
    const origPriceNum = typeof formOriginalPrice === "number" ? formOriginalPrice : parseFloat(formOriginalPrice as string) || 0;

    // Validación de ID estricto a 6 dígitos numéricos
    let finalId = formCustomId.replace(/\D/g, "").slice(0, 6);
    if (!finalId || finalId.length < 6) {
      if (editingProductId && /^\d{6}$/.test(editingProductId)) {
        finalId = editingProductId;
      } else {
        finalId = generate6DigitId();
      }
    }

    // Verificar si el ID ya existe en otro producto al crear uno nuevo
    if (!editingProductId && products.some((p) => p.id === finalId)) {
      finalId = generate6DigitId();
    }

    const slug = formName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const validColors = formColors.filter(c => c.name.trim() || c.image.trim());
    const finalColors = validColors.length > 0 ? validColors : [
      {
        name: "Original",
        hex: "#18181b",
        image: formColors[0]?.image || "",
      },
    ];

    const primaryImg = finalColors[0]?.image || formColors[0]?.image || "";
    const secImg = formSecondaryImage || finalColors[1]?.image || "";
    const images = [primaryImg, secImg].filter(Boolean);

    // Consolidar especificaciones técnicas válidas
    const validSpecs = formCustomSpecs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label.length > 0 && s.value.length > 0);

    const findSpecValue = (keywords: string[], fallback: string) => {
      const match = validSpecs.find((s) =>
        keywords.some((k) => s.label.toLowerCase().includes(k))
      );
      return match ? match.value : fallback;
    };

    const batteryVal = findSpecValue(["batería", "bateria", "autonomía", "autonomia"], "Hasta 30h");
    const ancVal = findSpecValue(["cancelación", "cancelacion", "anc", "ruido"], "Estándar");
    const driverVal = findSpecValue(["driver", "diafragma", "potencia"], "Dinámico");
    const connVal = findSpecValue(["bluetooth", "conectividad", "inalámbrico"], "Bluetooth 5.3");
    const latencyVal = findSpecValue(["latencia", "ms"], "60ms");
    const weightVal = findSpecValue(["peso", "gr", "gramos"], "4.2g");

    const productPayload: Product = {
      id: finalId,
      name: formName.trim(),
      slug: slug || `producto-${finalId}`,
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      price: priceNum,
      originalPrice: formHasPromo && origPriceNum > priceNum ? origPriceNum : undefined,
      brand: formBrand,
      category: formCategory,
      inStock: formStock > 0,
      stockCount: formStock,
      isFeatured: true,
      isNew: !editingProductId,
      rating: 5.0,
      reviewsCount: 1,
      videoUrl: formVideoUrl.trim() || undefined,
      colors: finalColors,
      images: images.length > 0 ? images : [getAssetUrl("/images/products/redmi-buds-6-play.png")],
      customSpecs: validSpecs.length > 0 ? validSpecs : undefined,
      specs: {
        battery: batteryVal,
        anc: ancVal,
        driver: driverVal,
        connectivity: connVal,
        weight: weightVal,
        latency: latencyVal,
      },
      soundProfile: {
        type: "Equilibrado",
        description: "Audio de alta fidelidad",
        bass: 80,
        mid: 80,
        treble: 80,
      },
      features: validSpecs.length > 0
        ? validSpecs.slice(0, 5).map((s) => `${s.label}: ${s.value}`)
        : [
            "100% Original Sellado",
            ...(formSubtitle ? [formSubtitle] : []),
          ],
      tags: [formBrand.toLowerCase(), formCategory.toLowerCase(), "tecnología"],
    };

    if (editingProductId) {
      if (editingProductId !== finalId) {
        deleteProduct(editingProductId);
        addProduct(productPayload);
      } else {
        updateProduct(productPayload);
      }
      setSuccessNotice(`¡Producto "${productPayload.name}" (#${productPayload.id}) actualizado exitosamente!`);
    } else {
      addProduct(productPayload);
      setSuccessNotice(`¡Producto "${productPayload.name}" (#${productPayload.id}) guardado y publicado en la tienda!`);
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
    item.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchFilter.toLowerCase()))
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
            onClick={() => setActiveTab("filters")}
            className={`px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "filters"
                ? "border-neutral-950 text-neutral-950"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span>🏷️ Marcas &amp; Filtros</span>
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
                      placeholder="Buscar por ID, modelo, marca o categoría..."
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
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-3">ID</th>
                      <th className="py-3.5 px-4">Producto</th>
                      <th className="py-3.5 px-3">Marca</th>
                      <th className="py-3.5 px-3">Categoría</th>
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
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="font-mono text-xs font-black text-neutral-800 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                              #{item.id}
                            </span>
                          </td>

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

                          <td className="py-3.5 px-3 font-bold text-neutral-800 whitespace-nowrap">
                            {item.brand}
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="text-[11px] font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
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
                                href={`/producto/?id=${item.id}&slug=${item.slug}`}
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
                    1. Información Básica &amp; Identificador
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-neutral-900">
                          ID (6 dígitos) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormCustomId(generate6DigitId())}
                          className="text-[10px] font-bold text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded transition-colors"
                          title="Generar nuevo número de 6 dígitos aleatorio"
                        >
                          🎲 Generar ID
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400 text-xs">
                          #
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="100001"
                          value={formCustomId}
                          onChange={(e) => setFormCustomId(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 tracking-wider"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        Código numérico único de 6 dígitos para rastreo rápido.
                      </span>
                    </div>

                    <div className="sm:col-span-2">
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-neutral-900">
                          Marca
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nb = prompt("Ingresa el nombre de la nueva marca:");
                            if (nb && nb.trim()) {
                              addBrand(nb.trim());
                              setFormBrand(nb.trim());
                            }
                          }}
                          className="text-[10px] font-bold text-neutral-700 hover:text-black cursor-pointer underline"
                        >
                          ＋ Nueva Marca
                        </button>
                      </div>
                      <select
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:bg-white"
                      >
                        {brands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-neutral-900">
                          Categoría
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nc = prompt("Ingresa el nombre de la nueva categoría:");
                            if (nc && nc.trim()) {
                              addCategory(nc.trim());
                              handleCategoryChange(nc.trim());
                            }
                          }}
                          className="text-[10px] font-bold text-neutral-700 hover:text-black cursor-pointer underline"
                        >
                          ＋ Nueva Categoría
                        </button>
                      </div>
                      <select
                        value={formCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
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

                {/* 2. Especificaciones Técnicas por Categoría */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-neutral-900" />
                        <span>2. Ficha Técnica Oficial ({formCategory})</span>
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Preguntas y campos formales según la categoría seleccionada. Se mostrarán con iconos en la ficha del producto.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const tpl = getCategorySpecTemplate(formCategory);
                          setFormCustomSpecs(tpl.map((t) => ({ label: t.label, value: "" })));
                        }}
                        className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-[11px] font-bold text-neutral-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Restablecer plantilla formal para esta categoría"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Plantilla</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormCustomSpecs([...formCustomSpecs, { label: "", value: "" }]);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Característica</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/80">
                    {formCustomSpecs.map((spec, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="Nombre formal (ej: Autonomía)"
                            value={spec.label}
                            onChange={(e) => {
                              const next = [...formCustomSpecs];
                              next[sIdx].label = e.target.value;
                              setFormCustomSpecs(next);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            placeholder="Valor / Especificación (ej: Hasta 30 horas)"
                            value={spec.value}
                            onChange={(e) => {
                              const next = [...formCustomSpecs];
                              next[sIdx].value = e.target.value;
                              setFormCustomSpecs(next);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setFormCustomSpecs(formCustomSpecs.filter((_, i) => i !== sIdx));
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar esta característica"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {formCustomSpecs.length === 0 && (
                      <div className="text-center py-4 text-xs text-neutral-400">
                        No hay características agregadas. Pulsa "+ Característica" para añadir especificaciones técnicas.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Precios & Promociones */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                    3. Precios, Descuentos &amp; Stock
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

                        {Number(formOriginalPrice) > Number(formPrice) && Number(formPrice) > 0 && (
                          <div className="sm:col-span-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            ✓ Descuento del {Math.round(((Number(formOriginalPrice) - Number(formPrice)) / Number(formOriginalPrice)) * 100)}% (Ahorro de {STORE_SETTINGS.currencySymbol}{(Number(formOriginalPrice) - Number(formPrice)).toFixed(2)})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Gestión Detallada de Colores & Fotografías */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>4. Colores Disponibles &amp; Fotografías</span>
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Agrega todos los colores que tiene el producto. Cada uno tendrá su círculo interactivo en la tienda.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Añadir Color</span>
                    </button>
                  </div>

                  {/* Lista de Colores Configurados */}
                  <div className="space-y-4">
                    {formColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/70 space-y-3 relative transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full border border-neutral-300 shadow-2xs"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs font-black text-neutral-900">
                              Color #{idx + 1}: {color.name || "Sin nombre"}
                            </span>
                          </div>

                          {formColors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(idx)}
                              className="text-neutral-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                              title="Eliminar este color"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Campos del color */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                              Nombre del Color
                            </label>
                            <input
                              type="text"
                              value={color.name}
                              onChange={(e) => handleUpdateColor(idx, "name", e.target.value)}
                              placeholder="Ej: Negro, Blanco, Beige, Azul..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                              Tono HEX
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={color.hex}
                                onChange={(e) => handleUpdateColor(idx, "hex", e.target.value)}
                                className="w-8 h-8 rounded-lg border border-neutral-200 p-0.5 cursor-pointer shrink-0"
                              />
                              <input
                                type="text"
                                value={color.hex}
                                onChange={(e) => handleUpdateColor(idx, "hex", e.target.value)}
                                className="flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-mono font-bold text-neutral-900 uppercase"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Paleta rápida de sugerencias */}
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">
                            Sugerencias de color rápidas:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {[
                              { name: "Beige", hex: "#f5f0e6" },
                              { name: "Negro", hex: "#18181b" },
                              { name: "Blanco", hex: "#FFFFFF" },
                              { name: "Azul", hex: "#1e3a8a" },
                              { name: "Titanio", hex: "#64748b" },
                              { name: "Verde", hex: "#059669" },
                              { name: "Rosa", hex: "#f43f5e" },
                            ].map((preset) => (
                              <button
                                type="button"
                                key={preset.name}
                                onClick={() => {
                                  handleUpdateColor(idx, "name", preset.name);
                                  handleUpdateColor(idx, "hex", preset.hex);
                                }}
                                className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  color.hex?.toLowerCase() === preset.hex.toLowerCase()
                                    ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                                    : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                                  style={{ backgroundColor: preset.hex }}
                                />
                                <span>{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Foto para este color */}
                        <div className="pt-2 border-t border-neutral-200/80">
                          <label className="text-[11px] font-bold text-neutral-700 block mb-1.5">
                            Fotografía para el color {color.name || `#${idx + 1}`}:
                          </label>
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                              {color.image ? (
                                <img
                                  src={color.image}
                                  alt={color.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-neutral-300" />
                              )}
                            </div>

                            <div className="flex-1 w-full space-y-2">
                              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-800 cursor-pointer transition-colors shadow-2xs">
                                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                                <span>Subir foto de este color (PC o Celular)</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleColorImageUpload(idx, e)}
                                  className="hidden"
                                />
                              </label>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-neutral-400">O elegir muestra:</span>
                                {[
                                  { name: "Buds 6 Play", path: getAssetUrl("/images/products/redmi-buds-6-play.png") },
                                  { name: "Buds 8 Lite", path: getAssetUrl("/images/products/redmi-buds-8-lite.png") },
                                  { name: "Buds 7S", path: getAssetUrl("/images/products/redmi-buds-7s.png") },
                                ].map((sample) => (
                                  <button
                                    type="button"
                                    key={sample.name}
                                    onClick={() => handleUpdateColor(idx, "image", sample.path)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                      color.image === sample.path
                                        ? "bg-neutral-900 text-white border-neutral-900"
                                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                                    }`}
                                  >
                                    {sample.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Imagen Secundaria (Efecto de transición al pasar el cursor) */}
                  <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/30 space-y-3 mt-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Foto Secundaria (Efecto Hover / Transición al pasar el cursor)</span>
                        </span>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Esta fotografía aparecerá suavemente cuando el cliente pase el cursor por encima del producto en el catálogo.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {formSecondaryImage ? (
                          <img
                            src={formSecondaryImage}
                            alt="Secondary Preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-neutral-300" />
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white cursor-pointer transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-white" />
                          <span>Subir foto secundaria (auriculares fuera del estuche)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSecondaryImageUpload}
                            className="hidden"
                          />
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-400">O muestras de catálogo:</span>
                          {[
                            { name: "Buds 6 Earbuds", path: getAssetUrl("/images/products/redmi-buds-6-play-earbuds.png") },
                            { name: "Buds 8 Features", path: getAssetUrl("/images/products/redmi-buds-8-lite-features.png") },
                            { name: "Buds 7S Earbuds", path: getAssetUrl("/images/products/redmi-buds-7s-earbuds.png") },
                          ].map((sample) => (
                            <button
                              type="button"
                              key={sample.name}
                              onClick={() => setFormSecondaryImage(sample.path)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                formSecondaryImage === sample.path
                                  ? "bg-neutral-900 text-white border-neutral-900"
                                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                              }`}
                            >
                              {sample.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Video Demostrativo del Producto */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <VideoIcon className="w-3.5 h-3.5 text-red-600" />
                    <span>5. Video Multimedia (YouTube o MP4 - Opcional)</span>
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-neutral-900 block mb-1">
                      URL del Video (YouTube o Enlace Directo MP4)
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/... o video .mp4"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none focus:bg-white"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Se reproducirá en alta definición en la galería interactiva de la página de detalle del producto.
                    </p>
                  </div>
                </div>

                {/* 6. Descripción Comercial */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                    6. Descripción Comercial
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-neutral-900 block mb-1">
                      Descripción del Producto
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe los aspectos clave, detalles de uso o características del producto..."
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
                        {formBrand || "MARCA"}
                      </span>
                      {formCustomId && (
                        <span className="font-mono text-[10px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          #{formCustomId}
                        </span>
                      )}
                      {formHasPromo && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white tracking-wide uppercase">
                          {formPromoTag}
                        </span>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-950 text-white tracking-wide">
                      {Number(formStock) > 0 ? "En Stock" : "Agotado"}
                    </span>
                  </div>

                  {/* Imagen con Transición en Hover */}
                  {(() => {
                    const activePreviewImg = formColors[previewColorIndex]?.image || formColors[0]?.image;
                    return (
                      <div className="relative w-full aspect-square rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden border border-neutral-100 mb-3 group/preview-image">
                        {activePreviewImg ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img
                              src={activePreviewImg}
                              alt="Preview"
                              className={`absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 ease-out ${
                                formSecondaryImage
                                  ? "opacity-100 group-hover/preview-image:opacity-0 group-hover/preview-image:scale-95"
                                  : "group-hover/preview-image:scale-105"
                              }`}
                            />
                            {formSecondaryImage && (
                              <img
                                src={formSecondaryImage}
                                alt="Hover Preview"
                                className="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 ease-out opacity-0 group-hover/preview-image:opacity-100 scale-95 group-hover/preview-image:scale-100 pointer-events-none"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <ImageIcon className="w-10 h-10 text-neutral-300 mb-2 stroke-[1.5]" />
                            <span className="text-xs font-bold text-neutral-400">Sin fotografía aún</span>
                            <span className="text-[10px] text-neutral-400 mt-0.5">Sube una foto en la sección de colores</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Selector de Colores en la Vista Previa */}
                  <div className="h-7 flex items-center gap-1.5 shrink-0 pb-1">
                    {formColors.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewColorIndex(idx)}
                        className="w-6 h-6 flex items-center justify-center cursor-pointer shrink-0 transition-opacity"
                        title={color.name || `Color #${idx + 1}`}
                      >
                        <span
                          className={`rounded-full border border-neutral-300 transition-all duration-150 block ${
                            previewColorIndex === idx
                              ? "w-4 h-4 ring-2 ring-offset-2 ring-neutral-900 opacity-100"
                              : "w-3.5 h-3.5 opacity-70 hover:opacity-100"
                          } ${
                            color.hex?.toLowerCase() === "#ffffff" ? "bg-white" : ""
                          }`}
                          style={{ backgroundColor: color.hex || "#18181b" }}
                        />
                      </button>
                    ))}
                    <span className="text-[10px] font-semibold text-neutral-400 ml-1 truncate max-w-[80px]">
                      {formColors[previewColorIndex]?.name || "Color"}
                    </span>
                  </div>

                  {/* Textos */}
                  <div className="space-y-1 mb-3">
                    <h3 className="text-base font-extrabold text-neutral-950 leading-snug">
                      {formName || "Nombre del Producto"}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {formSubtitle || "Especificaciones breves..."}
                    </p>
                  </div>

                  {/* Precio y Botones 50/50 */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2.5">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400 leading-none mb-1">
                        Precio Directo
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-neutral-950">
                          {STORE_SETTINGS.currencySymbol}{Number(formPrice || 0).toFixed(2)}
                        </span>
                        {formHasPromo && Number(formOriginalPrice || 0) > Number(formPrice || 0) && (
                          <span className="text-xs text-neutral-400 line-through">
                            {STORE_SETTINGS.currencySymbol}{Number(formOriginalPrice || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-950 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                        <span>Añadir al Carrito</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen de Ficha Técnica en la Vista Previa */}
                {formCustomSpecs.filter((s) => s.label.trim() && s.value.trim()).length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Ficha Técnica en Vivo ({formCustomSpecs.filter((s) => s.label.trim() && s.value.trim()).length} campos)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {formCustomSpecs
                        .filter((s) => s.label.trim() && s.value.trim())
                        .map((spec, sIdx) => (
                          <div key={sIdx} className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 text-[11px]">
                            <span className="font-bold text-neutral-400 text-[10px] uppercase block truncate">{spec.label}</span>
                            <span className="font-extrabold text-neutral-900 block truncate">{spec.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= PESTAÑA: GESTIÓN DE MARCAS & FILTROS ================= */}
        {activeTab === "filters" && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 pb-4">
              <h2 className="text-xl font-black text-neutral-950 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <span>Gestión de Marcas &amp; Filtros de Categorías</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Agrega o elimina marcas y categorías disponibles en la tienda. Los cambios se actualizan automáticamente en el catálogo para los clientes y en el formulario de nuevos productos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna 1: Marcas */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-950 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-neutral-700" />
                    <span>Marcas Registradas ({brands.length})</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Marcas que aparecerán en el filtro lateral y tarjetas del catálogo.
                  </p>
                </div>

                {/* Formulario Agregar Marca */}
                <form onSubmit={handleAddBrandSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nueva marca (ej: JBL, Sony, Haylou)..."
                    value={newBrandInput}
                    onChange={(e) => setNewBrandInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </form>

                {/* Lista de Marcas */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {brands.map((b) => {
                    const count = products.filter(
                      (p) => p.brand?.toLowerCase() === b.toLowerCase()
                    ).length;
                    return (
                      <div
                        key={b}
                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span className="text-xs font-black text-neutral-900">{b}</span>
                          <span className="text-[10px] font-semibold text-neutral-400 bg-white border border-neutral-200 px-2 py-0.5 rounded-full">
                            {count} {count === 1 ? "producto" : "productos"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar la marca "${b}"?`)) {
                              deleteBrand(b);
                            }
                          }}
                          className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title={`Eliminar marca ${b}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Columna 2: Categorías */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-700" />
                    <span>Categorías del Catálogo ({categories.length})</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Categorías para organizar y filtrar las líneas de productos.
                  </p>
                </div>

                {/* Formulario Agregar Categoría */}
                <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nueva categoría (ej: Smartwatches, Gamer)..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </form>

                {/* Lista de Categorías */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {categories.map((c) => {
                    const count = products.filter(
                      (p) =>
                        p.category?.toLowerCase() === c.toLowerCase() ||
                        p.category?.toLowerCase().includes(c.toLowerCase()) ||
                        c.toLowerCase().includes((p.category || "").toLowerCase())
                    ).length;
                    return (
                      <div
                        key={c}
                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span className="text-xs font-black text-neutral-900">{c}</span>
                          <span className="text-[10px] font-semibold text-neutral-400 bg-white border border-neutral-200 px-2 py-0.5 rounded-full">
                            {count} {count === 1 ? "producto" : "productos"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar la categoría "${c}"?`)) {
                              deleteCategory(c);
                            }
                          }}
                          className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title={`Eliminar categoría ${c}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
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
