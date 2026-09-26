"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import { Product, ProductColor, SaleRecord } from "@/types";
import { fetchSalesRecordsFromSupabase, saveSalesRecordsToSupabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import {
  Package,
  DollarSign,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  Phone,
  Save,
  ShoppingBag,
  ArrowLeft,
  Search,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Sparkles,
  Tag,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
  Filter,
  Video as VideoIcon,
  Plus,
  Layers,
  Check,
  ArrowRight,
  Download,
  FileText,
  QrCode,
  Copy,
  X,
  BarChart3,
  TrendingUp,
  Calendar,
  PieChart,
  Clock,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  LogOut,
  KeyRound,
  Printer,
  MessageSquare,
  Send,
  Menu,
  Truck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Database,
  Smartphone,
  HardDrive,
  Settings,
} from "lucide-react";

export type { SaleRecord };

export type SalesPeriod = "all" | "today" | "this_week" | "this_month" | "last_month";

export const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
  const {
    whatsappNumber,
    setWhatsappNumber,
    coupons,
    addCoupon,
    deleteCoupon,
    toggleCoupon,
  } = useCart();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    isCloudConnected,
    refreshFromCloud,
  } = useProducts();

  // Navegación por pestañas
  const [activeTab, setActiveTab] = useState<
    "inventory" | "add_product" | "filters" | "coupons" | "sales" | "settings"
  >("inventory");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Estados de Autenticación & Seguridad del Panel
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState("260606");
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Estados para cambio de PIN en Ajustes
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinChangeNotice, setPinChangeNotice] = useState<{ text: string; isError: boolean } | null>(null);

  // Carga inicial segura del estado de sesión y PIN personalizado
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedPin = localStorage.getItem("pulsotech_admin_pin");
        if (savedPin) {
          setAdminPin(savedPin);
        }
        const sessionAuth = sessionStorage.getItem("pulsotech_admin_authenticated");
        if (sessionAuth === "true") {
          setIsAuthenticated(true);
        }
      } catch {
        // Ignorar error de acceso
      } finally {
        setIsAuthChecking(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Temporizador de enfriamiento ante intentos fallidos
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutSeconds > 0) return;

    if (pinInput.trim() === adminPin.trim()) {
      try {
        sessionStorage.setItem("pulsotech_admin_authenticated", "true");
      } catch {}
      setIsAuthenticated(true);
      setPinError("");
      setFailedAttempts(0);
      setPinInput("");
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockoutSeconds(30);
        setPinError("Has superado el límite de intentos. Panel bloqueado por 30 segundos.");
      } else {
        setPinError(`PIN incorrecto. Intento ${nextAttempts} de 5.`);
      }
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("pulsotech_admin_authenticated");
    } catch {}
    setIsAuthenticated(false);
    setPinInput("");
    setPinError("");
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinInput.trim() !== adminPin.trim()) {
      setPinChangeNotice({ text: "El PIN actual ingresado no es correcto.", isError: true });
      return;
    }
    if (newPinInput.trim().length < 4) {
      setPinChangeNotice({ text: "El nuevo PIN debe tener al menos 4 dígitos.", isError: true });
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinChangeNotice({ text: "Los nuevos PINs no coinciden. Verifícalos.", isError: true });
      return;
    }

    try {
      localStorage.setItem("pulsotech_admin_pin", newPinInput.trim());
      setAdminPin(newPinInput.trim());
      setCurrentPinInput("");
      setNewPinInput("");
      setConfirmPinInput("");
      setPinChangeNotice({ text: "¡PIN de seguridad actualizado con éxito! Tu nueva clave está activa.", isError: false });
      setTimeout(() => setPinChangeNotice(null), 4000);
    } catch {
      setPinChangeNotice({ text: "Error al guardar el nuevo PIN en el almacenamiento.", isError: true });
    }
  };

  // Estados de WhatsApp y Ajustes
  const [phoneInput, setPhoneInput] = useState(whatsappNumber);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [settingsViewTab, setSettingsViewTab] = useState<"whatsapp" | "security" | "backup">("whatsapp");
  const [showCurrentPinToggle, setShowCurrentPinToggle] = useState(false);
  const [showNewPinToggle, setShowNewPinToggle] = useState(false);
  const [showConfirmPinToggle, setShowConfirmPinToggle] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState("");

  // Estados de Cupones
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"percentage" | "fixed">("percentage");
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(50);

  // Modal de Código QR de Producto
  const [qrModalProduct, setQrModalProduct] = useState<Product | null>(null);
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  // Filtros de búsqueda e interacción en inventario
  const [searchFilter, setSearchFilter] = useState("");
  const [stockQuickFilter, setStockQuickFilter] = useState<"all" | "in-stock" | "low" | "out">("all");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>("all");
  const [inventoryBrandFilter, setInventoryBrandFilter] = useState<string>("all");
  const [inventorySortBy, setInventorySortBy] = useState<"default" | "stock-asc" | "stock-desc" | "price-asc" | "price-desc" | "name">("default");

  // Estados para gestión de filtros (marcas y categorías)
  const [newBrandInput, setNewBrandInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [filtersViewTab, setFiltersViewTab] = useState<"brands" | "categories">("brands");
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [filterStatusFilter, setFilterStatusFilter] = useState<"all" | "with-products" | "empty">("all");
  const [editingBrandName, setEditingBrandName] = useState<{ original: string; current: string } | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<{ original: string; current: string } | null>(null);
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: "brand" | "category";
    name: string;
    productCount: number;
  } | null>(null);

  // Registro de ventas en localStorage (persistente y con soporte para analíticas)
  const SALES_STORAGE_KEY = "pulsotech_sales_records";
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(SALES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((s: SaleRecord) => !["VTA-1001", "VTA-1002", "VTA-1003"].includes(s.id))
            .map((s: SaleRecord) => {
              let ts = s.timestamp;
              if (typeof ts !== "number" || isNaN(ts)) {
                const parsedDate = Date.parse(s.date);
                ts = !isNaN(parsedDate) ? parsedDate : Date.now();
              }
              return {
                ...s,
                timestamp: ts,
                paymentMethod: s.paymentMethod || "Yape / Plin",
                channel: s.channel || "WhatsApp",
              };
            });
        }
      }
    } catch {
      // Ignorar error de carga
    }
    return [];
  });

  // Sincronizar ventas con Supabase al montar el panel
  useEffect(() => {
    let isCancelled = false;
    const loadCloudSales = async () => {
      try {
        const cloudSales = await fetchSalesRecordsFromSupabase();
        if (!isCancelled && cloudSales && cloudSales.length > 0) {
          const sanitized = cloudSales
            .filter((s: SaleRecord) => !["VTA-1001", "VTA-1002", "VTA-1003"].includes(s.id))
            .map((s: SaleRecord) => {
              let ts = s.timestamp;
              if (typeof ts !== "number" || isNaN(ts)) {
                const parsedDate = Date.parse(s.date);
                ts = !isNaN(parsedDate) ? parsedDate : Date.now();
              }
              return {
                ...s,
                timestamp: ts,
                paymentMethod: s.paymentMethod || "Yape / Plin",
                channel: s.channel || "WhatsApp",
              };
            });
          setSales(sanitized);
          try {
            localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sanitized));
          } catch {
            // Ignorar
          }
        }
      } catch (err) {
        console.error("Error al cargar ventas desde Supabase:", err);
      }
    };
    void loadCloudSales();
    return () => {
      isCancelled = true;
    };
  }, []);

  const saveSalesToStorage = (updatedSales: SaleRecord[]) => {
    setSales(updatedSales);
    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(updatedSales));
    } catch {
      // Ignorar error de guardado
    }
    // Guardar en la nube automáticamente
    saveSalesRecordsToSupabase(updatedSales).catch((err) => {
      console.error("Error guardando ventas en Supabase:", err);
    });
  };

  // Sub-vista activa dentro de Ventas & Despacho
  const [salesViewMode, setSalesViewMode] = useState<"orders" | "register" | "analytics">("orders");

  // Filtros de visualización para Analíticas y Reportes de Ventas
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("all");
  const [salesChannelFilter, setSalesChannelFilter] = useState<string>("all");
  const [salesSearchQuery, setSalesSearchQuery] = useState<string>("");

  // Registro de Venta Manual
  const [newSaleProduct, setNewSaleProduct] = useState(products[0]?.id || "");
  const [isManualProductEntry, setIsManualProductEntry] = useState(false);
  const [manualProductName, setManualProductName] = useState("");
  const [saleFormError, setSaleFormError] = useState("");
  const [lastRegisteredSale, setLastRegisteredSale] = useState<SaleRecord | null>(null);
  const [newSaleQty, setNewSaleQty] = useState(1);
  const [newSaleCustomer, setNewSaleCustomer] = useState("");
  const [newSaleChannel, setNewSaleChannel] = useState<"WhatsApp" | "Presencial" | "Web">("WhatsApp");
  const [newSalePayment, setNewSalePayment] = useState("Yape / Plin");
  const [newSaleCustomPrice, setNewSaleCustomPrice] = useState<string>("");
  const [newSaleDate, setNewSaleDate] = useState(() => getLocalDateString());
  const [newSaleTime, setNewSaleTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [newSaleNotes, setNewSaleNotes] = useState("");
  const [newSaleCustomerPhone, setNewSaleCustomerPhone] = useState("");
  const [newSaleCustomerAddress, setNewSaleCustomerAddress] = useState("");
  const [newSaleDeliveryStatus, setNewSaleDeliveryStatus] = useState<"pending" | "shipped" | "delivered" | "cancelled">("pending");
  const [newSaleTrackingNumber, setNewSaleTrackingNumber] = useState("");
  const [salesStatusFilter, setSalesStatusFilter] = useState<string>("all");

  // Mantener sincronizado el producto seleccionado en el formulario de ventas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (products.length > 0) {
        if (!newSaleProduct || !products.some((p) => p.id === newSaleProduct)) {
          setNewSaleProduct(products[0].id);
        }
      } else {
        setIsManualProductEntry(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [products, newSaleProduct]);

  // Modales de Logística & Despacho
  const [receiptModalSale, setReceiptModalSale] = useState<SaleRecord | null>(null);
  const [whatsappTemplateSale, setWhatsappTemplateSale] = useState<SaleRecord | null>(null);
  const [customMsgPhone, setCustomMsgPhone] = useState("");
  const [copiedTemplateIndex, setCopiedTemplateIndex] = useState<number | null>(null);

  const [successNotice, setSuccessNotice] = useState("");

  // ====== ESTADO DEL FORMULARIO DE AGREGAR / EDITAR PRODUCTO (INICIALMENTE LIMPIO) ======
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showAddBrandInline, setShowAddBrandInline] = useState(false);
  const [inlineBrandName, setInlineBrandName] = useState("");
  const [showAddCategoryInline, setShowAddCategoryInline] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState("");
  const [formActiveStep, setFormActiveStep] = useState<1 | 2 | 3 | 4>(1);
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

  // Métricas Generales
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const lowStockCount = products.filter((p) => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 5).length;
  const outOfStockCount = products.filter((p) => (p.stockCount || 0) <= 0).length;
  const inStockCount = products.filter((p) => (p.stockCount || 0) > 5).length;
  const totalUnitsInStock = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  const inventoryTotalValue = products.reduce((acc, p) => acc + ((p.stockCount || 0) * (p.price || 0)), 0);

  // Cálculos de Períodos Temporales para Analíticas de Ventas
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const todayStart = new Date(currentYear, currentMonth, now.getDate(), 0, 0, 0, 0).getTime();
  const todayEnd = new Date(currentYear, currentMonth, now.getDate(), 23, 59, 59, 999).getTime();
  const thisWeekStart = new Date(currentYear, currentMonth, now.getDate() - 6, 0, 0, 0, 0).getTime();
  const thisMonthStart = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0).getTime();
  const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).getTime();

  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthStart = new Date(lastMonthYear, lastMonthIndex, 1, 0, 0, 0, 0).getTime();
  const lastMonthEnd = new Date(lastMonthYear, lastMonthIndex + 1, 0, 23, 59, 59, 999).getTime();

  const thisMonthName = monthNames[currentMonth];
  const lastMonthName = monthNames[lastMonthIndex];

  // Conteo de pedidos por período (para las insignias de filtro)
  const countToday = sales.filter((s) => s.timestamp >= todayStart && s.timestamp <= todayEnd).length;
  const countThisWeek = sales.filter((s) => s.timestamp >= thisWeekStart && s.timestamp <= todayEnd).length;
  const countThisMonth = sales.filter((s) => s.timestamp >= thisMonthStart && s.timestamp <= thisMonthEnd).length;
  const countLastMonth = sales.filter((s) => s.timestamp >= lastMonthStart && s.timestamp <= lastMonthEnd).length;
  const countAll = sales.length;

  // Ventas filtradas según el período temporal activo
  const periodSales = sales.filter((s) => {
    const ts = s.timestamp || 0;
    if (salesPeriod === "today") return ts >= todayStart && ts <= todayEnd;
    if (salesPeriod === "this_week") return ts >= thisWeekStart && ts <= todayEnd;
    if (salesPeriod === "this_month") return ts >= thisMonthStart && ts <= thisMonthEnd;
    if (salesPeriod === "last_month") return ts >= lastMonthStart && ts <= lastMonthEnd;
    return true;
  });

  // Ventas mostradas en la tabla (aplica filtro por canal, estado de despacho y buscador)
  const displayedSales = periodSales.filter((s) => {
    if (salesChannelFilter !== "all" && s.channel !== salesChannelFilter) {
      return false;
    }
    if (salesStatusFilter !== "all") {
      const currentStatus = s.deliveryStatus || "pending";
      if (currentStatus !== salesStatusFilter) return false;
    }
    if (salesSearchQuery.trim()) {
      const q = salesSearchQuery.toLowerCase();
      const matchProduct = (s.productName || "").toLowerCase().includes(q);
      const matchCustomer = (s.customerName || "").toLowerCase().includes(q);
      const matchId = (s.id || "").toLowerCase().includes(q);
      const matchPayment = (s.paymentMethod || "").toLowerCase().includes(q);
      const matchPhone = (s.customerPhone || "").toLowerCase().includes(q);
      const matchAddress = (s.customerAddress || "").toLowerCase().includes(q);
      const matchTracking = (s.trackingNumber || "").toLowerCase().includes(q);
      return (
        matchProduct ||
        matchCustomer ||
        matchId ||
        matchPayment ||
        matchPhone ||
        matchAddress ||
        matchTracking
      );
    }
    return true;
  });

  // KPIs del Período
  const periodRevenue = periodSales.reduce((acc, s) => acc + s.total, 0);
  const periodOrdersCount = periodSales.length;
  const periodUnitsCount = periodSales.reduce((acc, s) => acc + s.quantity, 0);
  const periodAvgTicket = periodOrdersCount > 0 ? periodRevenue / periodOrdersCount : 0;

  const periodLabel =
    salesPeriod === "today"
      ? "Hoy"
      : salesPeriod === "this_week"
      ? "Esta Semana (Últimos 7 días)"
      : salesPeriod === "this_month"
      ? `Este Mes (${thisMonthName} ${currentYear})`
      : salesPeriod === "last_month"
      ? `Mes Pasado (${lastMonthName} ${lastMonthYear})`
      : "Todo el Historial";

  // Distribución por canal en el período seleccionado
  const whatsappSales = periodSales.filter((s) => s.channel === "WhatsApp");
  const presencialSales = periodSales.filter((s) => s.channel === "Presencial");
  const webSales = periodSales.filter((s) => s.channel === "Web");

  const whatsappRevenue = whatsappSales.reduce((acc, s) => acc + s.total, 0);
  const presencialRevenue = presencialSales.reduce((acc, s) => acc + s.total, 0);
  const webRevenue = webSales.reduce((acc, s) => acc + s.total, 0);

  // Top productos más vendidos en el período
  const productSalesMap = new Map<string, { name: string; units: number; revenue: number }>();
  periodSales.forEach((s) => {
    const key = s.productName || "Producto";
    const existing = productSalesMap.get(key) || { name: key, units: 0, revenue: 0 };
    existing.units += s.quantity;
    existing.revenue += s.total;
    productSalesMap.set(key, existing);
  });
  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
    .slice(0, 5);

  // Agrupación para el Gráfico de Barras de Ingresos por Fecha
  const salesByDateMap = new Map<
    string,
    { label: string; sublabel: string; revenue: number; orders: number; ts: number }
  >();
  periodSales.forEach((s) => {
    const d = new Date(s.timestamp || 0);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayLabel = `${d.getDate()} ${monthNames[d.getMonth()].slice(0, 3)}`;
    const dayName = d.toLocaleDateString("es-PE", { weekday: "short" });
    const existing = salesByDateMap.get(dateKey) || {
      label: dayLabel,
      sublabel: dayName.toUpperCase(),
      revenue: 0,
      orders: 0,
      ts: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
    };
    existing.revenue += s.total;
    existing.orders += 1;
    salesByDateMap.set(dateKey, existing);
  });

  const chartBars = Array.from(salesByDateMap.values()).sort((a, b) => a.ts - b.ts);
  const maxBarRevenue = Math.max(...chartBars.map((b) => b.revenue), 10);
  const bestDay = chartBars.length > 0 ? [...chartBars].sort((a, b) => b.revenue - a.revenue)[0] : null;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, "");
    setWhatsappNumber(cleanPhone);
    setPhoneSaved(true);
    setSuccessNotice("Número de WhatsApp actualizado correctamente.");
    setTimeout(() => {
      setPhoneSaved(false);
      setSuccessNotice("");
    }, 3500);
  };

  const handleForceCloudSync = async () => {
    setIsSyncingCloud(true);
    setSyncSuccessMessage("");
    try {
      await refreshFromCloud();
      setSyncSuccessMessage("Sincronización con la nube completada exitosamente.");
    } catch {
      setSyncSuccessMessage("Modo local activo. Tus datos permanecen resguardados.");
    } finally {
      setIsSyncingCloud(false);
      setTimeout(() => setSyncSuccessMessage(""), 4000);
    }
  };

  const handleRestoreBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        if (typeof raw !== "string") return;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.products)) {
          alert("El archivo seleccionado no tiene el formato de respaldo de PulsoTech.");
          return;
        }
        if (
          confirm(
            `Se detectaron ${parsed.products.length} productos en el respaldo.\n\n¿Deseas restaurar este catálogo ahora? Esta acción actualizará los datos locales.`
          )
        ) {
          localStorage.setItem("pulsotech_custom_products", JSON.stringify(parsed.products));
          if (Array.isArray(parsed.brands) && parsed.brands.length > 0) {
            localStorage.setItem("pulsotech_custom_brands", JSON.stringify(parsed.brands));
          }
          if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
            localStorage.setItem("pulsotech_custom_categories", JSON.stringify(parsed.categories));
          }
          if (Array.isArray(parsed.sales)) {
            localStorage.setItem("pulsotech_sales_records", JSON.stringify(parsed.sales));
          }
          alert("Copia de seguridad restaurada correctamente. Recargando el panel...");
          window.location.reload();
        }
      } catch {
        alert("Ocurrió un error al procesar el archivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleRecordManualSale = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleFormError("");

    let productName = "";
    let unitPrice = 0;
    let selectedProd: Product | undefined;

    if (isManualProductEntry || products.length === 0) {
      if (!manualProductName.trim()) {
        setSaleFormError("Por favor ingresa el nombre del producto vendido.");
        return;
      }
      productName = manualProductName.trim();
      const customPriceParsed = parseFloat(newSaleCustomPrice);
      if (isNaN(customPriceParsed) || customPriceParsed <= 0) {
        setSaleFormError("Por favor ingresa el precio total en Soles (ej: 89.00).");
        return;
      }
      unitPrice = customPriceParsed / (newSaleQty || 1);
    } else {
      selectedProd = products.find((i) => i.id === newSaleProduct) || products[0];
      if (!selectedProd) {
        setSaleFormError("No se encontró el producto. Puedes usar la opción 'Escribir producto manual'.");
        return;
      }
      productName = selectedProd.name;
      unitPrice = selectedProd.price;

      if (selectedProd.stockCount < newSaleQty) {
        const confirmSell = window.confirm(
          `Atención: El producto "${selectedProd.name}" solo tiene ${selectedProd.stockCount} unidad(es) en inventario. ¿Deseas procesar la venta de ${newSaleQty} unidad(es) de todos modos?`
        );
        if (!confirmSell) return;
      }

      updateStock(selectedProd.id, -newSaleQty, true);
    }

    const nowRef = new Date();
    const [yStr, mStr, dStr] = (newSaleDate || getLocalDateString()).split("-");
    const [hStr, minStr] = (newSaleTime || "12:00").split(":");
    const year = parseInt(yStr) || nowRef.getFullYear();
    const month = (parseInt(mStr) || (nowRef.getMonth() + 1)) - 1;
    const day = parseInt(dStr) || nowRef.getDate();
    const hours = parseInt(hStr) || 12;
    const mins = parseInt(minStr) || 0;

    const saleDateObj = new Date(year, month, day, hours, mins, 0);
    const timestamp = saleDateObj.getTime();

    const dateFormatted = `${saleDateObj.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}, ${saleDateObj.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const computedTotal =
      newSaleCustomPrice !== ""
        ? parseFloat(newSaleCustomPrice) || 0
        : unitPrice * newSaleQty;

    const newRecord: SaleRecord = {
      id: `VTA-${Math.floor(1000 + Math.random() * 9000)}`,
      productName,
      quantity: newSaleQty,
      total: computedTotal,
      channel: newSaleChannel,
      paymentMethod: newSalePayment,
      customerName: newSaleCustomer.trim() || "Cliente",
      customerPhone: newSaleCustomerPhone.trim() || undefined,
      customerAddress: newSaleCustomerAddress.trim() || undefined,
      deliveryStatus: newSaleDeliveryStatus,
      trackingNumber: newSaleTrackingNumber.trim() || undefined,
      date: dateFormatted,
      timestamp,
      notes: newSaleNotes.trim() || undefined,
    };

    saveSalesToStorage([newRecord, ...sales]);
    setLastRegisteredSale(newRecord);
    setNewSaleCustomer("");
    setNewSaleCustomerPhone("");
    setNewSaleCustomerAddress("");
    setNewSaleTrackingNumber("");
    setNewSaleDeliveryStatus("pending");
    setNewSaleQty(1);
    setNewSaleCustomPrice("");
    setNewSaleNotes("");
    if (isManualProductEntry) {
      setManualProductName("");
    }
    // Asegurar que la nueva orden se muestre inmediatamente en el listado
    setSalesPeriod("all");
    setSalesChannelFilter("all");
    setSalesStatusFilter("all");
    setSalesSearchQuery("");
    setSalesViewMode("orders");

    setSuccessNotice(
      `Venta #${newRecord.id} registrada con éxito. Total: ${STORE_SETTINGS.currencySymbol}${newRecord.total.toFixed(2)}.`
    );
    setTimeout(() => setSuccessNotice(""), 6000);
  };

  const handleUpdateDeliveryStatus = (
    saleId: string,
    status: "pending" | "shipped" | "delivered" | "cancelled"
  ) => {
    const updated = sales.map((s) =>
      s.id === saleId ? { ...s, deliveryStatus: status } : s
    );
    saveSalesToStorage(updated);
    setSuccessNotice(`Estado de la orden #${saleId} actualizado.`);
    setTimeout(() => setSuccessNotice(""), 3000);
  };

  const handleDeleteSale = (saleId: string) => {
    if (confirm("¿Deseas eliminar este registro de venta?")) {
      const updated = sales.filter((s) => s.id !== saleId);
      saveSalesToStorage(updated);
      setSuccessNotice("Registro de venta eliminado.");
      setTimeout(() => setSuccessNotice(""), 3000);
    }
  };

  const handleClearAllSales = () => {
    if (
      confirm(
        "¿Estás seguro de vaciar todo el historial de ventas? Esta acción dejará los ingresos en S/ 0.00."
      )
    ) {
      saveSalesToStorage([]);
      setSuccessNotice("Historial de ventas vaciado correctamente.");
      setTimeout(() => setSuccessNotice(""), 3000);
    }
  };

  const handleExportSalesCSV = () => {
    const dataToExport = displayedSales.length > 0 ? displayedSales : sales;
    if (dataToExport.length === 0) {
      alert("No hay ventas registradas para exportar en este período.");
      return;
    }
    const headers = [
      "ID",
      "Producto",
      "Cantidad",
      "Total_PEN",
      "Canal",
      "Metodo_Pago",
      "Cliente",
      "Fecha_Hora",
      "Notas",
    ];
    const rows = dataToExport.map((s) => [
      s.id,
      `"${(s.productName || "").replace(/"/g, '""')}"`,
      s.quantity,
      s.total.toFixed(2),
      s.channel,
      `"${(s.paymentMethod || "No especificado").replace(/"/g, '""')}"`,
      `"${(s.customerName || "").replace(/"/g, '""')}"`,
      `"${s.date}"`,
      `"${(s.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ventas_${salesPeriod}_pulsotech_${getLocalDateString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportProductsCSV = () => {
    if (products.length === 0) {
      alert("No hay productos en inventario para exportar.");
      return;
    }
    const headers = ["ID", "Nombre", "Marca", "Categoria", "Precio_PEN", "Precio_Original_PEN", "Stock", "En_Oferta"];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      p.price.toFixed(2),
      (p.originalPrice || p.price).toFixed(2),
      p.stockCount,
      p.originalPrice && p.originalPrice > p.price ? "SI" : "NO",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_pulsotech_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBackupJSON = () => {
    const backupData = {
      store: "PulsoTech",
      exportedAt: new Date().toISOString(),
      productsCount: products.length,
      brands,
      categories,
      products,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `backup_catalogo_pulsotech_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) {
      alert("Por favor ingresa un código para el cupón (ej: VERANO10).");
      return;
    }
    const exists = coupons.some((c) => c.code.toUpperCase() === newCouponCode.trim().toUpperCase());
    if (exists) {
      alert("Ya existe un cupón con este código.");
      return;
    }
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponValue) || 1,
      minPurchase: Number(newCouponMin) || 0,
      isActive: true,
    });
    setNewCouponCode("");
    setSuccessNotice(`¡Cupón ${newCouponCode.trim().toUpperCase()} creado con éxito!`);
    setTimeout(() => setSuccessNotice(""), 3000);
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
    const val = newBrandInput.trim();
    if (!val) return;
    if (brands.some((b) => b.toLowerCase() === val.toLowerCase())) {
      alert("Ya existe una marca con este nombre.");
      return;
    }
    addBrand(val);
    setSuccessNotice(`Marca "${val}" agregada exitosamente.`);
    setNewBrandInput("");
    setTimeout(() => setSuccessNotice(""), 3500);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCategoryInput.trim();
    if (!val) return;
    if (categories.some((c) => c.toLowerCase() === val.toLowerCase())) {
      alert("Ya existe una categoría con este nombre.");
      return;
    }
    addCategory(val);
    setSuccessNotice(`Categoría "${val}" agregada exitosamente.`);
    setNewCategoryInput("");
    setTimeout(() => setSuccessNotice(""), 3500);
  };

  const handleSaveBrandRename = () => {
    if (!editingBrandName) return;
    const { original, current } = editingBrandName;
    const trimmed = current.trim();
    if (!trimmed || trimmed.toLowerCase() === original.toLowerCase()) {
      setEditingBrandName(null);
      return;
    }
    if (brands.some((b) => b.toLowerCase() === trimmed.toLowerCase() && b.toLowerCase() !== original.toLowerCase())) {
      alert("Ya existe otra marca con este nombre.");
      return;
    }
    updateBrand(original, trimmed);
    setSuccessNotice(`Marca actualizada a "${trimmed}".`);
    setEditingBrandName(null);
    setTimeout(() => setSuccessNotice(""), 3500);
  };

  const handleSaveCategoryRename = () => {
    if (!editingCategoryName) return;
    const { original, current } = editingCategoryName;
    const trimmed = current.trim();
    if (!trimmed || trimmed.toLowerCase() === original.toLowerCase()) {
      setEditingCategoryName(null);
      return;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase() && c.toLowerCase() !== original.toLowerCase())) {
      alert("Ya existe otra categoría con este nombre.");
      return;
    }
    updateCategory(original, trimmed);
    setSuccessNotice(`Categoría actualizada a "${trimmed}".`);
    setEditingCategoryName(null);
    setTimeout(() => setSuccessNotice(""), 3500);
  };

  const toggleExpandBrand = (b: string) => {
    setExpandedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const toggleExpandCategory = (c: string) => {
    setExpandedCategories((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const executeDeleteItem = () => {
    if (!deleteConfirmItem) return;
    if (deleteConfirmItem.type === "brand") {
      deleteBrand(deleteConfirmItem.name);
      setSuccessNotice(`Marca "${deleteConfirmItem.name}" eliminada.`);
    } else {
      deleteCategory(deleteConfirmItem.name);
      setSuccessNotice(`Categoría "${deleteConfirmItem.name}" eliminada.`);
    }
    setDeleteConfirmItem(null);
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
    setFormActiveStep(1);

    setActiveTab("add_product");
  };

  // Limpiar formulario para nuevo producto (100% LIMPIO, SIN EJEMPLOS PRECARGADOS)
  const handleNewProductClick = () => {
    setEditingProductId(null);
    setFormActiveStep(1);
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

  const filteredInventory = products
    .filter((item) => {
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          (item.category && item.category.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (inventoryCategoryFilter !== "all" && item.category !== inventoryCategoryFilter) {
        return false;
      }
      if (inventoryBrandFilter !== "all" && item.brand !== inventoryBrandFilter) {
        return false;
      }
      if (stockQuickFilter === "in-stock" && (item.stockCount || 0) <= 5) {
        return false;
      }
      if (stockQuickFilter === "low" && ((item.stockCount || 0) <= 0 || (item.stockCount || 0) > 5)) {
        return false;
      }
      if (stockQuickFilter === "out" && (item.stockCount || 0) > 0) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (inventorySortBy === "stock-asc") return (a.stockCount || 0) - (b.stockCount || 0);
      if (inventorySortBy === "stock-desc") return (b.stockCount || 0) - (a.stockCount || 0);
      if (inventorySortBy === "price-asc") return a.price - b.price;
      if (inventorySortBy === "price-desc") return b.price - a.price;
      if (inventorySortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-neutral-400">Verificando acceso de seguridad...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none">
        {/* Glow de fondo */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-neutral-300 font-bold uppercase tracking-wider">
              Terminal POS PulsoTech
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800">
            Acceso Restringido
          </span>
        </div>

        {/* Main Lock Card */}
        <div className="max-w-sm w-full mx-auto my-auto py-6 z-10 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl mx-auto flex items-center justify-center relative">
              <Lock className="w-7 h-7 text-emerald-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1 ring-4 ring-[#0a0a0c] animate-pulse" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Panel Administrativo
              </h1>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                Ingresa tu PIN de seguridad para acceder a la gestión de productos, inventario y ventas.
              </p>
            </div>
          </div>

          {/* Indicador de dígitos ingresados */}
          <div className="flex items-center justify-center gap-2.5 py-1">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const hasChar = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                    hasChar
                      ? "bg-emerald-400 scale-110 shadow-xs shadow-emerald-400/60"
                      : "bg-neutral-800 border border-neutral-700"
                  }`}
                />
              );
            })}
          </div>

          {/* Formulario y Teclado Táctil */}
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={12}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, "").slice(0, 12));
                  setPinError("");
                }}
                placeholder="••••••"
                autoFocus
                disabled={lockoutSeconds > 0}
                className={`w-full text-center tracking-[0.25em] font-mono font-black text-xl py-3 px-10 rounded-2xl bg-neutral-900/90 border text-white placeholder-neutral-700 focus:outline-none transition-all shadow-inner ${
                  pinError
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-neutral-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1 cursor-pointer transition-colors"
                title={showPin ? "Ocultar PIN" : "Mostrar PIN"}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {pinError && (
              <p className="text-xs font-bold text-red-400 animate-in fade-in">
                {pinError}
              </p>
            )}

            {lockoutSeconds > 0 && (
              <p className="text-xs font-bold text-amber-400 animate-in fade-in">
                Demasiados intentos fallidos. Espera {lockoutSeconds} segundos.
              </p>
            )}

            {/* Teclado numérico táctil (ideal para celular) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (lockoutSeconds > 0) return;
                    if (pinInput.length < 12) {
                      setPinInput((prev) => prev + num.toString());
                      setPinError("");
                    }
                  }}
                  disabled={lockoutSeconds > 0}
                  className="h-11 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 text-lg font-mono font-bold text-white border border-neutral-800 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setPinInput("");
                  setPinError("");
                }}
                disabled={lockoutSeconds > 0}
                className="h-11 rounded-xl bg-neutral-900/40 hover:bg-neutral-800 active:scale-95 text-[11px] font-bold text-neutral-400 hover:text-white border border-neutral-800/60 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 uppercase tracking-wider"
              >
                Borrar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (lockoutSeconds > 0) return;
                  if (pinInput.length < 12) {
                    setPinInput((prev) => prev + "0");
                    setPinError("");
                  }
                }}
                disabled={lockoutSeconds > 0}
                className="h-11 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 text-lg font-mono font-bold text-white border border-neutral-800 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                0
              </button>

              <button
                type="button"
                onClick={() => {
                  setPinInput((prev) => prev.slice(0, -1));
                  setPinError("");
                }}
                disabled={lockoutSeconds > 0}
                className="h-11 rounded-xl bg-neutral-900/40 hover:bg-neutral-800 active:scale-95 text-base font-bold text-neutral-400 hover:text-white border border-neutral-800/60 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
                title="Retroceder"
              >
                ⌫
              </button>
            </div>

            <button
              type="submit"
              disabled={lockoutSeconds > 0 || pinInput.length < 4}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              <Unlock className="w-4 h-4" />
              <span>Acceder al Panel</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="max-w-md w-full mx-auto text-center z-10 text-[11px] text-neutral-600">
          <span>Acceso restringido únicamente al administrador de PulsoTech.</span>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      id: "inventory" as const,
      label: "Inventario",
      icon: Package,
      count: products.length,
    },
    {
      id: "sales" as const,
      label: "Ventas & Despacho",
      icon: BarChart3,
      count: sales.length,
    },
    {
      id: "add_product" as const,
      label: editingProductId ? "Editar Producto" : "Nuevo Producto",
      icon: editingProductId ? Edit3 : PlusCircle,
      tag: editingProductId ? "En Edición" : undefined,
    },
    {
      id: "filters" as const,
      label: "Marcas & Categorías",
      icon: Filter,
    },
    {
      id: "coupons" as const,
      label: "Cupones de Descuento",
      icon: Tag,
      count: coupons.length,
    },
    {
      id: "settings" as const,
      label: "Ajustes & Sistema",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 antialiased font-sans flex">
      {/* ================= BARRA LATERAL VERTICAL DESKTOP (POS REAL) ================= */}
      <aside className="hidden md:flex w-64 bg-neutral-950 text-neutral-300 border-r border-neutral-800/80 fixed inset-y-0 left-0 z-40 flex-col justify-between select-none">
        {/* Superior: Branding y Navegación Vertical */}
        <div className="flex flex-col">
          {/* Logo y Encabezado del Sistema POS */}
          <div className="h-16 px-5 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" showText={false} />
              <div>
                <div className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>PulsoTech</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    POS
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">
                  Terminal de Control Operativo
                </div>
              </div>
            </div>
          </div>

          {/* Menú Vertical de Módulos */}
          <nav className="p-3 space-y-1.5 pt-4">
            <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Módulos del Sistema
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === "add_product" && !editingProductId) {
                      handleNewProductClick();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  onMouseUp={(e) => e.currentTarget.blur()}
                  onPointerUp={(e) => e.currentTarget.blur()}
                  className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors duration-150 cursor-pointer select-none outline-none focus:outline-none focus:ring-0 ${
                    isActive
                      ? "bg-white/[0.08] text-white font-bold border border-white/10 shadow-xs"
                      : "text-neutral-400 font-medium hover:text-neutral-100 hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  {/* Barra Indicadora Esmeralda Exclusiva del Ítem Activo */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400 shadow-xs shadow-emerald-400/50" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-emerald-400"
                          : "text-neutral-500 group-hover:text-neutral-300"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {typeof item.count === "number" && (
                    <span
                      className={`text-[10px] font-mono font-bold shrink-0 transition-colors ${
                        isActive
                          ? "px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                          : "text-neutral-500 px-1.5"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}

                  {item.tag && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Inferior: Perfil de Operador y Cerrar Sesión (Limpio, sin Base de Datos) */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/80">
          <div className="px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                L
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">Lionel (Admin)</div>
                <div className="text-[10px] font-mono text-neutral-400">Terminal Activo</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
              title="Cerrar sesión y bloquear panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= HEADER SUPERIOR MÓVIL (md:hidden) ================= */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-neutral-950 text-white border-b border-neutral-800 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="text-sm font-black tracking-tight">PulsoTech POS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewProductClick}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= GAVETA / DRAWER MÓVIL (md:hidden) ================= */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />

          <div className="relative w-72 max-w-[85vw] bg-neutral-950 text-neutral-300 border-r border-neutral-800 h-full flex flex-col justify-between p-4 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <Logo size="sm" showText={false} />
                  <div>
                    <div className="text-sm font-black text-white">PulsoTech POS</div>
                    <div className="text-[10px] text-neutral-400">Sistema Administrativo</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5 py-4">
                <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Módulos
                </div>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.id === "add_product" && !editingProductId) {
                          handleNewProductClick();
                        } else {
                          setActiveTab(item.id);
                        }
                        setIsMobileNavOpen(false);
                      }}
                      onPointerUp={(e) => e.currentTarget.blur()}
                      className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors duration-150 cursor-pointer select-none outline-none focus:outline-none focus:ring-0 ${
                        isActive
                          ? "bg-white/[0.08] text-white font-bold border border-white/10 shadow-xs"
                          : "text-neutral-400 font-medium hover:text-neutral-100 hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400 shadow-xs shadow-emerald-400/50" />
                      )}

                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-neutral-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.count === "number" && (
                        <span className={`text-[10px] font-mono font-bold ${
                          isActive
                            ? "px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                            : "text-neutral-500 px-1.5"
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <div className="flex items-center justify-between px-2 text-xs">
                <span className="text-neutral-400">Lionel (Admin)</span>
                <span className="text-[10px] font-mono text-neutral-400">Terminal Activo</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-800 hover:border-red-900/50 hover:bg-red-500/10 text-neutral-300 hover:text-red-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ÁREA PRINCIPAL DE CONTENIDO ================= */}
      <div className="md:pl-64 flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8fafc]">
        {/* Encabezado Contextual Superior Desktop */}
        <header className="bg-white border-b border-neutral-200/80 sticky top-0 z-20 px-4 sm:px-8 py-3.5 hidden md:flex items-center justify-between gap-4 shadow-2xs">
          <div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Sistema POS / {navItems.find((n) => n.id === activeTab)?.label || "Módulo"}
            </div>
            <h1 className="text-base font-black text-neutral-950 tracking-tight">
              {activeTab === "inventory" && "Inventario de Productos"}
              {activeTab === "sales" && "Ventas & Logística de Despacho"}
              {activeTab === "add_product" && (editingProductId ? "Edición de Producto" : "Registrar Nuevo Producto")}
              {activeTab === "filters" && "Marcas y Categorías"}
              {activeTab === "coupons" && "Cupones Promocionales"}
              {activeTab === "settings" && "Ajustes del Sistema y WhatsApp"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== "add_product" && (
              <button
                type="button"
                onClick={handleNewProductClick}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>＋ Agregar Producto</span>
              </button>
            )}

            <div className="h-5 w-px bg-neutral-200" />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200/80 text-xs font-medium text-neutral-600">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span className="font-mono">
                {new Date().toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido del Módulo Activo */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full flex-1 pt-16 md:pt-6">
          {/* Banner de Notificación de Éxito */}
          {successNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessNotice("")}
                className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= PESTAÑA 1: INVENTARIO ================= */}
          {activeTab === "inventory" && (
          <div className="space-y-6">
            {/* KPIs Ejecutivos del Inventario */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* 1. Modelos Únicos */}
              <div
                onClick={() => {
                  setStockQuickFilter("all");
                  setInventoryCategoryFilter("all");
                  setInventoryBrandFilter("all");
                  setSearchFilter("");
                }}
                className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-neutral-400 hover:shadow-xs transition-all text-left cursor-pointer shadow-2xs relative overflow-hidden group"
                title="Click para ver todo el catálogo"
              >
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold mb-2">
                  <span className="uppercase tracking-wider">Modelos Registrados</span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-mono">
                  {products.length}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1.5 flex items-center justify-between">
                  <span>{categories.length} categorías activas</span>
                  <span className="font-bold text-neutral-900 group-hover:translate-x-0.5 transition-transform hidden sm:inline">
                    Ver todos &rarr;
                  </span>
                </div>
              </div>

              {/* 2. Unidades Físicas en Almacén */}
              <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold mb-2">
                  <span className="uppercase tracking-wider">Stock Físico Total</span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-mono">
                  {totalUnitsInStock} <span className="text-xs font-bold text-neutral-500 font-sans">uds</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1.5">
                  Unidades físicas disponibles
                </div>
              </div>

              {/* 3. Valorización del Inventario */}
              <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold mb-2">
                  <span className="uppercase tracking-wider">Valorización de Stock</span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-mono">
                  {STORE_SETTINGS.currencySymbol}{inventoryTotalValue.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1.5">
                  Capital activo en mercadería
                </div>
              </div>

              {/* 4. Estado de Almacén & Alertas */}
              <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold mb-2">
                  <span className="uppercase tracking-wider">Salud del Inventario</span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setStockQuickFilter(stockQuickFilter === "in-stock" ? "all" : "in-stock")}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      stockQuickFilter === "in-stock"
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100 text-neutral-800"
                    }`}
                    title="Filtrar productos con stock normal"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold uppercase">Stock</span>
                    </div>
                    <div className="text-sm font-extrabold font-mono mt-0.5">{inStockCount}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockQuickFilter(stockQuickFilter === "low" ? "all" : "low")}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      stockQuickFilter === "low"
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100 text-neutral-800"
                    }`}
                    title="Filtrar productos con bajo stock (1 a 5 uds)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold uppercase">Bajo</span>
                    </div>
                    <div className="text-sm font-extrabold font-mono mt-0.5">{lowStockCount}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockQuickFilter(stockQuickFilter === "out" ? "all" : "out")}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      stockQuickFilter === "out"
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100 text-neutral-800"
                    }`}
                    title="Filtrar productos agotados (0 uds)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-bold uppercase">Agotado</span>
                    </div>
                    <div className="text-sm font-extrabold font-mono mt-0.5">{outOfStockCount}</div>
                  </button>
                </div>
                <div className="text-[10px] text-neutral-400 mt-2 text-center">
                  Click en cualquier estado para filtrar
                </div>
              </div>
            </div>

            {/* Barra de Filtros, Búsqueda y Herramientas del POS */}
            <div className="space-y-3">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                  {/* Búsqueda y Filtros Principales */}
                  <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                    {/* Buscador */}
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar por ID, modelo o marca..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-9 pr-7 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                      />
                      {searchFilter && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-900 rounded-md cursor-pointer"
                          title="Borrar búsqueda"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Selector de Categoría */}
                    <select
                      value={inventoryCategoryFilter}
                      onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer"
                    >
                      <option value="all">Todas las Categorías</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {/* Selector de Marca */}
                    <select
                      value={inventoryBrandFilter}
                      onChange={(e) => setInventoryBrandFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer"
                    >
                      <option value="all">Todas las Marcas</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    {/* Selector de Orden */}
                    <select
                      value={inventorySortBy}
                      onChange={(e) => setInventorySortBy(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer"
                    >
                      <option value="default">Orden: Más recientes</option>
                      <option value="stock-asc">Stock: Menor a mayor</option>
                      <option value="stock-desc">Stock: Mayor a menor</option>
                      <option value="price-asc">Precio: Menor a mayor</option>
                      <option value="price-desc">Precio: Mayor a menor</option>
                      <option value="name">Nombre: A &rarr; Z</option>
                    </select>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center gap-2 self-start xl:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleExportProductsCSV}
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
                      title="Exportar inventario en formato CSV para Microsoft Excel"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportBackupJSON}
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
                      title="Descargar copia de seguridad completa del catálogo en JSON"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Backup JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNewProductClick}
                      className="px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span>Nuevo Producto</span>
                    </button>
                  </div>
                </div>

                {/* Segmented Control de Estados de Stock */}
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200/80 gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setStockQuickFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        stockQuickFilter === "all"
                          ? "bg-neutral-950 text-white shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                      }`}
                    >
                      Todos ({products.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockQuickFilter("in-stock")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        stockQuickFilter === "in-stock"
                          ? "bg-neutral-950 text-white shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>En Stock ({inStockCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockQuickFilter("low")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        stockQuickFilter === "low"
                          ? "bg-neutral-950 text-white shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Bajo Stock ({lowStockCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockQuickFilter("out")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        stockQuickFilter === "out"
                          ? "bg-neutral-950 text-white shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Agotados ({outOfStockCount})</span>
                    </button>
                  </div>

                  <span className="text-xs font-semibold text-neutral-500">
                    Mostrando {filteredInventory.length} de {products.length} productos
                  </span>
                </div>
              </div>

              {/* Cinta Informativa de Filtros Activos */}
              {(stockQuickFilter !== "all" ||
                inventoryCategoryFilter !== "all" ||
                inventoryBrandFilter !== "all" ||
                searchFilter ||
                inventorySortBy !== "default") && (
                <div className="px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs flex items-center justify-between gap-3 text-neutral-700 shadow-2xs animate-in fade-in flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-neutral-950">Filtros aplicados:</span>

                    {searchFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-medium">
                        Búsqueda: &ldquo;{searchFilter}&rdquo;
                        <button
                          type="button"
                          onClick={() => setSearchFilter("")}
                          className="hover:text-red-600 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {inventoryCategoryFilter !== "all" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-medium">
                        Categoría: {inventoryCategoryFilter}
                        <button
                          type="button"
                          onClick={() => setInventoryCategoryFilter("all")}
                          className="hover:text-red-600 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {inventoryBrandFilter !== "all" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-medium">
                        Marca: {inventoryBrandFilter}
                        <button
                          type="button"
                          onClick={() => setInventoryBrandFilter("all")}
                          className="hover:text-red-600 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {stockQuickFilter !== "all" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-medium">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            stockQuickFilter === "in-stock"
                              ? "bg-emerald-500"
                              : stockQuickFilter === "low"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                        <span>
                          {stockQuickFilter === "in-stock" && "En Stock"}
                          {stockQuickFilter === "low" && "Bajo Stock"}
                          {stockQuickFilter === "out" && "Agotados"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setStockQuickFilter("all")}
                          className="hover:text-red-600 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {inventorySortBy !== "default" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-medium">
                        Orden personalizado
                        <button
                          type="button"
                          onClick={() => setInventorySortBy("default")}
                          className="hover:text-red-600 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStockQuickFilter("all");
                      setInventoryCategoryFilter("all");
                      setInventoryBrandFilter("all");
                      setSearchFilter("");
                      setInventorySortBy("default");
                    }}
                    className="text-xs font-bold text-neutral-900 hover:text-red-600 underline shrink-0 cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>

            {/* Vista Móvil: Tarjetas Nativas para Celulares (sm:hidden) */}
            <div className="block sm:hidden space-y-3">
              {filteredInventory.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-neutral-200 text-center space-y-3">
                  <Package className="w-8 h-8 text-neutral-400 mx-auto" />
                  <div className="text-sm font-bold text-neutral-800">No se encontraron productos</div>
                  <p className="text-xs text-neutral-500">Prueba ajustando los filtros o el término de búsqueda.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setStockQuickFilter("all");
                      setInventoryCategoryFilter("all");
                      setInventoryBrandFilter("all");
                      setSearchFilter("");
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-950 text-white font-bold text-xs cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                filteredInventory.map((item) => {
                  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3"
                    >
                      {/* Top: Foto + Info básica */}
                      <div className="flex gap-3 items-start">
                        <div className="w-14 h-14 rounded-xl bg-neutral-50 border border-neutral-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          {item.colors[0]?.image ? (
                            <img
                              src={item.colors[0].image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="font-mono text-[10px] font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded">
                              #{item.id}
                            </span>
                            <span className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">
                              {item.brand}
                            </span>
                            <span className="text-[10px] text-neutral-500 truncate max-w-[120px]">
                              {item.category}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-neutral-950 text-sm leading-snug truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-black text-neutral-950 text-sm font-mono">
                              {STORE_SETTINGS.currencySymbol}{item.price.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-neutral-400 line-through font-mono">
                                {STORE_SETTINGS.currencySymbol}{item.originalPrice?.toFixed(2)}
                              </span>
                            )}
                            {hasDiscount && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-900 text-white">
                                -{Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Estado de Disponibilidad */}
                      <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 text-xs">
                        {item.stockCount <= 0 ? (
                          <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Agotado (0 uds)</span>
                            <span className="text-[10px] text-neutral-400 font-normal">· Oculto en web</span>
                          </div>
                        ) : item.stockCount <= 5 ? (
                          <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Bajo Stock ({item.stockCount} uds)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>En Stock ({item.stockCount} uds)</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Bar: Control de Stock + Botones de Acción */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 gap-2">
                        {/* Control de Stock con Stepper & Entrada Directa */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateStock(item.id, -1, true)}
                            disabled={item.stockCount <= 0}
                            className="w-7 h-7 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 active:scale-90 text-neutral-800 font-black text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed select-none shadow-2xs"
                            title="Restar 1 unidad"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={item.stockCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 0) {
                                updateStock(item.id, val, false);
                              }
                            }}
                            className="w-12 text-center py-1 rounded-lg border border-neutral-300 bg-white text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            title="Cantidad en stock"
                          />
                          <button
                            type="button"
                            onClick={() => updateStock(item.id, 1, true)}
                            className="w-7 h-7 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 active:scale-90 text-neutral-800 font-black text-sm flex items-center justify-center transition-all cursor-pointer select-none shadow-2xs"
                            title="Sumar 1 unidad"
                          >
                            +
                          </button>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setQrModalProduct(item)}
                            className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Código QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/producto/?id=${item.id}&slug=${item.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                            title="Ver en tienda"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Editar producto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar "${item.name}" del catálogo?`)) {
                                deleteProduct(item.id);
                              }
                            }}
                            className="p-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Vista Desktop: Tabla Tradicional Rediseñada (hidden sm:block) */}
            <div className="hidden sm:block rounded-2xl border border-neutral-200/90 overflow-hidden bg-white shadow-2xs">
              {filteredInventory.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-neutral-400 mx-auto" />
                  <div className="text-base font-bold text-neutral-800">No se encontraron productos en el inventario</div>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    No hay productos que coincidan con los filtros aplicados. Puedes restablecerlos o registrar un nuevo producto.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStockQuickFilter("all");
                        setInventoryCategoryFilter("all");
                        setInventoryBrandFilter("all");
                        setSearchFilter("");
                        setInventorySortBy("default");
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors cursor-pointer border border-neutral-200"
                    >
                      Restablecer filtros
                    </button>
                    <button
                      type="button"
                      onClick={handleNewProductClick}
                      className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      ＋ Registrar Producto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[760px]">
                    <thead className="bg-neutral-50/80 text-neutral-600 border-b border-neutral-200 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="py-3 px-3">SKU</th>
                        <th className="py-3 px-4">Producto &amp; Modelo</th>
                        <th className="py-3 px-3">Marca &amp; Categoría</th>
                        <th className="py-3 px-3">Precio Venta</th>
                        <th className="py-3 px-3">Estado</th>
                        <th className="py-3 px-3">Control de Stock</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-700">
                      {filteredInventory.map((item) => {
                        const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                        return (
                          <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                            {/* SKU */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 border border-neutral-200/90 px-2 py-0.5 rounded-md">
                                #{item.id}
                              </span>
                            </td>

                            {/* Producto & Modelo */}
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
                                <div className="min-w-0">
                                  <div className="font-extrabold text-neutral-950 text-sm truncate max-w-xs">
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] text-neutral-500 truncate max-w-xs mt-0.5">
                                    {item.subtitle || `${item.colors.length} ${item.colors.length === 1 ? 'color disponible' : 'colores disponibles'}`}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Marca & Categoría */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="font-black text-neutral-900 text-xs uppercase tracking-wider">
                                {item.brand}
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {item.category}
                              </div>
                            </td>

                            {/* Precio Venta */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="font-black text-neutral-950 text-sm font-mono">
                                {STORE_SETTINGS.currencySymbol}{item.price.toFixed(2)}
                              </div>
                              {hasDiscount && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-neutral-400 line-through font-mono">
                                    {STORE_SETTINGS.currencySymbol}{item.originalPrice?.toFixed(2)}
                                  </span>
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-neutral-900 text-white">
                                    -{Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)}%
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Estado de Disponibilidad */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {item.stockCount <= 0 ? (
                                <div>
                                  <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                    <span>Agotado (0)</span>
                                  </div>
                                  <div className="text-[10px] text-neutral-400 font-medium mt-0.5">
                                    Oculto en tienda web
                                  </div>
                                </div>
                              ) : item.stockCount <= 5 ? (
                                <div>
                                  <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                    <span>Bajo Stock</span>
                                  </div>
                                  <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                                    Quedan {item.stockCount} uds
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    <span>En Stock</span>
                                  </div>
                                  <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                                    {item.stockCount} uds disponibles
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Control de Stock con Stepper & Entrada Directa */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateStock(item.id, -1, true)}
                                  disabled={item.stockCount <= 0}
                                  className="w-7 h-7 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 active:scale-90 text-neutral-800 font-black text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed select-none shadow-2xs"
                                  title="Restar 1 unidad"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.stockCount}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val >= 0) {
                                      updateStock(item.id, val, false);
                                    }
                                  }}
                                  className="w-12 text-center py-1 rounded-lg border border-neutral-300 bg-white text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  title="Escribe directamente la cantidad de stock"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateStock(item.id, 1, true)}
                                  className="w-7 h-7 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 active:scale-90 text-neutral-800 font-black text-sm flex items-center justify-center transition-all cursor-pointer select-none shadow-2xs"
                                  title="Sumar 1 unidad"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Acciones */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setQrModalProduct(item)}
                                  className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                                  title="Generar Código QR para vitrina o folletos"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>
                                <Link
                                  href={`/producto/?id=${item.id}&slug=${item.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                                  title="Ver página de detalle en tienda"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(item)}
                                  className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                                  title="Editar producto"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
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
              )}
            </div>
          </div>
          )}

        {/* ================= PESTAÑA 2: AGREGAR / EDITAR PRODUCTO ================= */}
        {activeTab === "add_product" && (
          <div className="space-y-5">
            {/* Header del Módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 flex items-center gap-2">
                  <Package className="w-5 h-5 text-neutral-900" />
                  <span>{editingProductId ? "Editar Producto" : "Publicar Nuevo Producto"}</span>
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("inventory")}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver</span>
                </button>

                {editingProductId && (
                  <button
                    type="button"
                    onClick={handleNewProductClick}
                    className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Nuevo
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    const fakeEvent = { preventDefault: () => {} } as any;
                    handleSaveProduct(fakeEvent);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Producto</span>
                </button>
              </div>
            </div>

            {/* Split Formulario + Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Formulario Principal (7 Cols) */}
              <form onSubmit={handleSaveProduct} className="lg:col-span-7 space-y-4 bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs">
                {/* Selector de Pasos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 1, title: "1. Información", icon: Package },
                    { id: 2, title: "2. Colores y Fotos", icon: ImageIcon },
                    { id: 3, title: "3. Precios y Stock", icon: DollarSign },
                    { id: 4, title: "4. Ficha Técnica", icon: Layers },
                  ].map((step) => {
                    const Icon = step.icon;
                    const isActive = formActiveStep === step.id;
                    const isCompleted = formActiveStep > step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setFormActiveStep(step.id as 1 | 2 | 3 | 4)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 select-none ${
                          isActive
                            ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                            : isCompleted
                            ? "bg-neutral-50 border-neutral-300 text-neutral-900 hover:bg-neutral-100"
                            : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : isCompleted ? "text-emerald-600" : "text-neutral-400"}`} />
                          <span className="text-xs font-bold truncate">{step.title}</span>
                        </div>
                        {isCompleted && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* ===== PASO 1: INFORMACIÓN GENERAL ===== */}
                {formActiveStep === 1 && (
                  <div className="space-y-4 pt-2 border-t border-neutral-100 animate-in fade-in duration-150">
                    {/* ID y Nombre */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-neutral-900">
                            ID / SKU *
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormCustomId(generate6DigitId())}
                            className="text-[10px] font-bold text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-md transition-colors"
                            title="Generar ID"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Generar</span>
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
                            placeholder="000000"
                            value={formCustomId}
                            onChange={(e) => setFormCustomId(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="w-full pl-7 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 tracking-wider"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-neutral-900 block mb-1">
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nombre del modelo o producto"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    {/* Marca & Categoría (Sin enlaces redundantes) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-900 block mb-1">
                          Marca
                        </label>
                        <select
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-semibold text-neutral-900 focus:outline-none focus:bg-white cursor-pointer"
                        >
                          {brands.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-900 block mb-1">
                          Categoría
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-semibold text-neutral-900 focus:outline-none focus:bg-white cursor-pointer"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subtítulo Breve */}
                    <div>
                      <label className="text-xs font-bold text-neutral-900 block mb-1">
                        Subtítulo o Resumen
                      </label>
                      <input
                        type="text"
                        placeholder="Resumen breve del producto"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900"
                      />
                    </div>

                    {/* Descripción Comercial */}
                    <div>
                      <label className="text-xs font-bold text-neutral-900 block mb-1">
                        Descripción del Producto
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Descripción del producto..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 leading-relaxed"
                      />
                    </div>

                    {/* Botones de Navegación del Paso 1 */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveTab("inventory")}
                        className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:text-black text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formName.trim()) {
                            alert("Por favor ingresa el nombre del producto.");
                            return;
                          }
                          setFormActiveStep(2);
                        }}
                        className="px-5 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Siguiente</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ===== PASO 2: COLORES & FOTOGRAFÍAS ===== */}
                {formActiveStep === 2 && (
                  <div className="space-y-4 pt-2 border-t border-neutral-100 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-neutral-950">
                        Colores y Fotos
                      </h3>

                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Color</span>
                      </button>
                    </div>

                    {/* Lista de Colores Configurados */}
                    <div className="space-y-3">
                      {formColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2.5 relative transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs font-extrabold text-neutral-900">
                                Color #{idx + 1}: {color.name || "Sin nombre"}
                              </span>
                            </div>

                            {formColors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(idx)}
                                className="text-neutral-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Eliminar este color"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Campos del color */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                                Nombre del Color
                              </label>
                              <input
                                type="text"
                                value={color.name}
                                onChange={(e) => handleUpdateColor(idx, "name", e.target.value)}
                                placeholder="Nombre del color"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                                Color HEX
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={color.hex}
                                  onChange={(e) => handleUpdateColor(idx, "hex", e.target.value)}
                                  className="w-8 h-8 rounded-lg border border-neutral-300 p-0.5 cursor-pointer shrink-0"
                                />
                                <input
                                  type="text"
                                  value={color.hex}
                                  onChange={(e) => handleUpdateColor(idx, "hex", e.target.value)}
                                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono font-bold text-neutral-900 uppercase focus:outline-none focus:border-neutral-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Paleta rápida de sugerencias */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {[
                              { name: "Negro", hex: "#18181b" },
                              { name: "Blanco", hex: "#FFFFFF" },
                              { name: "Beige", hex: "#f5f0e6" },
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
                                className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  color.hex?.toLowerCase() === preset.hex.toLowerCase()
                                    ? "bg-neutral-950 text-white border-neutral-950 shadow-2xs"
                                    : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
                                }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full border border-neutral-300 shrink-0"
                                  style={{ backgroundColor: preset.hex }}
                                />
                                <span>{preset.name}</span>
                              </button>
                            ))}
                          </div>

                          {/* Foto para este color (SIN muestras predeterminadas) */}
                          <div className="pt-2 border-t border-neutral-200">
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Fotografía
                            </label>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
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

                              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-300 hover:border-neutral-900 text-xs font-bold text-neutral-900 cursor-pointer transition-colors shadow-2xs">
                                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                                <span>Subir imagen</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleColorImageUpload(idx, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Foto Secundaria (Simple, conciso, sin muestras) */}
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
                      <span className="text-xs font-bold text-neutral-900 block">
                        Foto Secundaria
                      </span>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
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

                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-white cursor-pointer transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-white" />
                          <span>Subir foto secundaria</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSecondaryImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Video del Producto (Simple y conciso) */}
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-1.5">
                      <span className="text-xs font-bold text-neutral-900 block">
                        Video del Producto (Opcional)
                      </span>

                      <input
                        type="url"
                        placeholder="URL de YouTube o enlace .mp4"
                        value={formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    {/* Botones de Navegación del Paso 2 */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setFormActiveStep(1)}
                        className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:text-black text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Anterior</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormActiveStep(3)}
                        className="px-5 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Siguiente</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ===== PASO 3: PRECIOS, DESCUENTOS & STOCK ===== */}
                {formActiveStep === 3 && (
                  <div className="space-y-4 pt-2 border-t border-neutral-100 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-bold text-neutral-900 block mb-1">
                          Precio de Venta ({STORE_SETTINGS.currencySymbol}) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-500 text-sm">
                            {STORE_SETTINGS.currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.5"
                            required
                            min={1}
                            placeholder="0.00"
                            value={formPrice}
                            onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-base font-extrabold text-neutral-950 focus:outline-none focus:bg-white focus:border-neutral-900 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-900 block mb-1">
                          Stock Inicial
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFormStock(Math.max(0, (formStock || 0) - 1))}
                            disabled={formStock <= 0}
                            className="w-9 h-9 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 active:scale-95 text-neutral-800 font-black text-sm flex items-center justify-center cursor-pointer disabled:opacity-30 shadow-2xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={formStock}
                            onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="flex-1 text-center py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-base font-extrabold text-neutral-950 focus:outline-none focus:bg-white focus:border-neutral-900 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            style={{ MozAppearance: 'textfield' }}
                          />
                          <button
                            type="button"
                            onClick={() => setFormStock((formStock || 0) + 1)}
                            className="w-9 h-9 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 active:scale-95 text-neutral-800 font-black text-sm flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-[11px] font-bold text-neutral-700 mt-1 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${formStock > 5 ? "bg-emerald-500" : formStock > 0 ? "bg-amber-500" : "bg-rose-500"}`} />
                          <span>
                            {formStock > 5
                              ? "En Stock"
                              : formStock > 0
                              ? "Bajo stock"
                              : "Agotado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Switch Promoción Especial */}
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2.5">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formHasPromo}
                          onChange={(e) => setFormHasPromo(e.target.checked)}
                          className="w-4 h-4 rounded text-neutral-900 focus:ring-0 bg-white border-neutral-300 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-neutral-900">
                          Precio de Oferta
                        </span>
                      </label>

                      {formHasPromo && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 animate-in fade-in duration-150">
                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Precio Regular ({STORE_SETTINGS.currencySymbol})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              placeholder="0.00"
                              value={formOriginalPrice}
                              onChange={(e) => setFormOriginalPrice(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-900 font-mono focus:outline-none focus:border-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Etiqueta
                            </label>
                            <select
                              value={formPromoTag}
                              onChange={(e) => setFormPromoTag(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-neutral-900 cursor-pointer"
                            >
                              <option value="OFERTA FLASH">OFERTA FLASH</option>
                              <option value="MÁS VENDIDO">MÁS VENDIDO</option>
                              <option value="DESCUENTO ESPECIAL">DESCUENTO ESPECIAL</option>
                              <option value="NUEVO LANZAMIENTO">NUEVO LANZAMIENTO</option>
                            </select>
                          </div>

                          {Number(formOriginalPrice) > Number(formPrice) && Number(formPrice) > 0 && (
                            <div className="sm:col-span-2 text-xs font-bold text-neutral-900 bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                              <span>
                                Descuento del {Math.round(((Number(formOriginalPrice) - Number(formPrice)) / Number(formOriginalPrice)) * 100)}%
                              </span>
                              <span className="font-mono text-emerald-600">
                                Ahorro {STORE_SETTINGS.currencySymbol}{(Number(formOriginalPrice) - Number(formPrice)).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botones de Navegación del Paso 3 */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setFormActiveStep(2)}
                        className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:text-black text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Anterior</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormActiveStep(4)}
                        className="px-5 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Siguiente</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ===== PASO 4: FICHA TÉCNICA ===== */}
                {formActiveStep === 4 && (
                  <div className="space-y-4 pt-2 border-t border-neutral-100 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-neutral-950">
                        Ficha Técnica ({formCategory})
                      </h3>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const tpl = getCategorySpecTemplate(formCategory);
                            setFormCustomSpecs(tpl.map((t) => ({ label: t.label, value: "" })));
                          }}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-xs font-bold text-neutral-800 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Plantilla</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormCustomSpecs([...formCustomSpecs, { label: "", value: "" }]);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Fila</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 bg-neutral-50/60 p-3.5 rounded-xl border border-neutral-200">
                      {formCustomSpecs.map((spec, sIdx) => (
                        <div key={sIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              placeholder="Parámetro (ej. Batería)"
                              value={spec.label}
                              onChange={(e) => {
                                const next = [...formCustomSpecs];
                                next[sIdx].label = e.target.value;
                                setFormCustomSpecs(next);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                            />
                          </div>
                          <div className="sm:col-span-6">
                            <input
                              type="text"
                              placeholder="Valor"
                              value={spec.value}
                              onChange={(e) => {
                                const next = [...formCustomSpecs];
                                next[sIdx].value = e.target.value;
                                setFormCustomSpecs(next);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setFormCustomSpecs(formCustomSpecs.filter((_, i) => i !== sIdx));
                              }}
                              className="p-1 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar fila"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {formCustomSpecs.length === 0 && (
                        <div className="text-center py-3 text-xs text-neutral-400">
                          Sin características. Haz click en &quot;+ Fila&quot; para agregar.
                        </div>
                      )}
                    </div>

                    {/* Resumen Final */}
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 text-xs space-y-1.5">
                      <div className="font-bold text-neutral-900 flex items-center justify-between">
                        <span>Resumen</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-neutral-200 font-bold text-neutral-800">
                          #{formCustomId}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-neutral-600 pt-1">
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase">Producto</span>
                          <strong className="text-neutral-950 truncate block">{formName || "Sin nombre"}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase">Marca &amp; Categoría</span>
                          <strong className="text-neutral-950 truncate block">{formBrand} · {formCategory}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase">Precio</span>
                          <strong className="text-neutral-950 font-mono text-sm block">
                            {STORE_SETTINGS.currencySymbol}{Number(formPrice || 0).toFixed(2)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase">Stock</span>
                          <strong className="text-neutral-950 block">{formStock} unidades</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase">Colores</span>
                          <strong className="text-neutral-950 block">{formColors.length}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Finalización */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setFormActiveStep(3)}
                        className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:text-black text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Anterior</span>
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-neutral-950 text-white font-extrabold text-xs hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Save className="w-4 h-4 text-white" />
                        <span>{editingProductId ? "Actualizar Producto" : "Publicar Producto"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Vista Previa en Vivo (5 Cols) */}
              <div className="lg:col-span-5 space-y-3 sticky top-20">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-neutral-900 font-extrabold">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Vista Previa</span>
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">Tarjeta en catálogo</span>
                </div>

                {/* Tarjeta de Producto Simulada */}
                <div className="rounded-2xl bg-white text-neutral-900 border border-neutral-200/90 shadow-md p-4 sm:p-5 overflow-hidden flex flex-col justify-between">
                  {/* Encabezado */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        {formBrand || "MARCA"}
                      </span>
                      {formCustomId && (
                        <span className="font-mono text-[10px] font-bold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          #{formCustomId}
                        </span>
                      )}
                      {formHasPromo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950 text-white tracking-wide uppercase">
                          {formPromoTag}
                        </span>
                      )}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 ${
                      Number(formStock) > 0 ? "bg-neutral-100 text-neutral-900" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${Number(formStock) > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span>{Number(formStock) > 0 ? "En Stock" : "Agotado"}</span>
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
                    <span className="text-[10px] font-semibold text-neutral-400 ml-1 truncate max-w-[100px]">
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

                  {/* Precio y Botones */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2.5">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400 leading-none mb-1">
                        Precio
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-neutral-950 font-mono">
                          {STORE_SETTINGS.currencySymbol}{Number(formPrice || 0).toFixed(2)}
                        </span>
                        {formHasPromo && Number(formOriginalPrice || 0) > Number(formPrice || 0) && (
                          <span className="text-xs text-neutral-400 line-through font-mono">
                            {STORE_SETTINGS.currencySymbol}{Number(formOriginalPrice || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                        <span>Añadir al Carrito</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen de Ficha Técnica en la Vista Previa */}
                {formCustomSpecs.filter((s) => s.label.trim() && s.value.trim()).length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Ficha Técnica
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {formCustomSpecs
                        .filter((s) => s.label.trim() && s.value.trim())
                        .map((spec, sIdx) => (
                          <div key={sIdx} className="p-2 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px]">
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
        {activeTab === "filters" && (() => {
          // Métricas de Clasificación
          const totalProducts = products.length;
          const brandsWithProducts = brands.filter((b) =>
            products.some((p) => p.brand?.toLowerCase() === b.toLowerCase())
          ).length;
          const categoriesWithProducts = categories.filter((c) =>
            products.some((p) => p.category?.toLowerCase() === c.toLowerCase())
          ).length;
          const unusedBrandsCount = brands.length - brandsWithProducts;
          const unusedCategoriesCount = categories.length - categoriesWithProducts;
          const totalAssignedProducts = products.filter((p) => p.brand && p.category).length;
          const coveragePercent = totalProducts > 0 ? Math.round((totalAssignedProducts / totalProducts) * 100) : 100;
          const totalStockAll = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);

          // Filtrado de Marcas
          const query = filterSearchQuery.toLowerCase().trim();
          const filteredBrands = brands.filter((b) => {
            const matchesSearch = !query || b.toLowerCase().includes(query);
            const count = products.filter((p) => p.brand?.toLowerCase() === b.toLowerCase()).length;
            if (!matchesSearch) return false;
            if (filterStatusFilter === "with-products") return count > 0;
            if (filterStatusFilter === "empty") return count === 0;
            return true;
          });

          // Filtrado de Categorías
          const filteredCategories = categories.filter((c) => {
            const matchesSearch = !query || c.toLowerCase().includes(query);
            const count = products.filter(
              (p) =>
                p.category?.toLowerCase() === c.toLowerCase() ||
                p.category?.toLowerCase().includes(c.toLowerCase()) ||
                c.toLowerCase().includes((p.category || "").toLowerCase())
            ).length;
            if (!matchesSearch) return false;
            if (filterStatusFilter === "with-products") return count > 0;
            if (filterStatusFilter === "empty") return count === 0;
            return true;
          });

          return (
            <div className="space-y-5">
              {/* Header Principal del Módulo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider mb-0.5">
                    <span>Catálogo</span>
                    <span>/</span>
                    <span className="text-neutral-700">Taxonomía</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-neutral-900" />
                    <span>Marcas y Categorías</span>
                  </h2>
                </div>

                {/* Segmented Control de Subvistas */}
                <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80 shrink-0">
                  {[
                    { id: "brands", label: `Marcas (${brands.length})` },
                    { id: "categories", label: `Categorías (${categories.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFiltersViewTab(tab.id as "brands" | "categories")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filtersViewTab === tab.id
                          ? "bg-white text-neutral-950 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Tarjetas KPI Ejecutivas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* KPI 1: Marcas */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Marcas</span>
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-neutral-950 font-mono tracking-tight">{brands.length}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {brandsWithProducts} con productos ({unusedBrandsCount} vacías)
                    </div>
                  </div>
                </div>

                {/* KPI 2: Categorías */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Categorías</span>
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-neutral-950 font-mono tracking-tight">{categories.length}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {categoriesWithProducts} con productos ({unusedCategoriesCount} vacías)
                    </div>
                  </div>
                </div>

                {/* KPI 3: Cobertura */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Cobertura</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-neutral-950 font-mono tracking-tight">{coveragePercent}%</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {totalAssignedProducts} de {totalProducts} asignados
                    </div>
                  </div>
                </div>

                {/* KPI 4: Stock Total */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Stock Total</span>
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-neutral-950 font-mono tracking-tight">{totalStockAll}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Unidades físicas en catálogo
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de Búsqueda y Filtro Rápido */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar marca o categoría..."
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 font-semibold"
                  />
                  {filterSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFilterSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider pl-1">Filtrar:</span>
                  {[
                    { id: "all", label: "Todos" },
                    { id: "with-products", label: "Con productos" },
                    { id: "empty", label: "Sin productos" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterStatusFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filterStatusFilter === f.id
                          ? "bg-neutral-950 text-white shadow-2xs"
                          : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200/80"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenedor de Paneles Individuales */}
              <div className="w-full">
                {/* ================= PANEL DE MARCAS ================= */}
                {filtersViewTab === "brands" && (
                  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-neutral-900" />
                        <h3 className="text-sm font-extrabold text-neutral-950">Marcas Registradas</h3>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                          {brands.length}
                        </span>
                      </div>
                    </div>

                    {/* Formulario Agregar Marca */}
                    <form onSubmit={handleAddBrandSubmit} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nueva marca..."
                        value={newBrandInput}
                        onChange={(e) => setNewBrandInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={!newBrandInput.trim()}
                        className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    </form>

                    {/* Lista de Marcas */}
                    <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                      {filteredBrands.map((b) => {
                        const brandProducts = products.filter(
                          (p) => p.brand?.toLowerCase() === b.toLowerCase()
                        );
                        const count = brandProducts.length;
                        const stockSum = brandProducts.reduce((sum, p) => sum + (p.stockCount || 0), 0);
                        const isExpanded = expandedBrands.includes(b);
                        const isEditing = editingBrandName?.original === b;

                        return (
                          <div
                            key={b}
                            className="p-3 rounded-xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-white transition-all space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              {/* Izquierda: Nombre o Input de Edición */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    count > 0 ? "bg-emerald-500" : "bg-neutral-300"
                                  }`}
                                />

                                {isEditing ? (
                                  <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingBrandName.current}
                                      onChange={(e) =>
                                        setEditingBrandName({
                                          ...editingBrandName,
                                          current: e.target.value,
                                        })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveBrandRename();
                                        if (e.key === "Escape") setEditingBrandName(null);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-900 text-xs font-extrabold text-neutral-900 focus:outline-none w-full"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleSaveBrandRename}
                                      className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                      title="Guardar nombre"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingBrandName(null)}
                                      className="p-1 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 cursor-pointer"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                    <span className="text-xs font-extrabold text-neutral-900 truncate">
                                      {b}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        count > 0
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                                      }`}
                                    >
                                      {count} {count === 1 ? "producto" : "productos"}
                                    </span>
                                    {count > 0 && (
                                      <span className="text-[10px] font-mono text-neutral-400">
                                        {stockSum} unids.
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Derecha: Botones de Acción */}
                              {!isEditing && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {count > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandBrand(b)}
                                      className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                        isExpanded
                                          ? "bg-neutral-900 text-white"
                                          : "bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200"
                                      }`}
                                      title={isExpanded ? "Ocultar productos" : "Ver productos asociados"}
                                    >
                                      <span>Ver</span>
                                      {isExpanded ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setEditingBrandName({ original: b, current: b })}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-white border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
                                    title="Renombrar marca"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInventoryBrandFilter(b);
                                      setInventoryCategoryFilter("all");
                                      setActiveTab("inventory");
                                    }}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-white border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
                                    title="Filtrar en Inventario"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (count > 0) {
                                        setDeleteConfirmItem({
                                          type: "brand",
                                          name: b,
                                          productCount: count,
                                        });
                                      } else {
                                        deleteBrand(b);
                                        setSuccessNotice(`Marca "${b}" eliminada.`);
                                        setTimeout(() => setSuccessNotice(""), 3500);
                                      }
                                    }}
                                    className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Eliminar marca"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Desplegable de Productos Asociados */}
                            {isExpanded && brandProducts.length > 0 && (
                              <div className="pt-2 border-t border-neutral-200/70 space-y-2 animate-in fade-in duration-150">
                                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                                  <span>Productos vinculados ({brandProducts.length})</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInventoryBrandFilter(b);
                                      setInventoryCategoryFilter("all");
                                      setActiveTab("inventory");
                                    }}
                                    className="text-[10px] text-neutral-900 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Ver en Inventario</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                  {brandProducts.map((p) => (
                                    <div
                                      key={p.id}
                                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200/80 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                                          {(p.images?.[0] || p.colors?.[0]?.image) ? (
                                            <img
                                              src={p.images?.[0] || p.colors?.[0]?.image}
                                              alt={p.name}
                                              className="w-full h-full object-contain"
                                            />
                                          ) : (
                                            <Package className="w-3.5 h-3.5 text-neutral-400" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-bold text-neutral-950 truncate">
                                            {p.name}
                                          </div>
                                          <div className="text-[10px] font-mono text-neutral-400">
                                            #{p.id} · {p.category}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-mono text-xs font-extrabold text-neutral-900">
                                          {STORE_SETTINGS.currencySymbol}{p.price.toFixed(2)}
                                        </span>
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                            p.stockCount > 5
                                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                              : p.stockCount > 0
                                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                                              : "bg-rose-50 text-rose-700 border border-rose-200"
                                          }`}
                                        >
                                          {p.stockCount} unids.
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleEditClick(p)}
                                          className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
                                          title="Editar este producto"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {filteredBrands.length === 0 && (
                        <div className="text-center py-8 text-neutral-400 text-xs">
                          No se encontraron marcas con el filtro actual.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= PANEL DE CATEGORÍAS ================= */}
                {filtersViewTab === "categories" && (
                  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-neutral-900" />
                        <h3 className="text-sm font-extrabold text-neutral-950">Categorías del Catálogo</h3>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                          {categories.length}
                        </span>
                      </div>
                    </div>

                    {/* Formulario Agregar Categoría */}
                    <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nueva categoría..."
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={!newCategoryInput.trim()}
                        className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    </form>

                    {/* Lista de Categorías */}
                    <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                      {filteredCategories.map((c) => {
                        const categoryProducts = products.filter(
                          (p) =>
                            p.category?.toLowerCase() === c.toLowerCase() ||
                            p.category?.toLowerCase().includes(c.toLowerCase()) ||
                            c.toLowerCase().includes((p.category || "").toLowerCase())
                        );
                        const count = categoryProducts.length;
                        const stockSum = categoryProducts.reduce((sum, p) => sum + (p.stockCount || 0), 0);
                        const isExpanded = expandedCategories.includes(c);
                        const isEditing = editingCategoryName?.original === c;

                        return (
                          <div
                            key={c}
                            className="p-3 rounded-xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-white transition-all space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              {/* Izquierda: Nombre o Input de Edición */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    count > 0 ? "bg-emerald-500" : "bg-neutral-300"
                                  }`}
                                />

                                {isEditing ? (
                                  <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCategoryName.current}
                                      onChange={(e) =>
                                        setEditingCategoryName({
                                          ...editingCategoryName,
                                          current: e.target.value,
                                        })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveCategoryRename();
                                        if (e.key === "Escape") setEditingCategoryName(null);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-900 text-xs font-extrabold text-neutral-900 focus:outline-none w-full"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleSaveCategoryRename}
                                      className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                      title="Guardar nombre"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCategoryName(null)}
                                      className="p-1 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 cursor-pointer"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                    <span className="text-xs font-extrabold text-neutral-900 truncate">
                                      {c}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        count > 0
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                                      }`}
                                    >
                                      {count} {count === 1 ? "producto" : "productos"}
                                    </span>
                                    {count > 0 && (
                                      <span className="text-[10px] font-mono text-neutral-400">
                                        {stockSum} unids.
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Derecha: Botones de Acción */}
                              {!isEditing && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {count > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandCategory(c)}
                                      className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                        isExpanded
                                          ? "bg-neutral-900 text-white"
                                          : "bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200"
                                      }`}
                                      title={isExpanded ? "Ocultar productos" : "Ver productos asociados"}
                                    >
                                      <span>Ver</span>
                                      {isExpanded ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setEditingCategoryName({ original: c, current: c })}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-white border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
                                    title="Renombrar categoría"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInventoryCategoryFilter(c);
                                      setInventoryBrandFilter("all");
                                      setActiveTab("inventory");
                                    }}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-white border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
                                    title="Filtrar en Inventario"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (count > 0) {
                                        setDeleteConfirmItem({
                                          type: "category",
                                          name: c,
                                          productCount: count,
                                        });
                                      } else {
                                        deleteCategory(c);
                                        setSuccessNotice(`Categoría "${c}" eliminada.`);
                                        setTimeout(() => setSuccessNotice(""), 3500);
                                      }
                                    }}
                                    className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Eliminar categoría"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Desplegable de Productos Asociados */}
                            {isExpanded && categoryProducts.length > 0 && (
                              <div className="pt-2 border-t border-neutral-200/70 space-y-2 animate-in fade-in duration-150">
                                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                                  <span>Productos vinculados ({categoryProducts.length})</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInventoryCategoryFilter(c);
                                      setInventoryBrandFilter("all");
                                      setActiveTab("inventory");
                                    }}
                                    className="text-[10px] text-neutral-900 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Ver en Inventario</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                  {categoryProducts.map((p) => (
                                    <div
                                      key={p.id}
                                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200/80 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                                          {(p.images?.[0] || p.colors?.[0]?.image) ? (
                                            <img
                                              src={p.images?.[0] || p.colors?.[0]?.image}
                                              alt={p.name}
                                              className="w-full h-full object-contain"
                                            />
                                          ) : (
                                            <Package className="w-3.5 h-3.5 text-neutral-400" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-bold text-neutral-950 truncate">
                                            {p.name}
                                          </div>
                                          <div className="text-[10px] font-mono text-neutral-400">
                                            #{p.id} · {p.brand}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-mono text-xs font-extrabold text-neutral-900">
                                          {STORE_SETTINGS.currencySymbol}{p.price.toFixed(2)}
                                        </span>
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                            p.stockCount > 5
                                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                              : p.stockCount > 0
                                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                                              : "bg-rose-50 text-rose-700 border border-rose-200"
                                          }`}
                                        >
                                          {p.stockCount} unids.
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleEditClick(p)}
                                          className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
                                          title="Editar este producto"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {filteredCategories.length === 0 && (
                        <div className="text-center py-8 text-neutral-400 text-xs">
                          No se encontraron categorías con el filtro actual.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal de Confirmación Segura de Eliminación */}
              {deleteConfirmItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-neutral-950">
                          Eliminar {deleteConfirmItem.type === "brand" ? "Marca" : "Categoría"}
                        </h4>
                        <div className="text-xs font-mono font-bold text-neutral-500">
                          {deleteConfirmItem.name}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <div className="font-extrabold flex items-center gap-1.5">
                        <span>Advertencia de clasificación</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        Esta {deleteConfirmItem.type === "brand" ? "marca" : "categoría"} está asociada actualmente a{" "}
                        <strong>{deleteConfirmItem.productCount} {deleteConfirmItem.productCount === 1 ? "producto" : "productos"}</strong>.
                        Si la eliminas, los productos permanecerán en el catálogo pero sin {deleteConfirmItem.type === "brand" ? "marca" : "categoría"} asignada.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmItem(null)}
                        className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:text-black font-bold text-xs cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={executeDeleteItem}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        Sí, Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ================= PESTAÑA: CUPONES DE DESCUENTO ================= */}
        {activeTab === "coupons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Formulario de creación de cupón */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  <span>Crear Nuevo Cupón de Descuento</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Crea códigos promocionales para que tus clientes los ingresen en el carrito y reciban descuentos antes de pedir por WhatsApp.
                </p>

                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Código del Cupón
                    </label>
                    <input
                      type="text"
                      placeholder="CÓDIGO DE CUPÓN"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold uppercase text-neutral-900 focus:outline-none focus:bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                        Tipo de Descuento:
                      </label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as "percentage" | "fixed")}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 font-bold focus:outline-none"
                      >
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Monto Fijo ({STORE_SETTINGS.currencySymbol})</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                        Valor del Descuento:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold text-neutral-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                      Compra Mínima Requerida ({STORE_SETTINGS.currencySymbol}):
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold text-neutral-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Deja en 0 si no requiere un monto mínimo para aplicarse.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear y Activar Cupón</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Lista de Cupones */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs uppercase text-neutral-500 block font-bold tracking-wider">
                Cupones Registrados ({coupons.length})
              </span>

              {coupons.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/70 space-y-2">
                  <Tag className="w-8 h-8 text-neutral-400 mx-auto" />
                  <h4 className="text-xs font-bold text-neutral-800">No hay cupones activos</h4>
                  <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                    Crea tu primer cupón con el formulario de la izquierda para incentivar compras en tu tienda.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 border ${
                            coupon.isActive
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-neutral-100 text-neutral-400 border-neutral-200"
                          }`}
                        >
                          %
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-neutral-950">
                              {coupon.code}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                coupon.isActive
                                  ? "bg-neutral-950 text-white"
                                  : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                              }`}
                            >
                              {coupon.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Descuento:{" "}
                            <strong className="text-neutral-900">
                              {coupon.discountType === "percentage"
                                ? `${coupon.discountValue}%`
                                : `${STORE_SETTINGS.currencySymbol}${coupon.discountValue.toFixed(2)}`}
                            </strong>
                            {coupon.minPurchase > 0 && (
                              <span> • Min. compra: {STORE_SETTINGS.currencySymbol}{coupon.minPurchase.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleCoupon(coupon.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                            coupon.isActive
                              ? "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {coupon.isActive ? "Pausar" : "Activar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar el cupón ${coupon.code}?`)) {
                              deleteCoupon(coupon.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Eliminar cupón"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PESTAÑA: VENTAS & LOGÍSTICA DE DESPACHO ================= */}
        {activeTab === "sales" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header del Módulo con Selector de Sub-Vistas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-neutral-950 tracking-tight">
                      Ventas &amp; Logística de Despacho
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Gestión de pedidos en tiempo real, emisión de notas de venta y control de envíos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Selector de Sub-Vistas Segmentadas */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200/80">
                  <button
                    type="button"
                    onClick={() => setSalesViewMode("orders")}
                    onPointerUp={(e) => e.currentTarget.blur()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 select-none outline-none focus:outline-none focus:ring-0 ${
                      salesViewMode === "orders"
                        ? "bg-white text-neutral-950 shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Órdenes ({sales.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSalesViewMode("register")}
                    onPointerUp={(e) => e.currentTarget.blur()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 select-none outline-none focus:outline-none focus:ring-0 ${
                      salesViewMode === "register"
                        ? "bg-white text-neutral-950 shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registrar Venta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSalesViewMode("analytics")}
                    onPointerUp={(e) => e.currentTarget.blur()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 select-none outline-none focus:outline-none focus:ring-0 ${
                      salesViewMode === "analytics"
                        ? "bg-white text-neutral-950 shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>Métricas &amp; Reportes</span>
                  </button>
                </div>

                {salesViewMode !== "register" && (
                  <button
                    type="button"
                    onClick={() => setSalesViewMode("register")}
                    className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>＋ Nueva Venta</span>
                  </button>
                )}
              </div>
            </div>

            {/* Banner Informativo de Última Orden Registrada */}
            {lastRegisteredSale && (
              <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-neutral-950">
                      Orden #{lastRegisteredSale.id} guardada con éxito
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLastRegisteredSale(null)}
                    className="text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-neutral-600 leading-snug">
                  {lastRegisteredSale.quantity}x {lastRegisteredSale.productName} para{" "}
                  <strong className="text-neutral-900">{lastRegisteredSale.customerName}</strong> ({STORE_SETTINGS.currencySymbol}
                  {lastRegisteredSale.total.toFixed(2)})
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setReceiptModalSale(lastRegisteredSale)}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Imprimir Nota de Venta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappTemplateSale(lastRegisteredSale);
                      setCustomMsgPhone(lastRegisteredSale.customerPhone || "");
                      setCopiedTemplateIndex(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-neutral-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Notificar por WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= SUB-VISTA 1: ÓRDENES & DESPACHO (ANCHO COMPLETO) ================= */}
            {salesViewMode === "orders" && (
              <div className="space-y-4">
                {/* Métricas Resumidas Rápidas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Facturado</span>
                    <div className="text-2xl font-black text-neutral-950 font-mono mt-0.5">
                      {STORE_SETTINGS.currencySymbol}{totalRevenue.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Órdenes Totales</span>
                    <div className="text-2xl font-black text-neutral-950 font-mono mt-0.5">
                      {sales.length}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Pendientes Despacho</span>
                    <div className="text-2xl font-black text-amber-600 font-mono mt-0.5">
                      {sales.filter((s) => (s.deliveryStatus || "pending") === "pending").length}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Entregados</span>
                    <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">
                      {sales.filter((s) => s.deliveryStatus === "delivered").length}
                    </div>
                  </div>
                </div>

                {/* Barra de Filtros & Búsqueda */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Buscador */}
                    <div className="relative flex-1 min-w-0 max-w-lg">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar por producto, cliente, teléfono, dirección, guía o ID..."
                        value={salesSearchQuery}
                        onChange={(e) => setSalesSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                      />
                      {salesSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSalesSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Selector de Canal y Exportar */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <select
                        value={salesChannelFilter}
                        onChange={(e) => setSalesChannelFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-400 transition-colors cursor-pointer"
                      >
                        <option value="all">Todos los Canales</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Presencial">Presencial (Tienda)</option>
                        <option value="Web">Web Comercial</option>
                      </select>

                      <button
                        type="button"
                        onClick={handleExportSalesCSV}
                        className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
                        title="Exportar órdenes en CSV para Excel"
                      >
                        <Download className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Exportar CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Filtro Rápido por Estado de Despacho */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                    {[
                      { id: "all", label: "Todas las Órdenes", count: sales.length, dotColor: "bg-neutral-400" },
                      { id: "pending", label: "Pendientes", count: sales.filter((s) => (s.deliveryStatus || "pending") === "pending").length, dotColor: "bg-amber-400" },
                      { id: "shipped", label: "En Camino", count: sales.filter((s) => s.deliveryStatus === "shipped").length, dotColor: "bg-blue-400" },
                      { id: "delivered", label: "Entregados", count: sales.filter((s) => s.deliveryStatus === "delivered").length, dotColor: "bg-emerald-400" },
                      { id: "cancelled", label: "Cancelados", count: sales.filter((s) => s.deliveryStatus === "cancelled").length, dotColor: "bg-neutral-300" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSalesStatusFilter(st.id)}
                        onPointerUp={(e) => e.currentTarget.blur()}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 select-none outline-none focus:outline-none focus:ring-0 ${
                          salesStatusFilter === st.id
                            ? "bg-neutral-950 text-white shadow-2xs"
                            : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 border border-neutral-200/70"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
                        <span>{st.label}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                          salesStatusFilter === st.id ? "bg-white/20 text-white" : "bg-white text-neutral-600 border border-neutral-200"
                        }`}>
                          {st.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista de Órdenes */}
                {displayedSales.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-neutral-300 bg-white space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400 shadow-2xs">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-800">
                        {sales.length === 0
                          ? "No hay órdenes registradas aún"
                          : "No se encontraron órdenes con los filtros actuales"}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto leading-relaxed">
                        {sales.length === 0
                          ? "Comienza registrando tu primera venta con el botón 'Registrar Venta'. Cada orden generará su Nota de Venta oficial y enlace a WhatsApp."
                          : "Prueba seleccionando otro canal, limpiando el texto de búsqueda o cambiando el estado."}
                      </p>
                    </div>
                    {sales.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setSalesViewMode("register")}
                        className="mt-2 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        ＋ Registrar Primera Venta
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSalesStatusFilter("all");
                          setSalesChannelFilter("all");
                          setSalesSearchQuery("");
                        }}
                        className="mt-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer border border-neutral-200"
                      >
                        Restablecer Filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedSales.map((s) => {
                      const currentStatus = s.deliveryStatus || "pending";
                      return (
                        <div
                          key={s.id}
                          className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs hover:border-neutral-300 transition-colors space-y-3"
                        >
                          {/* Fila Superior: Producto, ID, Canal, Pago y Monto Total */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-neutral-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-neutral-950 text-sm">
                                {s.productName}
                              </span>
                              <span className="text-[11px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200">
                                #{s.id}
                              </span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                                {s.channel}
                              </span>
                              {s.paymentMethod && (
                                <span className="text-[11px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200">
                                  {s.paymentMethod}
                                </span>
                              )}
                            </div>

                            <div className="text-right flex items-baseline sm:flex-col sm:items-end justify-between sm:justify-start">
                              <div className="font-black text-neutral-950 text-base sm:text-lg font-mono tracking-tight">
                                {STORE_SETTINGS.currencySymbol}{s.total.toFixed(2)}
                              </div>
                              <div className="text-[10px] font-bold text-neutral-400">
                                {currentStatus === "delivered" ? "● Cobrado" : "● Pendiente / Contraentrega"}
                              </div>
                            </div>
                          </div>

                          {/* Fila Media: Cliente, Cantidad, Fecha, Teléfono, Dirección y Guía */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-neutral-600">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Cliente</span>
                              <span className="font-bold text-neutral-900">{s.customerName}</span>
                              <span className="text-neutral-400 text-[11px] ml-1.5 font-mono">({s.quantity} un.)</span>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Fecha y Hora</span>
                              <span className="font-mono text-neutral-700">{s.date}</span>
                            </div>

                            {s.customerPhone && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Teléfono / WhatsApp</span>
                                <a
                                  href={`https://wa.me/${s.customerPhone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-neutral-900 font-mono font-bold hover:underline"
                                >
                                  {s.customerPhone}
                                </a>
                              </div>
                            )}

                            {s.customerAddress && (
                              <div className="sm:col-span-2">
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Dirección de Despacho</span>
                                <span className="text-neutral-800">{s.customerAddress}</span>
                              </div>
                            )}

                            {s.trackingNumber && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Guía / Courier</span>
                                <span className="font-mono font-bold text-neutral-900">{s.trackingNumber}</span>
                              </div>
                            )}

                            {s.notes && (
                              <div className="sm:col-span-2 lg:col-span-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-xs text-neutral-600">
                                <strong className="text-neutral-900">Nota:</strong> {s.notes}
                              </div>
                            )}
                          </div>

                          {/* Fila Inferior: Estado Logístico y Acciones */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-neutral-100">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-500">Estado:</span>
                              <select
                                value={currentStatus}
                                onChange={(e) =>
                                  handleUpdateDeliveryStatus(
                                    s.id,
                                    e.target.value as "pending" | "shipped" | "delivered" | "cancelled"
                                  )
                                }
                                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer shadow-2xs"
                              >
                                <option value="pending">● Pendiente de Despacho</option>
                                <option value="shipped">● En Camino (Courier / Reparto)</option>
                                <option value="delivered">● Entregado y Cobrado</option>
                                <option value="cancelled">● Cancelado</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setReceiptModalSale(s)}
                                className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                title="Imprimir Nota de Venta oficial"
                              >
                                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Imprimir Nota</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setWhatsappTemplateSale(s);
                                  setCustomMsgPhone(s.customerPhone || "");
                                  setCopiedTemplateIndex(null);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center gap-1.5 border border-neutral-200 transition-colors cursor-pointer"
                                title="Avisar al cliente por WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
                                <span>WhatsApp</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSale(s.id)}
                                className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                                title="Eliminar orden"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= SUB-VISTA 2: REGISTRAR VENTA (FORMULARIO POS PROFESIONAL) ================= */}
            {salesViewMode === "register" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-neutral-950 flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-emerald-600" />
                      <span>Registrar Nueva Venta</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Ingresa los datos del pedido para registrar el ingreso y descontar las unidades de inventario en tiempo real.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSalesViewMode("orders")}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer border border-neutral-200"
                  >
                    Volver a Órdenes
                  </button>
                </div>

                <form onSubmit={handleRecordManualSale} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna 1: Producto y Cobro */}
                    <div className="space-y-4 p-5 rounded-2xl bg-neutral-50/60 border border-neutral-200/80">
                      <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                        <Package className="w-4 h-4 text-neutral-700" />
                        <span>1. Producto &amp; Cobro</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-neutral-800">
                            Producto vendido
                          </label>
                          {products.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsManualProductEntry(!isManualProductEntry);
                                setSaleFormError("");
                              }}
                              className="text-xs font-semibold text-neutral-600 hover:text-black underline cursor-pointer"
                            >
                              {isManualProductEntry ? "Elegir del catálogo" : "Producto fuera de catálogo"}
                            </button>
                          )}
                        </div>

                        {isManualProductEntry || products.length === 0 ? (
                          <input
                            type="text"
                            placeholder="Nombre del producto vendido"
                            value={manualProductName}
                            onChange={(e) => setManualProductName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-semibold"
                          />
                        ) : (
                          <select
                            value={newSaleProduct}
                            onChange={(e) => setNewSaleProduct(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-semibold cursor-pointer"
                          >
                            {products.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({STORE_SETTINGS.currencySymbol}{item.price.toFixed(2)}) — Stock: {item.stockCount} uds
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={newSaleQty}
                            onChange={(e) => setNewSaleQty(parseInt(e.target.value) || 1)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            Total ({STORE_SETTINGS.currencyCode})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder={
                              !isManualProductEntry && products.find((p) => p.id === newSaleProduct)
                                ? `${((products.find((p) => p.id === newSaleProduct)?.price || 0) * newSaleQty).toFixed(2)}`
                                : "0.00"
                            }
                            value={newSaleCustomPrice}
                            onChange={(e) => setNewSaleCustomPrice(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            Canal de Venta
                          </label>
                          <select
                            value={newSaleChannel}
                            onChange={(e) => setNewSaleChannel(e.target.value as "WhatsApp" | "Presencial" | "Web")}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-semibold cursor-pointer"
                          >
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Presencial">Presencial (Tienda)</option>
                            <option value="Web">Web Comercial</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            Método de Pago
                          </label>
                          <select
                            value={newSalePayment}
                            onChange={(e) => setNewSalePayment(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-semibold cursor-pointer"
                          >
                            <option value="Yape / Plin">Yape / Plin</option>
                            <option value="Transferencia BCP">Transferencia BCP</option>
                            <option value="Transferencia BBVA">Transferencia BBVA</option>
                            <option value="Transferencia Interbank">Transferencia Interbank</option>
                            <option value="Efectivo Contraentrega">Efectivo Contraentrega</option>
                            <option value="Tarjeta Débito/Crédito">Tarjeta Débito/Crédito</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                          Fecha y Hora del Pedido
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={newSaleDate}
                            onChange={(e) => setNewSaleDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                          <input
                            type="time"
                            value={newSaleTime}
                            onChange={(e) => setNewSaleTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Columna 2: Datos del Cliente y Despacho */}
                    <div className="space-y-4 p-5 rounded-2xl bg-neutral-50/60 border border-neutral-200/80">
                      <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-neutral-700" />
                        <span>2. Cliente &amp; Logística de Despacho</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            Nombre del Cliente
                          </label>
                          <input
                            type="text"
                            placeholder="Nombre del cliente"
                            value={newSaleCustomer}
                            onChange={(e) => setNewSaleCustomer(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            Teléfono / WhatsApp
                          </label>
                          <input
                            type="text"
                            placeholder="Número telefónico"
                            value={newSaleCustomerPhone}
                            onChange={(e) => setNewSaleCustomerPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                          Dirección de Despacho
                        </label>
                        <input
                          type="text"
                          placeholder="Dirección completa o agencia de envío"
                          value={newSaleCustomerAddress}
                          onChange={(e) => setNewSaleCustomerAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            Estado Inicial de Despacho
                          </label>
                          <select
                            value={newSaleDeliveryStatus}
                            onChange={(e) => setNewSaleDeliveryStatus(e.target.value as "pending" | "shipped" | "delivered" | "cancelled")}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-semibold cursor-pointer"
                          >
                            <option value="pending">Pendiente de Despacho</option>
                            <option value="shipped">En Camino (Courier / Motorizado)</option>
                            <option value="delivered">Entregado y Cobrado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            Guía / Courier (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Número de guía o motorizado"
                            value={newSaleTrackingNumber}
                            onChange={(e) => setNewSaleTrackingNumber(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                          Observaciones o Notas Internas (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Indicaciones para la entrega o cobro"
                          value={newSaleNotes}
                          onChange={(e) => setNewSaleNotes(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  {saleFormError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{saleFormError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 gap-3">
                    <button
                      type="button"
                      onClick={() => setSalesViewMode("orders")}
                      className="px-5 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-xl bg-neutral-950 text-white font-black text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>Procesar Venta y Descontar Stock</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= SUB-VISTA 3: MÉTRICAS & ANALÍTICAS ================= */}
            {salesViewMode === "analytics" && (
              <div className="space-y-6">
                {/* 1. Barra de Control de Período */}
                <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black text-neutral-950 uppercase tracking-wide">
                        Reporte Temporal de Rendimiento
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Período activo: <strong className="text-neutral-900">{periodLabel}</strong> • {displayedSales.length} órdenes en el rango
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportSalesCSV}
                        className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Exportar CSV</span>
                      </button>

                      {sales.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllSales}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer border border-red-200"
                          title="Vaciar todo el historial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pestañas de Período Temporal */}
                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {[
                      { id: "all", label: "Todo el Historial", count: countAll, icon: null },
                      { id: "this_month", label: `Este Mes (${thisMonthName.slice(0, 3)})`, count: countThisMonth, icon: Calendar },
                      { id: "last_month", label: `Mes Pasado (${lastMonthName.slice(0, 3)})`, count: countLastMonth, icon: Clock },
                      { id: "this_week", label: "Esta Semana", count: countThisWeek, icon: null },
                      { id: "today", label: "Hoy", count: countToday, icon: null },
                    ].map((tab) => {
                      const isActive = salesPeriod === tab.id;
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSalesPeriod(tab.id as SalesPeriod)}
                          onPointerUp={(e) => e.currentTarget.blur()}
                          className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap border select-none outline-none focus:outline-none focus:ring-0 ${
                            isActive
                              ? "bg-neutral-950 border-neutral-950 text-white shadow-xs"
                              : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"
                          }`}
                        >
                          {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-neutral-500"}`} />}
                          <span>{tab.label}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-white text-neutral-600 border border-neutral-200"
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Tarjetas KPIs del Período */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider block">Ingresos Período</span>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono tracking-tight mt-1">
                      {STORE_SETTINGS.currencySymbol}{periodRevenue.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-neutral-400 mt-1 block truncate">{periodLabel}</span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider block">Total Pedidos</span>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono tracking-tight mt-1">
                      {periodOrdersCount} <span className="text-xs font-semibold text-neutral-500 font-sans">pedidos</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 mt-1 block">Registrados en rango</span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider block">Ticket Promedio</span>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono tracking-tight mt-1">
                      {STORE_SETTINGS.currencySymbol}{periodAvgTicket.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-neutral-400 mt-1 block">Por orden de compra</span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider block">Unidades Vendidas</span>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono tracking-tight mt-1">
                      {periodUnitsCount} <span className="text-xs font-semibold text-neutral-500 font-sans">uds</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 mt-1 block">Descontadas de stock</span>
                  </div>
                </div>

                {/* 3. Gráficos de Evolución & Canales */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Gráfico de Barras */}
                  <div className="lg:col-span-8 p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-neutral-950">
                            Evolución de Ingresos &amp; Pedidos
                          </h4>
                          <p className="text-[11px] text-neutral-500">
                            Comportamiento diario de ventas en {periodLabel}
                          </p>
                        </div>
                      </div>
                      {chartBars.length > 0 && (
                        <div className="text-right">
                          <span className="text-xs font-black text-neutral-950">
                            {STORE_SETTINGS.currencySymbol}{periodRevenue.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-neutral-400 block font-medium">
                            en {periodOrdersCount} órdenes
                          </span>
                        </div>
                      )}
                    </div>

                    {chartBars.length === 0 ? (
                      <div className="h-56 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-2xs">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-neutral-700">
                          Sin datos registrados en {periodLabel}
                        </span>
                        <p className="text-[11px] text-neutral-400 max-w-sm">
                          No se han registrado ventas con fecha en este período. Selecciona &quot;Todo el Historial&quot; para ver el acumulado general.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="h-56 flex items-end justify-around gap-2 pt-8 pb-3 px-3 rounded-xl bg-gradient-to-b from-neutral-50/60 to-white border border-neutral-100 overflow-x-auto">
                          {chartBars.map((bar, idx) => {
                            const heightPct = Math.max(14, Math.round((bar.revenue / maxBarRevenue) * 100));
                            const isBest = bestDay && bar.ts === bestDay.ts && chartBars.length > 1;
                            return (
                              <div
                                key={idx}
                                className="flex-1 min-w-[42px] max-w-[70px] h-full flex flex-col items-center justify-end group cursor-pointer relative"
                              >
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-neutral-950 text-white text-[10px] font-mono font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20">
                                  {STORE_SETTINGS.currencySymbol}{bar.revenue.toFixed(2)} ({bar.orders} ped.)
                                </div>
                                <div className="text-[10px] font-bold text-neutral-600 mb-1.5 group-hover:text-emerald-600 transition-colors font-mono">
                                  {STORE_SETTINGS.currencySymbol}{bar.revenue >= 1000 ? `${(bar.revenue / 1000).toFixed(1)}k` : bar.revenue.toFixed(0)}
                                </div>
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className={`w-full rounded-t-lg transition-all duration-300 ${
                                    isBest
                                      ? "bg-gradient-to-t from-emerald-700 via-emerald-600 to-emerald-400 group-hover:brightness-110 shadow-sm shadow-emerald-500/20 ring-2 ring-emerald-400/40"
                                      : "bg-gradient-to-t from-neutral-900 to-neutral-700 group-hover:from-emerald-600 group-hover:to-emerald-400"
                                  }`}
                                />
                                <div className="mt-2 text-center">
                                  <span className="text-[11px] font-bold text-neutral-800 block leading-tight">
                                    {bar.label}
                                  </span>
                                  <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-tight block">
                                    {bar.sublabel}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {bestDay && (
                          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-neutral-600">
                                Día con mayores ventas: <strong className="text-neutral-950">{bestDay.label} ({bestDay.sublabel})</strong>
                              </span>
                            </div>
                            <span className="font-extrabold text-neutral-950 font-mono">
                              {STORE_SETTINGS.currencySymbol}{bestDay.revenue.toFixed(2)} ({bestDay.orders} {bestDay.orders === 1 ? "pedido" : "pedidos"})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Canales & Top Productos */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Canales de Venta */}
                    <div className="p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                      <div className="flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-neutral-700" />
                        <h4 className="text-sm font-black text-neutral-950">
                          Distribución por Canal
                        </h4>
                      </div>

                      <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden flex shadow-inner">
                        {periodRevenue > 0 ? (
                          <>
                            <div
                              style={{ width: `${(whatsappRevenue / periodRevenue) * 100}%` }}
                              className="bg-emerald-500 h-full transition-all"
                              title={`WhatsApp: ${((whatsappRevenue / periodRevenue) * 100).toFixed(0)}%`}
                            />
                            <div
                              style={{ width: `${(presencialRevenue / periodRevenue) * 100}%` }}
                              className="bg-neutral-900 h-full transition-all"
                              title={`Presencial: ${((presencialRevenue / periodRevenue) * 100).toFixed(0)}%`}
                            />
                            <div
                              style={{ width: `${(webRevenue / periodRevenue) * 100}%` }}
                              className="bg-blue-500 h-full transition-all"
                              title={`Web: ${((webRevenue / periodRevenue) * 100).toFixed(0)}%`}
                            />
                          </>
                        ) : (
                          <div className="w-full bg-neutral-200 h-full" />
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <div>
                              <span className="font-bold text-neutral-900 block">WhatsApp</span>
                              <span className="text-[10px] text-neutral-400">{whatsappSales.length} pedidos</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-neutral-950 block font-mono">
                              {STORE_SETTINGS.currencySymbol}{whatsappRevenue.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-bold">
                              {periodRevenue > 0 ? ((whatsappRevenue / periodRevenue) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                            <div>
                              <span className="font-bold text-neutral-900 block">Presencial</span>
                              <span className="text-[10px] text-neutral-400">{presencialSales.length} pedidos</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-neutral-950 block font-mono">
                              {STORE_SETTINGS.currencySymbol}{presencialRevenue.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-bold">
                              {periodRevenue > 0 ? ((presencialRevenue / periodRevenue) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </div>

                        {webSales.length > 0 && (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                              <div>
                                <span className="font-bold text-neutral-900 block">Web Comercial</span>
                                <span className="text-[10px] text-neutral-400">{webSales.length} pedidos</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-neutral-950 block font-mono">
                                {STORE_SETTINGS.currencySymbol}{webRevenue.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-bold">
                                {periodRevenue > 0 ? ((webRevenue / periodRevenue) * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Productos Más Vendidos */}
                    <div className="p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-neutral-950 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-neutral-700" />
                          <span>Top Modelos Vendidos</span>
                        </h4>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          {topProducts.length} productos
                        </span>
                      </div>

                      {topProducts.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-3 text-center">
                          No hay productos registrados en este período.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {topProducts.map((p, idx) => {
                            const maxUnits = topProducts[0]?.units || 1;
                            const pct = Math.round((p.units / maxUnits) * 100);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-neutral-900 truncate max-w-[180px]">
                                    #{idx + 1} {p.name}
                                  </span>
                                  <div className="flex items-center gap-2 font-mono">
                                    <span className="font-bold text-neutral-950">
                                      {p.units} un.
                                    </span>
                                    <span className="text-[11px] text-neutral-400">
                                      ({STORE_SETTINGS.currencySymbol}{p.revenue.toFixed(0)})
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className={`h-full rounded-full ${
                                      idx === 0
                                        ? "bg-emerald-500"
                                        : idx === 1
                                        ? "bg-neutral-900"
                                        : "bg-neutral-400"
                                    }`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PESTAÑA: AJUSTES & WHATSAPP ================= */}
        {activeTab === "settings" && (() => {
          const cleanPhoneDisplay = phoneInput ? phoneInput.replace(/^51/, "") : "";
          const testWhatsAppUrl = `https://wa.me/51${cleanPhoneDisplay}?text=${encodeURIComponent(
            "Hola PulsoTech, prueba de conexión desde el Panel Administrativo POS."
          )}`;

          return (
            <div className="space-y-5">
              {/* Header del Módulo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider mb-0.5">
                    <span>Configuración</span>
                    <span>/</span>
                    <span className="text-neutral-700">Terminal &amp; Canales</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-neutral-900" />
                    <span>Ajustes del Sistema y WhatsApp</span>
                  </h2>
                </div>

                {/* Sub-views / Segmented Pills */}
                <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80 shrink-0 overflow-x-auto max-w-full">
                  {[
                    { id: "whatsapp", label: "WhatsApp" },
                    { id: "security", label: "Seguridad & PIN" },
                    { id: "backup", label: "Respaldos & Datos" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSettingsViewTab(tab.id as "whatsapp" | "security" | "backup")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        settingsViewTab === tab.id
                          ? "bg-white text-neutral-950 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Tarjetas KPI Comerciales y Operativas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* KPI 1: WhatsApp Receptor */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Canal WhatsApp</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-neutral-950 font-mono tracking-tight truncate">
                      {phoneInput ? `+51 ${cleanPhoneDisplay}` : "Sin registrar"}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Receptor de pedidos activo</span>
                    </div>
                  </div>
                </div>

                {/* KPI 2: Seguridad del Panel */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Seguridad PIN</span>
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-neutral-950 font-mono tracking-tight">
                      Protección Activa
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Bloqueo automático en 5 intentos
                    </div>
                  </div>
                </div>

                {/* KPI 3: Productos en Catálogo */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Catálogo Activo</span>
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-neutral-950 font-mono tracking-tight">
                      {products.length} productos
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Disponibles en tienda web
                    </div>
                  </div>
                </div>

                {/* KPI 4: Ventas Registradas */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Ventas Realizadas</span>
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-neutral-950 font-mono tracking-tight">
                      {sales.length} órdenes
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Historial comercial registrado
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenedor de Secciones Individuales */}
              <div className="w-full">
                {/* CARD 1: WHATSAPP */}
                {settingsViewTab === "whatsapp" && (
                      <form
                        onSubmit={handleSavePhone}
                        className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4"
                      >
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-sm font-extrabold text-neutral-950">Canal Comercial WhatsApp</h3>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Receptor Oficial
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-900 block">
                            Número Receptor de Pedidos
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-300 text-xs font-mono font-bold text-neutral-700 shrink-0">
                              <span>PE (+51)</span>
                            </div>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 15))}
                              placeholder="51902377567"
                              className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-mono font-bold text-neutral-950 focus:outline-none focus:bg-white focus:border-neutral-900"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                          <a
                            href={testWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Probar Chat en WhatsApp</span>
                          </a>

                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Guardar Teléfono</span>
                          </button>
                        </div>

                        {phoneSaved && (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Número de WhatsApp actualizado exitosamente.</span>
                          </div>
                        )}
                      </form>
                    )}

                {/* CARD 2: SEGURIDAD Y PIN */}
                {settingsViewTab === "security" && (
                      <form
                        onSubmit={handleChangePin}
                        className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4"
                      >
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-neutral-900" />
                            <h3 className="text-sm font-extrabold text-neutral-950">Seguridad &amp; PIN de Acceso</h3>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                            Terminal Protegido
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              PIN Actual
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPinToggle ? "text" : "password"}
                                inputMode="numeric"
                                maxLength={12}
                                value={currentPinInput}
                                onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ""))}
                                placeholder="••••••"
                                required
                                className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPinToggle(!showCurrentPinToggle)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                              >
                                {showCurrentPinToggle ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Nuevo PIN
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPinToggle ? "text" : "password"}
                                inputMode="numeric"
                                maxLength={12}
                                value={newPinInput}
                                onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                                placeholder="••••••"
                                required
                                className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPinToggle(!showNewPinToggle)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                              >
                                {showNewPinToggle ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Confirmar PIN
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPinToggle ? "text" : "password"}
                                inputMode="numeric"
                                maxLength={12}
                                value={confirmPinInput}
                                onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ""))}
                                placeholder="••••••"
                                required
                                className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPinToggle(!showConfirmPinToggle)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                              >
                                {showConfirmPinToggle ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {pinChangeNotice && (
                          <div
                            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                              pinChangeNotice.isError
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {pinChangeNotice.isError ? (
                              <AlertCircle className="w-4 h-4 shrink-0" />
                            ) : (
                              <CheckCircle className="w-4 h-4 shrink-0" />
                            )}
                            <span>{pinChangeNotice.text}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <LogOut className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Bloquear Terminal</span>
                          </button>

                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Actualizar PIN</span>
                          </button>
                        </div>
                      </form>
                    )}
                {/* CARD 3: RESPALDOS Y EXPORTACIÓN */}
                {settingsViewTab === "backup" && (
                  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-neutral-900" />
                          <h3 className="text-sm font-extrabold text-neutral-950">Copias de Seguridad &amp; Exportación</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                          {products.length} productos · {sales.length} órdenes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={handleExportProductsCSV}
                          className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-left transition-colors cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-neutral-950 font-extrabold text-xs mb-1">
                            <span>Inventario (.CSV)</span>
                            <Download className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                          </div>
                          <p className="text-[10px] text-neutral-500 font-medium">
                            Excel ({products.length} ítems)
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportSalesCSV}
                          className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-left transition-colors cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-neutral-950 font-extrabold text-xs mb-1">
                            <span>Ventas (.CSV)</span>
                            <Download className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                          </div>
                          <p className="text-[10px] text-neutral-500 font-medium">
                            Reporte ({sales.length} órdenes)
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportBackupJSON}
                          className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-left transition-colors cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-neutral-950 font-extrabold text-xs mb-1">
                            <span>Backup JSON</span>
                            <FileText className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                          </div>
                          <p className="text-[10px] text-neutral-500 font-medium">
                            Copia íntegra
                          </p>
                        </button>
                      </div>

                      {/* Restaurar Respaldo JSON */}
                      <div className="pt-2 border-t border-neutral-100">
                        <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">
                              Restaurar desde Respaldo JSON
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              Carga un archivo de respaldo previo para restablecer el catálogo.
                            </span>
                          </div>

                          <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 text-xs font-bold cursor-pointer transition-colors shadow-2xs shrink-0">
                            <Upload className="w-3.5 h-3.5 text-neutral-600" />
                            <span>Cargar Archivo</span>
                            <input
                              type="file"
                              accept=".json,application/json"
                              onChange={handleRestoreBackupJSON}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Modal de Código QR para Vitrina y Redes */}
        {qrModalProduct && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div
              className="absolute inset-0"
              onClick={() => setQrModalProduct(null)}
            />
            <div className="relative bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 text-center text-neutral-900 animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setQrModalProduct(null)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
                  #{qrModalProduct.id}
                </span>
                <h3 className="text-base font-extrabold text-neutral-950">
                  {qrModalProduct.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  {qrModalProduct.brand} • {STORE_SETTINGS.currencySymbol}{qrModalProduct.price.toFixed(2)}
                </p>
              </div>

              {/* QR Image */}
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-neutral-200 inline-block shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? `${window.location.origin}${window.location.pathname.replace(/\/Lionel260606.*$/, "")}/producto/?id=${qrModalProduct.id}&slug=${qrModalProduct.slug}`
                      : `https://lxionel.github.io/PulsoTech/producto/?id=${qrModalProduct.id}&slug=${qrModalProduct.slug}`
                  )}`}
                  alt={`QR de ${qrModalProduct.name}`}
                  className="w-48 h-48 mx-auto object-contain rounded-lg"
                />
              </div>

              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Escanea para ver la ficha técnica, fotos de colores y pedir directo por WhatsApp.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const url = typeof window !== "undefined"
                      ? `${window.location.origin}${window.location.pathname.replace(/\/Lionel260606.*$/, "")}/producto/?id=${qrModalProduct.id}&slug=${qrModalProduct.slug}`
                      : `https://lxionel.github.io/PulsoTech/producto/?id=${qrModalProduct.id}&slug=${qrModalProduct.slug}`;
                    navigator.clipboard.writeText(url);
                    setCopiedQrLink(true);
                    setTimeout(() => setCopiedQrLink(false), 2500);
                  }}
                  className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedQrLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Enlace Copiado al Portapapeles</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace Directo</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&format=png&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? `${window.location.origin}${window.location.pathname.replace(/\/Lionel260606.*$/, "")}/producto/?id=${qrModalProduct.id}&slug=${qrModalProduct.slug}`
                      : `https://lxionel.github.io/PulsoTech/producto/?id=${qrModalProduct.id}&slug=${qrModalProduct.slug}`
                  )}`}
                  download={`QR_${qrModalProduct.slug}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Imagen QR (PNG)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Comprobante de Despacho & Nota de Venta (Imprimible / PDF) */}
        {receiptModalSale && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-receipt-card,
                #printable-receipt-card * {
                  visibility: visible;
                }
                #printable-receipt-card {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  border: none !important;
                  padding: 24px !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  background: white !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>
            <div
              className="absolute inset-0 no-print"
              onClick={() => setReceiptModalSale(null)}
            />

            <div
              id="printable-receipt-card"
              className="relative bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-neutral-900 z-10 animate-in zoom-in-95 duration-150"
            >
              {/* Encabezado del Comprobante */}
              <div className="flex items-start justify-between border-b border-neutral-200 pb-4 gap-4">
                <div>
                  <div className="text-xl font-black tracking-tight text-neutral-950">
                    PULSOTECH
                  </div>
                  <div className="text-[11px] text-neutral-500 font-medium">
                    Accesorios Tecnológicos & Audio Original
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Lima, Perú • WhatsApp: +{STORE_SETTINGS.whatsappNumber}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Comprobante de Despacho
                  </div>
                  <div className="text-sm font-mono font-black text-neutral-950 mt-0.5">
                    #{receiptModalSale.id}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    {receiptModalSale.date}
                  </div>
                </div>
              </div>

              {/* Datos del Cliente y Despacho */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Datos de Entrega al Cliente
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-700">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Cliente:</span>
                    <strong className="text-neutral-950 font-bold">{receiptModalSale.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Teléfono:</span>
                    <strong className="text-neutral-950 font-mono">
                      {receiptModalSale.customerPhone || "Coordinado por WhatsApp"}
                    </strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-neutral-400 block text-[10px]">Dirección de Entrega:</span>
                    <span className="text-neutral-900 font-medium">
                      {receiptModalSale.customerAddress || "Entrega en mano / Coordinar por chat"}
                    </span>
                  </div>
                  {receiptModalSale.trackingNumber && (
                    <div className="sm:col-span-2">
                      <span className="text-neutral-400 block text-[10px]">Guía / Motorizado Asignado:</span>
                      <span className="text-blue-700 font-semibold font-mono">
                        {receiptModalSale.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalle del Pedido */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px] border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Cant</th>
                      <th className="py-2.5 px-3">Descripción</th>
                      <th className="py-2.5 px-3 text-right">P. Unit</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-center">
                        {receiptModalSale.quantity}
                      </td>
                      <td className="py-2.5 px-3 font-medium">
                        {receiptModalSale.productName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-500">
                        {STORE_SETTINGS.currencySymbol}
                        {(receiptModalSale.total / receiptModalSale.quantity).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-950">
                        {STORE_SETTINGS.currencySymbol}
                        {receiptModalSale.total.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Recuadro Destacado para el Motorizado / Repartidor */}
              <div className="p-4 rounded-xl bg-neutral-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Total a Cobrar en Destino (Contra Entrega)
                  </div>
                  <div className="text-xs text-neutral-300 mt-0.5">
                    Método: {receiptModalSale.paymentMethod || "Efectivo / Yape"}
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {STORE_SETTINGS.currencySymbol}{receiptModalSale.total.toFixed(2)}
                </div>
              </div>

              {/* Notas de Despacho */}
              {receiptModalSale.notes && (
                <div className="text-[11px] text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <strong className="text-neutral-900 font-semibold block text-[10px] uppercase text-neutral-400 mb-0.5">
                    Instrucciones Especiales:
                  </strong>
                  {receiptModalSale.notes}
                </div>
              )}

              {/* Conformidad de Entrega */}
              <div className="pt-4 border-t border-dashed border-neutral-300 grid grid-cols-2 gap-4 text-[10px] text-neutral-500">
                <div className="border-t border-neutral-300 pt-1 text-center mt-6">
                  Firma del Cliente al Recibir
                </div>
                <div className="border-t border-neutral-300 pt-1 text-center mt-6">
                  DNI / Fecha de Recepción
                </div>
              </div>

              <div className="text-[10px] text-neutral-400 text-center leading-relaxed">
                Garantía oficial de 12 meses por defectos de fábrica. Conservar este comprobante para cualquier soporte técnico.
              </div>

              {/* Botones de Acción (no-print) */}
              <div className="pt-2 flex items-center justify-between gap-2 no-print border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setReceiptModalSale(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs cursor-pointer"
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar en PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Plantillas Rápidas de WhatsApp para Despacho */}
        {whatsappTemplateSale && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
            <div
              className="absolute inset-0"
              onClick={() => setWhatsappTemplateSale(null)}
            />

            <div className="relative bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 text-neutral-900 z-10 animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-950 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>Mensajes de Despacho para WhatsApp</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Notifica al cliente con 1 clic el estado de su orden #{whatsappTemplateSale.id}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappTemplateSale(null)}
                  className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Teléfono de Envío */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Número de WhatsApp del Cliente
                </label>
                <input
                  type="text"
                  value={customMsgPhone}
                  onChange={(e) => setCustomMsgPhone(e.target.value)}
                  placeholder="Número de WhatsApp"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Opciones de Plantillas */}
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {[
                  {
                    title: "1. Notificación de Salida a Ruta (Motorizado / Contra Entrega)",
                    desc: "Para avisar que el pedido ya fue despachado y el monto a preparar.",
                    text: `Hola ${whatsappTemplateSale.customerName}, te saluda PulsoTech. Tu pedido #${whatsappTemplateSale.id} (${whatsappTemplateSale.quantity}x ${whatsappTemplateSale.productName}) ya salió en camino con nuestro motorizado hacia ${whatsappTemplateSale.customerAddress || "tu dirección"}. El monto exacto a pagar en contra entrega es de S/ ${whatsappTemplateSale.total.toFixed(2)}. Por favor mantén tu celular atento para coordinar la llegada del repartidor. ¡Muchas gracias!`,
                  },
                  {
                    title: "2. Envío por Agencia a Provincia (Shalom / Olva Courier)",
                    desc: "Para clientes fuera de Lima con número de seguimiento.",
                    text: `Hola ${whatsappTemplateSale.customerName}, te saluda PulsoTech. Confirmamos que tu pedido #${whatsappTemplateSale.id} (${whatsappTemplateSale.productName}) ya fue depositado en agencia para el envío a provincia. ${whatsappTemplateSale.trackingNumber ? "Número de guía / seguimiento: " + whatsappTemplateSale.trackingNumber + "." : "Te estaremos adjuntando la fotografía del remito en breve."} Te mantendremos informado hasta que llegue a tus manos. ¡Muchas gracias por tu compra!`,
                  },
                  {
                    title: "3. Confirmación de Entrega y Garantía Oficial de 12 Meses",
                    desc: "Para cerrar la venta con social proof y activar su garantía.",
                    text: `Hola ${whatsappTemplateSale.customerName}, te saluda PulsoTech. Confirmamos la entrega exitosa de tu pedido #${whatsappTemplateSale.id}. ¡Muchas gracias por confiar en nosotros! Recuerda que tus ${whatsappTemplateSale.productName} cuentan con garantía oficial de 12 meses ante cualquier defecto de fábrica. Si tienes alguna duda con la configuración o el uso, estamos atentos a responderte por este mismo canal. ¡Que disfrutes tu música!`,
                  },
                ].map((template, idx) => {
                  const cleanPhone = customMsgPhone.replace(/\D/g, "");
                  const waUrl = `https://wa.me/${cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`}?text=${encodeURIComponent(
                    template.text
                  )}`;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-neutral-900">
                          {template.title}
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        {template.desc}
                      </p>

                      <div className="p-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-700 font-sans leading-relaxed whitespace-pre-wrap select-all">
                        {template.text}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(template.text);
                            setCopiedTemplateIndex(idx);
                            setTimeout(() => setCopiedTemplateIndex(null), 2500);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedTemplateIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Copiar Texto</span>
                            </>
                          )}
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar por WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-neutral-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setWhatsappTemplateSale(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
