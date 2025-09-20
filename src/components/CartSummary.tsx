'use client'

import { useCartStore } from '@/store/cart.store'
import { getCurrentUser } from '@/lib/auth/actions'
import { useEffect, useState } from 'react'
import { redirectToCheckout } from '@/lib/actions/checkout'
import { CreditCard, Loader2 } from 'lucide-react'

interface CartSummaryProps {
	className?: string
}

export default function CartSummary({ className = '' }: CartSummaryProps) {
	const { items, clear, isLoading } = useCartStore()
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

	useEffect(() => {
		// Check if user is authenticated
		const checkAuth = async () => {
			try {
				const user = await getCurrentUser()
				setIsAuthenticated(!!user)
			} catch {
				setIsAuthenticated(false)
			}
		}
		checkAuth()
	}, [])

	const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
	const shipping = subtotal > 100 ? 0 : 9.99 // Free shipping over $100
	const tax = subtotal * 0.08 // 8% tax
	const total = subtotal + shipping + tax

	const handleCheckout = async () => {
		if (items.length === 0) {
			alert('Your cart is empty')
			return
		}

		// Check if user is authenticated
		if (!isAuthenticated) {
			alert('Please sign in to proceed with checkout')
			window.location.href = '/sign-in?redirect=' + encodeURIComponent('/cart')
			return
		}

		setIsCheckoutLoading(true)
		
		try {
			// Redirect to Stripe checkout
			await redirectToCheckout()
		} catch (error) {
			console.error('Checkout error:', error)
			alert('Failed to start checkout. Please try again.')
		} finally {
			setIsCheckoutLoading(false)
		}
	}

	const handleClearCart = () => {
		if (confirm('Are you sure you want to clear your cart?')) {
			clear()
		}
	}

	if (items.length === 0) {
		return null
	}

	return (
		<div className={`rounded-lg border border-light-300 bg-light-100 p-6 ${className}`}>
			<h2 className="mb-4 text-heading-3 text-dark-900">Order Summary</h2>
			
			<div className="space-y-3">
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

			<div className="mt-6 space-y-3">
				<button
					onClick={handleCheckout}
					disabled={isLoading || isCheckoutLoading}
					className="w-full rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isCheckoutLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Processing...
						</>
					) : (
						<>
							<CreditCard className="mr-2 h-4 w-4" />
							Proceed to Checkout
						</>
					)}
				</button>
				
				<button
					onClick={handleClearCart}
					disabled={isLoading}
					className="w-full rounded-full border border-light-300 px-6 py-3 text-body text-dark-700 transition hover:border-red-500 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Clear Cart
				</button>
			</div>

			<div className="mt-4 rounded-lg bg-blue-50 p-4">
				<p className="text-caption text-blue-800">
					{isAuthenticated 
						? 'Secure checkout powered by Stripe. Your payment information is encrypted and secure.'
						: 'Please sign in to proceed with checkout. Create an account to save your cart and get free shipping on orders over $100.'
					}
				</p>
			</div>
		</div>
	)
}
