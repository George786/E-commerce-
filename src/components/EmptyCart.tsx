'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function EmptyCart() {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-light-200">
				<ShoppingBag className="h-12 w-12 text-dark-500" />
			</div>
			
			<h2 className="mb-2 text-heading-3 text-dark-900">Your cart is empty</h2>
			<p className="mb-8 text-body text-dark-700 max-w-md">
				Looks like you haven&apos;t added any items to your cart yet. Start shopping to fill it up!
			</p>
			
			<Link
				href="/products"
				className="inline-flex items-center justify-center rounded-full bg-dark-900 px-8 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
			>
				Start Shopping
			</Link>
		</div>
	)
}
