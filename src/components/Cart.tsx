'use client'
import { useCartStore } from '@/store/cartStore'

export default function Cart() {
    const { items, removeItem, clear } = useCartStore()

    if (items.length === 0) {
        return <div className="p-6 text-center">Cart is empty</div>
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-bold">Your Cart</h1>
            <ul>
                {items.map((item) => (
                    <li key={item.productVariantId} className="flex justify-between border-b py-2">
                        <div>
                            <p>{item.name}</p>
                            <p className="text-sm">Qty: {item.quantity}</p>
                        </div>
                        <div>
                            <p>${item.price * item.quantity}</p>
                            <button
                                onClick={() => removeItem(item.productVariantId)}
                                className="text-red-500 text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-4 flex justify-between">
                <button onClick={clear} className="bg-red-500 text-white px-4 py-2 rounded">
                    Clear Cart
                </button>
                <p className="font-bold">
                    Total: $
                    {items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
                </p>
            </div>
        </div>
    )
}
