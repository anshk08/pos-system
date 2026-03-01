"use client";

import { Product } from "@/types/product";
import { create } from "zustand";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isSyncing: boolean;
  loadCart: () => Promise<void>;
  syncCart: (items: CartItem[]) => Promise<void>;
  clearLocalCart: () => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isSyncing: false,

  loadCart: async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) return;
      const items: CartItem[] = await response.json();
      set({ items });
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  },

  syncCart: async (items: CartItem[]) => {
    set({ isSyncing: true });
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
    } catch (error) {
      console.error("Failed to sync cart:", error);
    } finally {
      set({ isSyncing: false });
    }
  },

  clearLocalCart: () => set({ items: [] }),

  addToCart: (product: Product, quantity: number) => {
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id);
      const items = existing
        ? state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...state.items, { ...product, quantity }];

      get().syncCart(items);
      return { items };
    });
  },

  removeFromCart: (productId: string) => {
    set((state) => {
      const items = state.items.filter((item) => item.id !== productId);
      get().syncCart(items);
      return { items };
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      const items =
        quantity <= 0
          ? state.items.filter((item) => item.id !== productId)
          : state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item,
            );

      get().syncCart(items);
      return { items };
    });
  },

  clearCart: () => {
    get().syncCart([]);
    set({ items: [] });
  },

  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getTax: () => parseFloat((get().getSubtotal() * 0.1).toFixed(2)),

  getTotal: () => parseFloat((get().getSubtotal() + get().getTax()).toFixed(2)),

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
