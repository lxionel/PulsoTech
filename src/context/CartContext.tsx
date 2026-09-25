"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductColor, CartItem } from "@/types";
import { STORE_SETTINGS } from "@/data/products";
import { getAssetUrl } from "@/utils/paths";

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
    } catch {
      // Ignorar error de almacenamiento
    }
  }, [items, favorites, whatsappNumber, isLoaded]);

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

  const clearCart = () => setItems([]);

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

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= STORE_SETTINGS.freeShippingThreshold || subtotal === 0 ? 0 : STORE_SETTINGS.shippingCost;
  const total = subtotal + shipping;
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
