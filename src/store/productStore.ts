"use client";

import { create } from "zustand";
import { Product } from "@/types/product";

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  // Product management (Admin only)
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch products");
      }
      const products: Product[] = await response.json();
      set({ products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
      throw error;
    }
  },

  addProduct: async (product: Omit<Product, "id">) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create product");
      }

      const newProduct: Product = await response.json();
      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false,
      }));
      return newProduct;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
      throw error;
    }
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update product");
      }

      const updatedProduct: Product = await response.json();
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        isLoading: false,
      }));
      return updatedProduct;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete product");
      }

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
      throw error;
    }
  },
}));
