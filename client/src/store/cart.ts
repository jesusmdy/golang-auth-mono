import { Product } from '@/api/products';
import { create } from 'zustand';

export interface CartProduct extends Product {
  // itemId: string;
}

interface CartStore {
  items: CartProduct[];
  setItems: (items: CartProduct[]) => void;
  addItem: (product: CartProduct) => void;
  removeItem: (product: CartProduct) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (product) => set((state) => ({ items: [...state.items, product] })),
  removeItem: (product) => set((state) => ({ items: state.items.filter((item) => item.ID !== product.ID) })),
  clearCart: () => set({ items: [] }),
}));

export const useCartItems = () => useCartStore((state) => state.items);
export const useSetCartItems = () => useCartStore((state) => state.setItems);
export const useAddItem = () => useCartStore((state) => state.addItem);
export const useRemoveItem = () => useCartStore((state) => state.removeItem);
export const useClearCart = () => useCartStore((state) => state.clearCart);
