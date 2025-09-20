'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import CartItem from '@/components/CartItem'
import CartSummary from '@/components/CartSummary'
import EmptyCart from '@/components/EmptyCart'

export default function CartPage() {
	const { items, fetchCart, isLoading, error } = useCartStore()

	// Fetch cart from backend on page load
	useEffect(() => {
		fetchCart()
	}, [fetchCart])

	if (isLoading && items.length === 0) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="flex items-center justify-center py-16">
					<div className="text-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-light-300 border-t-dark-900 mx-auto mb-4"></div>
						<p className="text-body text-dark-700">Loading your cart...</p>
					</div>
				</div>
			</main>
		)
	}

	if (error) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="flex items-center justify-center py-16">
					<div className="text-center">
						<p className="text-body text-red-600 mb-4">{error}</p>
						<button
							onClick={() => fetchCart()}
							className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
						>
							Try Again
						</button>
					</div>
				</div>
			</main>
		)
	}

	if (items.length === 0) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<EmptyCart />
			</main>
		)
	}

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-heading-2 text-dark-900">Shopping Cart</h1>
				<p className="mt-2 text-body text-dark-700">
					{items.length} {items.length === 1 ? 'item' : 'items'} in your cart
				</p>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
				{/* Cart Items */}
				<div className="space-y-6">
					{items.map((item) => (
						<CartItem key={item.id} item={item} />
					))}
				</div>

				{/* Order Summary */}
				<div className="lg:sticky lg:top-8">
					<CartSummary />
				</div>
			</div>
		</main>
	)
}
