import { create } from "zustand";

export interface CartItem {
  menuItemId: number;
  nameFr: string;
  price: number;
  quantity: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItemId === item.menuItemId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (menuItemId) =>
    set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),
  updateQuantity: (menuItemId, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
    })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));