"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductColor, CartItem, Coupon } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";
import {
  fetchCouponsFromSupabase,
  saveCouponsToSupabase,
  fetchStoreSettingsFromSupabase,
  saveStoreSettingsToSupabase,
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
  setWhatsappNumber: (num: string) => void;
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
  addCoupon: (coupon: Omit<Coupon, "id">) => void;
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;
  syncCouponsToCloud: (overrideCoupons?: Coupon[]) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(STORE_SETTINGS.whatsappNumber);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cupones
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

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
        if (!isCancelled && cloudCoupons && cloudCoupons.length > 0) {
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
      localStorage.setItem("pulsotech_cart", JSON.stringify(items));
      localStorage.setItem("pulsotech_favorites", JSON.stringify(favorites));
      localStorage.setItem("pulsotech_phone", whatsappNumber);
      localStorage.setItem("pulsotech_coupons", JSON.stringify(coupons));
    } catch {
      // Ignorar error de almacenamiento
    }
  }, [items, favorites, whatsappNumber, coupons, isLoaded]);

  const addItem = (product: Product, color?: ProductColor, quantity = 1) => {
    const isOutOfStock = (product.stockCount ?? 0) <= 0 || product.inStock === false;
    if (isOutOfStock) {
      alert(`El producto "${product.name}" se encuentra agotado.`);
      return;
    }

    const validColor: ProductColor = color || (product.colors && product.colors[0]) || {
      name: "Original",
      hex: "#18181b",
      image: product.images?.[0] || getAssetUrl("/placeholder-earbuds.svg"),
    };

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (item.selectedColor?.name || "Original") === validColor.name
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        if (product.stockCount && newQty > product.stockCount) {
          alert(`Solo quedan ${product.stockCount} unidades disponibles de este producto.`);
          next[existingIndex].quantity = product.stockCount;
        } else {
          next[existingIndex].quantity = newQty;
        }
        return next;
      }

      const initialQty = product.stockCount && quantity > product.stockCount ? product.stockCount : quantity;
      return [...prev, { product, selectedColor: validColor, quantity: initialQty }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, colorName: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && (item.selectedColor?.name || "Original") === colorName)
      )
    );
  };

  const updateQuantity = (productId: string, colorName: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, colorName);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && (item.selectedColor?.name || "Original") === colorName
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
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

  const addCoupon = (couponData: Omit<Coupon, "id">) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cp-${Date.now().toString().slice(-5)}`,
      code: couponData.code.trim().toUpperCase(),
    };
    setCoupons((prev) => {
      const next = [newCoupon, ...prev];
      void saveCouponsToSupabase(next);
      return next;
    });
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => {
      const next = prev.filter((c) => c.id !== id);
      void saveCouponsToSupabase(next);
      return next;
    });
    if (appliedCoupon?.id === id) {
      setAppliedCoupon(null);
    }
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
      void saveCouponsToSupabase(next);
      return next;
    });
  };

  // Cálculos de Totales - El total es exactamente subtotal menos descuento (sin cargos ocultos de envío)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && appliedCoupon.isActive) {
    if (appliedCoupon.minPurchase && subtotal < appliedCoupon.minPurchase) {
      discountAmount = 0;
    } else if (appliedCoupon.discountType === "percentage") {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  // Costo de envío es 0 ya que se coordina vía WhatsApp
  const shipping = 0;
  const total = Math.max(0, subtotal - discountAmount);
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = 0;
  const favoritesCount = favorites.length;

  const handleSetWhatsappNumber = (num: string) => {
    setWhatsappNumber(num);
    try {
      localStorage.setItem("pulsotech_phone", num);
    } catch {
      // Ignorar error de almacenamiento
    }
    void saveStoreSettingsToSupabase("whatsapp_number", num);
  };

  return (
    <CartContext.Provider
      value={{
        items,
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
