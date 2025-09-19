import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }

        // Update total
        const newItems = get().items;
        const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ total });
      },
      removeItem: (id) => {
        const items = get().items.filter((item) => item.productId!== id);
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items, total });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const items = get().items.map((item) =>
          item.productId=== id ? { ...item, quantity } : item
        );
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items, total });
      },
      clearCart: () => set({ items: [], total: 0 }),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);