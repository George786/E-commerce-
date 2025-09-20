'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface CartItem {
    productId: string
    productVariantId: string
    title: string
    price: number
    quantity: number
}

interface CartState {
    items: CartItem[]
    setItems: (items: CartItem[]) => void
    addItem: (item: CartItem) => void
    removeItem: (productVariantId: string) => void
    updateItem: (productVariantId: string, quantity: number) => void
    clear: () => void
    fetchCart: () => Promise<void>
}

export const useCartStore = create<CartState>()(
    devtools((set, get) => ({
        items: [],
        setItems: (items) => set({ items }),

        fetchCart: async () => {
            try {
                const res = await fetch('/api/cart')
                const data = await res.json()
                if (data.success) set({ items: data.cart?.items ?? [] })
            } catch (err) {
                console.error('Failed to fetch cart', err)
            }
        },

        addItem: async (item) => {
            try {
                const res = await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productVariantId: item.productVariantId,
                        quantity: item.quantity,
                    }),
                })
                const data = await res.json()
                if (data.success) set({ items: data.cart?.items ?? get().items })
            } catch (err) {
                console.error('Failed to add item', err)
            }
        },

        removeItem: async (productVariantId) => {
            try {
                const res = await fetch(`/api/cart?id=${productVariantId}`, {
                    method: 'DELETE',
                })
                const data = await res.json()
                if (data.success) set({ items: data.cart?.items ?? get().items })
            } catch (err) {
                console.error('Failed to remove item', err)
            }
        },

        updateItem: async (productVariantId, quantity) => {
            try {
                const res = await fetch('/api/cart', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: productVariantId, quantity }),
                })
                const data = await res.json()
                if (data.success) set({ items: data.cart?.items ?? get().items })
            } catch (err) {
                console.error('Failed to update item', err)
            }
        },

        clear: async () => {
            try {
                const res = await fetch('/api/cart?action=clear', { method: 'DELETE' })
                const data = await res.json()
                if (data.success) set({ items: [] })
            } catch (err) {
                console.error('Failed to clear cart', err)
            }
        },
    }))
)
