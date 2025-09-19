'use client';

import { create } from 'zustand';

// Cart item type
export type CartItem = {
    productId: string;
    productVariantId: string;
    quantity: number;
    title: string;   // use title consistently
    price: number;
};

// Cart store type
type CartState = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (variantId: string) => void;
    clear: () => void;
};

// Zustand cart store
export const useCartStore = create<CartState>((set) => ({
    items: [],
    addItem: (item) =>
        set((state) => {
            // Check if item with same variant exists
            const existing = state.items.find(
                (i) => i.productVariantId === item.productVariantId
            );
            if (existing) {
                // Increase quantity
                return {
                    items: state.items.map((i) =>
                        i.productVariantId === item.productVariantId
                            ? { ...i, quantity: i.quantity + item.quantity }
                            : i
                    ),
                };
            }
            // Add new item
            return { items: [...state.items, item] };
        }),
    removeItem: (variantId) =>
        set((state) => ({
            items: state.items.filter((i) => i.productVariantId !== variantId),
        })),
    clear: () => set({ items: [] }),
}));
