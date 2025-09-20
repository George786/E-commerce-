'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function HeaderCartButton() {
    const { items } = useCartStore()
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <Link href="/cart" className="relative flex items-center gap-1">
            <ShoppingBag className="h-6 w-6" />
            {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 text-xs text-white">
          {totalQuantity}
        </span>
            )}
        </Link>
    )
}
