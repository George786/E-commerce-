import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    addItem: (item: Omit<CartItem, "quantity">, cartId?: string) => Promise<void>;
    removeItem: (productId: string, cartId?: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number, cartId?: string) => Promise<void>;
    clearCart: (cartId?: string) => Promise<void>;
    getItemCount: () => number;
    fetchCart: (cartId?: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            total: 0,

            // ✅ Sync with API when adding item
            addItem: async (item, cartId) => {
                try {
                    await fetch("/api/cart", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productVariantId: item.productId, quantity: 1, cartId }),
                    });
                } catch (err) {
                    console.error("API addItem failed, falling back to local", err);
                }

                const items = get().items;
                const existingItem = items.find((i) => i.productId === item.productId);

                if (existingItem) {
                    set({
                        items: items.map((i) =>
                            i.productId === item.productId
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        ),
                    });
                } else {
                    set({
                        items: [...items, { ...item, quantity: 1 }],
                    });
                }

                const newItems = get().items;
                const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                set({ total });
            },

            removeItem: async (id, cartId) => {
                try {
                    await fetch(`/api/cart?id=${id}&cartId=${cartId}`, { method: "DELETE" });
                } catch (err) {
                    console.error("API removeItem failed", err);
                }

                const items = get().items.filter((item) => item.productId !== id);
                const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                set({ items, total });
            },

            updateQuantity: async (id, quantity, cartId) => {
                if (quantity <= 0) {
                    get().removeItem(id, cartId);
                    return;
                }

                try {
                    await fetch("/api/cart", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id, quantity, cartId }),
                    });
                } catch (err) {
                    console.error("API updateQuantity failed", err);
                }

                const items = get().items.map((item) =>
                    item.productId === id ? { ...item, quantity } : item
                );
                const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                set({ items, total });
            },

            clearCart: async (cartId) => {
                try {
                    await fetch(`/api/cart?action=clear&cartId=${cartId}`, { method: "DELETE" });
                } catch (err) {
                    console.error("API clearCart failed", err);
                }
                set({ items: [], total: 0 });
            },

            getItemCount: () =>
                get().items.reduce((sum, item) => sum + item.quantity, 0),

            fetchCart: async (cartId) => {
                try {
                    const url = cartId ? `/api/cart?cartId=${cartId}` : "/api/cart";
                    const res = await fetch(url);
                    const data = await res.json();

                    if (data.success) {
                        const items = data.cart?.items || [];
                        const total = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
                        set({ items, total });
                    }
                } catch (err) {
                    console.error("Failed to fetch cart", err);
                }
            },
        }),
        { name: "cart-storage" }
    )
);
