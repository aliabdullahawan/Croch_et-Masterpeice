"use client";
/**
 * context/CartContext.tsx
 * ─────────────────────────────────────────────────────
 * Client-side cart state stored in localStorage.
 *
 * TO SYNC WITH SUPABASE:
 *   - On login: merge localStorage cart with supabase.from('cart_items').select()
 *   - On add/remove: also call supabase.from('cart_items').upsert/delete()
 *   - On logout: clear localStorage cart
 *
 * SUPABASE QUERY REFERENCE:
 *   // Add item:
 *   await supabase.from("cart_items").upsert({
 *     user_id: userId, product_id: productId, quantity: qty
 *   });
 *   // Remove item:
 *   await supabase.from("cart_items").delete()
 *     .eq("user_id", userId).eq("product_id", productId);
 *   // Get all cart items with product details:
 *   const { data } = await supabase.from("cart_items")
 *     .select("*, product:products(*)").eq("user_id", userId);
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product, LocalCartItem } from "@/lib/types";

interface CartContextType {
  items:        LocalCartItem[];
  totalItems:   number;
  totalPrice:   number;
  addItem:      (product: Product, quantity?: number, note?: string) => void;
  removeItem:   (productId: string) => void;
  updateQty:    (productId: string, quantity: number) => void;
  clearCart:    () => void;
  isInCart:     (productId: string) => boolean;
}

const CartContext = createContext<CartContextType>({
  items:       [],
  totalItems:  0,
  totalPrice:  0,
  addItem:     () => {},
  removeItem:  () => {},
  updateQty:   () => {},
  clearCart:   () => {},
  isInCart:    () => false,
});

const STORAGE_KEY = "cm_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1, note?: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, note }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems(prev => prev.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const isInCart  = useCallback((id: string) => items.some(i => i.product.id === id), [items]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + (i.product.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addItem, removeItem, updateQty, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
