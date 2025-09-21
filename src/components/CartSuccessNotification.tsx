'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ShoppingBag, CreditCard } from 'lucide-react'

interface CartSuccessNotificationProps {
	show: boolean
	onClose: () => void
	productName: string
}

export default function CartSuccessNotification({ 
	show, 
	onClose, 
	productName 
}: CartSuccessNotificationProps) {
	useEffect(() => {
		if (show) {
			const timer = setTimeout(() => {
				onClose()
			}, 5000) // Auto-close after 5 seconds
			
			return () => clearTimeout(timer)
		}
	}, [show, onClose])

	if (!show) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-2xl">
				<div className="flex items-center gap-3 mb-4">
					<CheckCircle className="h-6 w-6 text-green-500" />
					<h3 className="text-lg font-semibold text-dark-900">
						Added to Cart!
					</h3>
				</div>
				
				<p className="text-body text-dark-700 mb-6">
					<strong>{productName}</strong> has been added to your cart.
				</p>
				
				<div className="flex flex-col gap-3">
					<Link
						href="/cart"
						className="flex items-center justify-center gap-2 rounded-lg bg-dark-900 px-4 py-3 text-body-medium text-white transition hover:opacity-90"
						onClick={onClose}
					>
						<ShoppingBag className="h-5 w-5" />
						View Cart
					</Link>
					
					<Link
						href="/checkout"
						className="flex items-center justify-center gap-2 rounded-lg border border-dark-900 px-4 py-3 text-body-medium text-dark-900 transition hover:bg-dark-900 hover:text-white"
						onClick={onClose}
					>
						<CreditCard className="h-5 w-5" />
						Checkout Now
					</Link>
					
					<button
						onClick={onClose}
						className="text-body text-dark-600 hover:text-dark-900 transition"
					>
						Continue Shopping
					</button>
				</div>
			</div>
		</div>
	)
}
