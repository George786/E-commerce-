'use client'

import { useEffect } from 'react'
import { useCartStore, type CartItem } from '@/store/cartStore'

export default function CartPage() {
    const { items, fetchCart, updateItem, removeItem, clear } = useCartStore()

    // Fetch cart from backend on page load
    useEffect(() => {
        fetchCart()
    }, [fetchCart])

    if (items.length === 0) {
        return <div className="p-6 text-center">Your cart is empty.</div>
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    return (
        <div className="mx-auto max-w-4xl p-6">
            <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

            <ul className="space-y-4">
                {items.map((item: CartItem) => (
                    <li key={item.productVariantId} className="flex items-center justify-between border-b py-4">
                        <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-sm text-gray-600">Price: ${item.price}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateItem(item.productVariantId, Number(e.target.value))}
                                className="w-16 rounded border px-2 py-1"
                            />
                            <span className="w-20 text-right font-medium">${item.price * item.quantity}</span>
                            <button
                                onClick={() => removeItem(item.productVariantId)}
                                className="ml-4 rounded bg-red-500 px-3 py-1 text-white"
                            >
                                Remove
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={clear}
                    className="rounded bg-red-500 px-4 py-2 text-white"
                >
                    Clear Cart
                </button>

                <div className="text-right">
                    <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
                    <button
                        className="mt-2 rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    )
}
