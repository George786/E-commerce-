'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'
import { getCurrentUser } from '@/lib/auth/actions'

export default function CheckoutPage() {
	const { items, fetchCart } = useCartStore()
	const router = useRouter()
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const user = await getCurrentUser()
				if (!user) {
					router.push('/sign-in?redirect=/checkout')
					return
				}
				setIsAuthenticated(true)
				await fetchCart()
			} catch {
				router.push('/sign-in?redirect=/checkout')
			} finally {
				setIsLoading(false)
			}
		}
		checkAuth()
	}, [router, fetchCart])

	if (isLoading) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="flex items-center justify-center py-16">
					<div className="text-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-light-300 border-t-dark-900 mx-auto mb-4"></div>
						<p className="text-body text-dark-700">Loading checkout...</p>
					</div>
				</div>
			</main>
		)
	}

	if (!isAuthenticated) {
		return null
	}

	if (items.length === 0) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="text-center py-16">
					<h1 className="text-heading-2 text-dark-900 mb-4">Your cart is empty</h1>
					<p className="text-body text-dark-700 mb-8">
						Add some items to your cart before proceeding to checkout.
					</p>
					<button
						onClick={() => router.push('/products')}
						className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
					>
						Continue Shopping
					</button>
				</div>
			</main>
		)
	}

	const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
	const shipping = subtotal > 100 ? 0 : 9.99
	const tax = subtotal * 0.08
	const total = subtotal + shipping + tax

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-heading-2 text-dark-900">Checkout</h1>
				<p className="mt-2 text-body text-dark-700">
					Complete your order
				</p>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
				{/* Checkout Form */}
				<div className="space-y-6">
					<div className="rounded-lg border border-light-300 bg-light-100 p-6">
						<h2 className="mb-4 text-heading-3 text-dark-900">Shipping Information</h2>
						<p className="text-body text-dark-700">
							This is a demo checkout page. In a real application, you would implement:
						</p>
						<ul className="mt-4 space-y-2 text-body text-dark-700">
							<li>• Shipping address form</li>
							<li>• Payment method selection</li>
							<li>• Order review</li>
							<li>• Payment processing</li>
							<li>• Order confirmation</li>
						</ul>
					</div>
				</div>

				{/* Order Summary */}
				<div className="lg:sticky lg:top-8">
					<div className="rounded-lg border border-light-300 bg-light-100 p-6">
						<h2 className="mb-4 text-heading-3 text-dark-900">Order Summary</h2>
						
						<div className="space-y-3">
							{items.map((item) => (
								<div key={item.id} className="flex justify-between text-body text-dark-700">
									<span className="truncate">{item.title} × {item.quantity}</span>
									<span>${(item.price * item.quantity).toFixed(2)}</span>
								</div>
							))}
						</div>

						<div className="mt-4 space-y-3 border-t border-light-300 pt-4">
							<div className="flex justify-between text-body text-dark-700">
								<span>Subtotal</span>
								<span>${subtotal.toFixed(2)}</span>
							</div>
							
							<div className="flex justify-between text-body text-dark-700">
								<span>Shipping</span>
								<span>
									{shipping === 0 ? (
										<span className="text-green">Free</span>
									) : (
										`$${shipping.toFixed(2)}`
									)}
								</span>
							</div>
							
							<div className="flex justify-between text-body text-dark-700">
								<span>Tax</span>
								<span>${tax.toFixed(2)}</span>
							</div>
							
							<div className="border-t border-light-300 pt-3">
								<div className="flex justify-between text-body-medium text-dark-900">
									<span>Total</span>
									<span>${total.toFixed(2)}</span>
								</div>
							</div>
						</div>

						<button
							disabled
							className="mt-6 w-full rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 opacity-50 cursor-not-allowed"
						>
							Place Order (Demo)
						</button>
					</div>
				</div>
			</div>
		</main>
	)
}
