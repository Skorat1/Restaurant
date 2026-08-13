"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface CartAddon {
  name: string;
  price: number;
}

export interface CartOption {
  group: string;
  value: string;
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  addons?: CartAddon[];
  options?: CartOption[];
  lineTotal?: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  count: 0,
  subtotal: 0,
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
});

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "restaurant_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const restoreCart = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch {
        // ignore corrupt storage
      }
    };
    restoreCart();
  }, []);

  // Persist cart whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be unavailable
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty: number = 1) => {
    setItems((prev) => {
      const addonKey = (item.addons || []).map((a) => `${a.name}:${a.price}`).join("|");
      const optionKey = (item.options || []).map((o) => `${o.group}:${o.value}`).join("|");
      const signature = `${item.itemId}__${addonKey}__${optionKey}`;

      const idx = prev.findIndex((i) => {
        const ia = (i.addons || []).map((a) => `${a.name}:${a.price}`).join("|");
        const io = (i.options || []).map((o) => `${o.group}:${o.value}`).join("|");
        const isig = `${i.itemId}__${ia}__${io}`;
        return isig === signature;
      });

      const addonTotal = (item.addons || []).reduce((s, a) => s + a.price, 0);
      const newLineTotal = (item.price + addonTotal) * qty;

      if (idx >= 0) {
        return prev.map((i, index) => {
          if (index !== idx) return i;
          const curAddonTotal = (i.addons || []).reduce((s, a) => s + a.price, 0);
          const curLine = (i.lineTotal ?? (i.price + curAddonTotal) * i.quantity);
          return { ...i, quantity: i.quantity + qty, lineTotal: curLine + newLineTotal };
        });
      }
      return [...prev, { ...item, quantity: qty, lineTotal: newLineTotal } as CartItem];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
  }, []);

  const updateQty = useCallback((itemId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.itemId !== itemId)
        : prev.map((i) => {
            if (i.itemId !== itemId) return i;
            const addonTotal = (i.addons || []).reduce((s, a) => s + a.price, 0);
            return { ...i, quantity: qty, lineTotal: (i.price + addonTotal) * qty };
          })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
