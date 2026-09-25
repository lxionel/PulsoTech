"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductColor, CartItem, Coupon, StoreBanner } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";

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

export const DEFAULT_BANNER: StoreBanner = {
  enabled: true,
  text: "🚚 ¡Envíos gratis a todo el Perú por compras mayores a S/ 100!",
  badge: "OFERTA",
  theme: "emerald",
};

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
  // Banner de la Tienda
  storeBanner: StoreBanner;
  setStoreBanner: (banner: StoreBanner) => void;
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

  // Cupones y Banner
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [storeBanner, setStoreBanner] = useState<StoreBanner>(DEFAULT_BANNER);

  // Cargar datos de localStorage una sola vez tras montar en el cliente (evita Hydration Mismatch)
  useEffect(() => {
    const timer = setTimeout(() => {
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
        if (savedCoupons) {
          const parsedCoupons = JSON.parse(savedCoupons);
          if (Array.isArray(parsedCoupons)) setCoupons(parsedCoupons);
        }

        const savedBanner = localStorage.getItem("pulsotech_banner");
        if (savedBanner) {
          const parsedBanner = JSON.parse(savedBanner);
          if (parsedBanner && typeof parsedBanner === "object") setStoreBanner(parsedBanner);
        }
      } catch {
        // Ignorar error de parsing
      } finally {
        setIsLoaded(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Guardar en localStorage únicamente después de haber completado la carga inicial
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("pulsotech_cart", JSON.stringify(items));
      localStorage.setItem("pulsotech_favorites", JSON.stringify(favorites));
      localStorage.setItem("pulsotech_phone", whatsappNumber);
      localStorage.setItem("pulsotech_coupons", JSON.stringify(coupons));
      localStorage.setItem("pulsotech_banner", JSON.stringify(storeBanner));
    } catch {
      // Ignorar error de almacenamiento
    }
  }, [items, favorites, whatsappNumber, coupons, storeBanner, isLoaded]);

  const addItem = (product: Product, color?: ProductColor, quantity = 1) => {
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
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, { product, selectedColor: validColor, quantity }];
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

  const addCoupon = (couponData: Omit<Coupon, "id">) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cp-${Date.now().toString().slice(-5)}`,
      code: couponData.code.trim().toUpperCase(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    if (appliedCoupon?.id === id) {
      setAppliedCoupon(null);
    }
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Cálculos de Totales
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

  const shipping =
    subtotal >= STORE_SETTINGS.freeShippingThreshold || subtotal === 0
      ? 0
      : STORE_SETTINGS.shippingCost;
  const total = Math.max(0, subtotal - discountAmount + shipping);
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, STORE_SETTINGS.freeShippingThreshold - subtotal);
  const favoritesCount = favorites.length;

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
        setWhatsappNumber,
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
        storeBanner,
        setStoreBanner,
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
