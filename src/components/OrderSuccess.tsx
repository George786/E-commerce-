'use client'

import { CheckCircle, Package, Mail } from 'lucide-react'
import type { Order } from '@/lib/actions/orders'

interface OrderSuccessProps {
	order: Order
	className?: string
}

export default function OrderSuccess({ order, className = '' }: OrderSuccessProps) {
	const formatPrice = (priceInCents: number) => {
		return `$${(priceInCents / 100).toFixed(2)}`
	}

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(date))
	}

	return (
		<div className={`mx-auto max-w-4xl ${className}`}>
			{/* Success Header */}
			<div className="text-center mb-8">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
					<CheckCircle className="h-8 w-8 text-green-600" />
				</div>
				<h1 className="text-heading-2 text-dark-900 mb-2">
					Order Confirmed!
				</h1>
				<p className="text-body text-dark-700">
					Thank you for your purchase. Your order has been successfully placed.
				</p>
			</div>

			{/* Order Details */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Order Information */}
				<div className="rounded-lg border border-light-300 bg-light-100 p-6">
					<h2 className="text-heading-3 text-dark-900 mb-4 flex items-center gap-2">
						<Package className="h-5 w-5" />
						Order Details
					</h2>
					
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-body text-dark-700">Order Number</span>
							<span className="text-body-medium text-dark-900">#{order.id.slice(-8).toUpperCase()}</span>
						</div>
						
						<div className="flex justify-between">
							<span className="text-body text-dark-700">Order Date</span>
							<span className="text-body-medium text-dark-900">{formatDate(order.createdAt)}</span>
						</div>
						
						<div className="flex justify-between">
							<span className="text-body text-dark-700">Status</span>
							<span className={`text-body-medium font-medium ${
								order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
							}`}>
								{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
							</span>
						</div>
						
						<div className="flex justify-between">
							<span className="text-body text-dark-700">Total Amount</span>
							<span className="text-body-medium text-dark-900">{formatPrice(order.totalAmount)}</span>
						</div>
					</div>
				</div>

				{/* Customer Information */}
				<div className="rounded-lg border border-light-300 bg-light-100 p-6">
					<h2 className="text-heading-3 text-dark-900 mb-4 flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Customer Information
					</h2>
					
					<div className="space-y-3">
						{order.customerEmail && (
							<div className="flex justify-between">
								<span className="text-body text-dark-700">Email</span>
								<span className="text-body-medium text-dark-900">{order.customerEmail}</span>
							</div>
						)}
						
						{order.shippingAddress && (
							<div>
								<span className="text-body text-dark-700 block mb-1">Shipping Address</span>
								<div className="text-body-medium text-dark-900">
									{order.shippingAddress.name && <div>{order.shippingAddress.name}</div>}
									{order.shippingAddress.address && (
										<div>
											{order.shippingAddress.address.line1 && <div>{order.shippingAddress.address.line1}</div>}
											{order.shippingAddress.address.line2 && <div>{order.shippingAddress.address.line2}</div>}
											<div>
												{order.shippingAddress.address.city}, {order.shippingAddress.address.state} {order.shippingAddress.address.postal_code}
											</div>
											<div>{order.shippingAddress.address.country}</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Order Items */}
			<div className="mt-6 rounded-lg border border-light-300 bg-light-100 p-6">
				<h2 className="text-heading-3 text-dark-900 mb-4 flex items-center gap-2">
					<Package className="h-5 w-5" />
					Order Items
				</h2>
				
				<div className="space-y-4">
					{order.items.map((item) => (
						<div key={item.id} className="flex items-center gap-4 rounded-lg border border-light-300 p-4">
							<div className="flex-1">
								<h3 className="text-body-medium text-dark-900">
									{item.variant.product.name}
								</h3>
								<div className="mt-1 flex gap-2 text-caption text-dark-700">
									{item.variant.color && (
										<span>Color: {item.variant.color.name}</span>
									)}
									{item.variant.size && (
										<span>Size: {item.variant.size.name}</span>
									)}
								</div>
							</div>
							
							<div className="text-right">
								<div className="text-body-medium text-dark-900">
									{formatPrice(item.price)} × {item.quantity}
								</div>
								<div className="text-body text-dark-700">
									{formatPrice(item.price * item.quantity)}
								</div>
							</div>
						</div>
					))}
				</div>
				
				<div className="mt-4 border-t border-light-300 pt-4">
					<div className="flex justify-between text-body-medium text-dark-900">
						<span>Total</span>
						<span>{formatPrice(order.totalAmount)}</span>
					</div>
				</div>
			</div>

			{/* Next Steps */}
			<div className="mt-6 rounded-lg bg-blue-50 p-6">
				<h3 className="text-body-medium text-blue-900 mb-2">What&apos;s Next?</h3>
				<ul className="space-y-1 text-caption text-blue-800">
					<li>• You will receive an email confirmation shortly</li>
					<li>• Your order will be processed within 1-2 business days</li>
					<li>• You will receive tracking information once your order ships</li>
					<li>• Expected delivery: 3-5 business days</li>
				</ul>
			</div>

			{/* Action Buttons */}
			<div className="mt-6 flex flex-col gap-3 sm:flex-row">
				<button
					onClick={() => window.location.href = '/products'}
					className="flex-1 rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
				>
					Continue Shopping
				</button>
				
				<button
					onClick={() => window.print()}
					className="flex-1 rounded-full border border-light-300 px-6 py-3 text-body text-dark-700 transition hover:border-dark-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
				>
					Print Receipt
				</button>
			</div>
		</div>
	)
}
