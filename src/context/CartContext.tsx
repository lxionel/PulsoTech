"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { Product, ProductColor, CartItem, Coupon } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import { useProducts } from "@/context/ProductsContext";
import { addCartItem, setCartQuantity, inspectCart, cartQuantityLimit, cartTotals } from "@/lib/cart-stock";
import { createMutationQueue, confirmMutation } from "@/lib/confirmed-mutation";
import { validateCoupon } from "@/lib/coupon-validation";
import {
  fetchCouponsFromSupabase,
  saveCouponsToSupabase,
  fetchStoreSettingsFromSupabase,
  saveStoreSettingsToSupabase,
  isSupabaseReady,
} from "@/lib/supabase";

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "cp-1",
    code: "PULSO10",
    discountType: "percentage",
    discountValue: 10,
    minPurchase: 50,
    isActive: true,
  },
  {
    id: "cp-2",
    code: "BIENVENIDA",
    discountType: "fixed",
    discountValue: 15,
    minPurchase: 80,
    isActive: true,
  },
];

interface CartContextType {
  items: CartItem[];
  stockIssues: Map<string, string>;
  stockNotice: string;
  clearStockNotice: () => void;
  isCheckingStock: boolean;
  isInventoryLoading: boolean;
  quantityLimit: (productId: string, color: string) => number;
  validateCart: () => Promise<{ items: CartItem[]; discountAmount: number; total: number } | null>;
  addItem: (product: Product, color?: ProductColor, quantity?: number) => void;
  removeItem: (productId: string, colorName: string) => void;
  updateQuantity: (productId: string, colorName: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  subtotal: number;
  discountAmount: number;
  shipping: number;
  total: number;
  itemsCount: number;
  freeShippingRemaining: number;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => Promise<void>;
  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoritesCount: number;
  isFavoritesOpen: boolean;
  setIsFavoritesOpen: (isOpen: boolean) => void;
  // Cupones
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Omit<Coupon, "id">) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  toggleCoupon: (id: string) => Promise<void>;
  syncCouponsToCloud: (overrideCoupons?: Coupon[]) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products, isLoading: isInventoryLoading, refreshFromCloud } = useProducts();
  const [cartState, setCartState] = useState<{ items: CartItem[]; notice: string }>({ items: [], notice: "" });
  const savedItems = cartState.items;
  const setItems = (next: CartItem[] | ((previous: CartItem[]) => CartItem[])) => {
    setCartState((previous) => ({ ...previous, items: typeof next === "function" ? next(previous.items) : next }));
  };
  const inspected = useMemo(() => inspectCart(savedItems, products), [savedItems, products]);
  const items = isInventoryLoading ? savedItems : inspected.items;
  const stockIssues = isInventoryLoading ? new Map<string, string>() : inspected.issues;
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const checkingStock = useRef(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(STORE_SETTINGS.whatsappNumber);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cupones
  const [coupons, setCouponsState] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const couponsRef = useRef(coupons);
  const [enqueue] = useState(() => createMutationQueue());
  const setCoupons = (next: Coupon[]) => { couponsRef.current = next; setCouponsState(next); };
  const effectiveCoupon = coupons.find((coupon) => coupon.id === appliedCoupon?.id && coupon.isActive) || null;

  // Cargar datos de localStorage una sola vez tras montar en el cliente y sincronizar cupones de Supabase
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const savedCart = localStorage.getItem("pulsotech_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) setItems(parsed);
        }

        const savedFavs = localStorage.getItem("pulsotech_favorites");
        if (savedFavs) {
          const parsedFavs = JSON.parse(savedFavs);
          if (Array.isArray(parsedFavs)) setFavorites(parsedFavs);
        }

        const savedPhone = localStorage.getItem("pulsotech_phone");
        if (savedPhone && savedPhone !== "51987654321") {
          setWhatsappNumber(savedPhone);
        }

        const savedCoupons = localStorage.getItem("pulsotech_coupons");
        let initialCoupons = DEFAULT_COUPONS;
        if (savedCoupons) {
          const parsedCoupons = JSON.parse(savedCoupons);
          if (Array.isArray(parsedCoupons)) initialCoupons = parsedCoupons;
        }
        if (!isCancelled) setCoupons(initialCoupons);

        // Cargar cupones y teléfono receptor persistentes desde Supabase
        const cloudCoupons = await fetchCouponsFromSupabase();
        if (!isCancelled && cloudCoupons !== null) {
          setCoupons(cloudCoupons);
          try {
            localStorage.setItem("pulsotech_coupons", JSON.stringify(cloudCoupons));
          } catch {
            // Ignorar error de almacenamiento
          }
        }

        const cloudSettings = await fetchStoreSettingsFromSupabase();
        if (!isCancelled && cloudSettings?.whatsappNumber) {
          setWhatsappNumber(cloudSettings.whatsappNumber);
          try {
            localStorage.setItem("pulsotech_phone", cloudSettings.whatsappNumber);
          } catch {
            // Ignorar
          }
        }
      } catch {
        // Ignorar error de parsing
      } finally {
        if (!isCancelled) setIsLoaded(true);
      }
    }, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Guardar en localStorage únicamente después de haber completado la carga inicial
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("pulsotech_cart", JSON.stringify(savedItems));
      localStorage.setItem("pulsotech_favorites", JSON.stringify(favorites));
      localStorage.setItem("pulsotech_phone", whatsappNumber);
      localStorage.setItem("pulsotech_coupons", JSON.stringify(coupons));
    } catch {
      // Ignorar error de almacenamiento
    }
  }, [savedItems, favorites, whatsappNumber, coupons, isLoaded]);

  const clearStockNotice = () => setCartState((previous) => ({ ...previous, notice: "" }));
  const setStockNotice = (notice: string) => setCartState((previous) => ({ ...previous, notice }));
  const quantityLimit = (productId: string, color: string) => cartQuantityLimit(items, products, productId, color);

  const addItem = (product: Product, color?: ProductColor, quantity = 1) => {
    if (checkingStock.current) return;
    setIsCartOpen(true);
    if (isInventoryLoading) {
      setStockNotice("Estamos cargando la disponibilidad. Intenta de nuevo en un momento.");
      return;
    }
    const validColor = color || product.colors?.[0] || {
      name: "Original", hex: "#18181b", image: product.images?.[0] || getAssetUrl("/placeholder-earbuds.svg"),
    };
    setCartState((previous) => addCartItem(previous.items, products, product.id, validColor, quantity));
  };

  const removeItem = (productId: string, colorName: string) => {
    if (checkingStock.current) return;
    setCartState((previous) => ({
      items: previous.items.filter((item) => !(item.product.id === productId && (item.selectedColor?.name || "Original") === colorName)),
      notice: "",
    }));
  };

  const updateQuantity = (productId: string, colorName: string, quantity: number) => {
    if (checkingStock.current) return;
    if (isInventoryLoading) {
      setStockNotice("Estamos cargando la disponibilidad. Intenta de nuevo en un momento.");
      return;
    }
    setCartState((previous) => setCartQuantity(previous.items, products, productId, colorName, quantity));
  };

  const clearCart = () => {
    if (checkingStock.current) return;
    setCartState({ items: [], notice: "" });
    setAppliedCoupon(null);
  };

  const validateCart = async () => {
    if (checkingStock.current || savedItems.length === 0) return null;
    if (isInventoryLoading) {
      setStockNotice("Estamos cargando la disponibilidad. Intenta de nuevo en un momento.");
      return null;
    }
    checkingStock.current = true;
    setIsCheckingStock(true);
    try {
      const latestProducts = isSupabaseReady() ? await refreshFromCloud() : products;
      if (latestProducts === null) {
        setStockNotice("No pudimos comprobar el stock. Intenta de nuevo antes de enviar tu pedido.");
        return null;
      }
      const checked = inspectCart(savedItems, latestProducts);
      setItems(checked.items);
      if (checked.issues.size > 0) {
        setStockNotice("Revisa los productos marcados en tu bolsa antes de continuar.");
        return null;
      }
      if (checked.pricesChanged) {
        setStockNotice("Se actualizaron los precios de tu bolsa. Revisa el total y vuelve a pulsar Pedir por WhatsApp.");
        return null;
      }
      clearStockNotice();
      return { items: checked.items, ...cartTotals(checked.items, effectiveCoupon) };
    } catch {
      setStockNotice("No pudimos comprobar el stock. Intenta de nuevo antes de enviar tu pedido.");
      return null;
    } finally {
      checkingStock.current = false;
      setIsCheckingStock(false);
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  // Manejadores de Cupones
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { success: false, message: "El cupón ingresado no existe." };
    }
    if (!found.isActive) {
      return { success: false, message: "Este cupón ya no está activo." };
    }
    if (found.minPurchase && subtotal < found.minPurchase) {
      return {
        success: false,
        message: `El monto mínimo para este cupón es de ${STORE_SETTINGS.currencySymbol}${found.minPurchase.toFixed(2)}.`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `¡Cupón ${found.code} aplicado correctamente!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const syncCouponsToCloud = async (overrideCoupons?: Coupon[]): Promise<boolean> => {
    try {
      const toSync = overrideCoupons || coupons;
      return await saveCouponsToSupabase(toSync);
    } catch (err) {
      console.error("Error al sincronizar cupones a la nube:", err);
      return false;
    }
  };

  const persistCoupons = async (next: Coupon[]) => {
    const commit = () => { couponsRef.current = next; setCoupons(next); };
    if (isSupabaseReady()) await confirmMutation(() => saveCouponsToSupabase(next), commit);
    else commit();
  };

  const addCoupon = (data: Omit<Coupon, "id">) => enqueue(async () => {
    validateCoupon(data);
    const code = data.code.trim().toUpperCase();
    if (couponsRef.current.some((coupon) => coupon.code.toUpperCase() === code)) throw new Error("Ya existe ese cupón.");
    await persistCoupons([{ ...data, code, id: crypto.randomUUID() }, ...couponsRef.current]);
  });
  const deleteCoupon = (id: string) => enqueue(async () => {
    await persistCoupons(couponsRef.current.filter((coupon) => coupon.id !== id));
    if (appliedCoupon?.id === id) setAppliedCoupon(null);
  });
  const toggleCoupon = (id: string) => enqueue(async () => {
    await persistCoupons(couponsRef.current.map((coupon) => coupon.id === id ? { ...coupon, isActive: !coupon.isActive } : coupon));
  });

  // Cálculos de Totales - El total es exactamente subtotal menos descuento (sin cargos ocultos de envío)
  const { subtotal, discountAmount, total } = cartTotals(items, effectiveCoupon);

  // Costo de envío es 0 ya que se coordina vía WhatsApp
  const shipping = 0;
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = 0;
  const favoritesCount = favorites.length;

  const handleSetWhatsappNumber = (num: string) => enqueue(async () => {
    if (!/^51\d{9}$/.test(num)) throw new Error("Ingresa un número de Perú con el código 51 y nueve dígitos.");
    const commit = () => setWhatsappNumber(num);
    if (isSupabaseReady()) await confirmMutation(() => saveStoreSettingsToSupabase("whatsapp_number", num), commit);
    else commit();
  });

  return (
    <CartContext.Provider
      value={{
        items,
        stockIssues,
        stockNotice: cartState.notice,
        clearStockNotice,
        isCheckingStock,
        isInventoryLoading,
        quantityLimit,
        validateCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        selectedProductForModal,
        setSelectedProductForModal,
        subtotal,
        discountAmount,
        shipping,
        total,
        itemsCount,
        freeShippingRemaining,
        whatsappNumber,
        setWhatsappNumber: handleSetWhatsappNumber,
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount,
        isFavoritesOpen,
        setIsFavoritesOpen,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        deleteCoupon,
        toggleCoupon,
        syncCouponsToCloud,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
