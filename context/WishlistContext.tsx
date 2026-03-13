"use client";
/**
 * context/WishlistContext.tsx
 * ─────────────────────────────────────────────────────
 * Wishlist stored in localStorage (no login required).
 *
 * TO SYNC WITH SUPABASE (logged-in users only):
 *   import { supabase } from "@/lib/supabase";
 *
 *   // On login: load user wishlist
 *   const { data } = await supabase.from("wishlists")
 *     .select("*, product:products(*)").eq("user_id", userId);
 *
 *   // Add to wishlist:
 *   await supabase.from("wishlists")
 *     .insert({ user_id: userId, product_id: productId });
 *
 *   // Remove from wishlist:
 *   await supabase.from("wishlists").delete()
 *     .eq("user_id", userId).eq("product_id", productId);
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "@/lib/types";

interface WishlistContextType {
  items:       Product[];
  addItem:     (product: Product) => void;
  removeItem:  (productId: string) => void;
  toggle:      (product: Product) => void;
  isInList:    (productId: string) => boolean;
  count:       number;
}

const WishlistContext = createContext<WishlistContextType>({
  items:      [],
  addItem:    () => {},
  removeItem: () => {},
  toggle:     () => {},
  isInList:   () => false,
  count:      0,
});

const STORAGE_KEY = "cm_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem    = useCallback((p: Product) => setItems(prev => prev.find(x => x.id === p.id) ? prev : [...prev, p]), []);
  const removeItem = useCallback((id: string) => setItems(prev => prev.filter(p => p.id !== id)), []);
  const isInList   = useCallback((id: string) => items.some(p => p.id === id), [items]);
  const toggle     = useCallback((p: Product) => isInList(p.id) ? removeItem(p.id) : addItem(p), [isInList, removeItem, addItem]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggle, isInList, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
