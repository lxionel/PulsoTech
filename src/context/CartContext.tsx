"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductColor, CartItem } from "@/types";
import { STORE_SETTINGS } from "@/data/products";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color: ProductColor, quantity?: number) => void;
  removeItem: (productId: string, colorName: string) => void;
  updateQuantity: (productId: string, colorName: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  subtotal: number;
  shipping: number;
  total: number;
  itemsCount: number;
  freeShippingRemaining: number;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pulsotech_cart");
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignorar error
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPhone = localStorage.getItem("pulsotech_phone");
        if (savedPhone) return savedPhone;
      } catch {
        // Ignorar error
      }
    }
    return STORE_SETTINGS.whatsappNumber;
  });

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem("pulsotech_cart", JSON.stringify(items));
      localStorage.setItem("pulsotech_phone", whatsappNumber);
    } catch {
      // Ignorar error
    }
  }, [items, whatsappNumber]);

  const addItem = (product: Product, color: ProductColor, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor.name === color.name
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, { product, selectedColor: color, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, colorName: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedColor.name === colorName)
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
        item.product.id === productId && item.selectedColor.name === colorName
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= STORE_SETTINGS.freeShippingThreshold || subtotal === 0 ? 0 : STORE_SETTINGS.shippingCost;
  const total = subtotal + shipping;
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, STORE_SETTINGS.freeShippingThreshold - subtotal);

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
        shipping,
        total,
        itemsCount,
        freeShippingRemaining,
        whatsappNumber,
        setWhatsappNumber,
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
