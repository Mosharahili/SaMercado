import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@app-types/models';

export type LocalCartItem = {
  id: string;
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: LocalCartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  subtotal: number;
};

const CART_KEY = 'saudi_mercado_cart';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem(CART_KEY);
      if (data) setItems(JSON.parse(data));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { id: `${Date.now()}-${product.id}`, product, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeItem, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
