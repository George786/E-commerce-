'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import type { CartItem } from '@/store/cart.store'

interface CartItemProps {
	item: CartItem
}

export default function CartItem({ item }: CartItemProps) {
	const { updateItem, removeItem, isLoading } = useCartStore()

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity < 1) return
		updateItem(item.id, newQuantity)
	}

	const handleRemove = () => {
		removeItem(item.id)
	}

	const formatPrice = (price: number) => `$${price.toFixed(2)}`

	return (
		<div className="flex items-center gap-4 border-b border-light-300 py-6">
			{/* Product Image */}
			<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-light-200">
				{item.imageUrl ? (
					<Image
						src={item.imageUrl}
						alt={item.title}
						fill
						className="object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-caption text-dark-500">
						No Image
					</div>
				)}
			</div>

			{/* Product Details */}
			<div className="flex-1 min-w-0">
				<h3 className="text-body-medium text-dark-900 truncate">
					{item.title}
				</h3>
				{item.color && (
					<p className="text-caption text-dark-700">Color: {item.color}</p>
				)}
				{item.size && (
					<p className="text-caption text-dark-700">Size: {item.size}</p>
				)}
				<p className="text-body text-dark-900 font-medium">
					{formatPrice(item.price)}
				</p>
			</div>

			{/* Quantity Controls */}
			<div className="flex items-center gap-2">
				<button
					onClick={() => handleQuantityChange(item.quantity - 1)}
					disabled={isLoading || item.quantity <= 1}
					className="flex h-8 w-8 items-center justify-center rounded-full border border-light-300 text-dark-700 transition hover:border-dark-500 hover:text-dark-900 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Minus className="h-4 w-4" />
				</button>
				
				<span className="min-w-[2rem] text-center text-body-medium text-dark-900">
					{item.quantity}
				</span>
				
				<button
					onClick={() => handleQuantityChange(item.quantity + 1)}
					disabled={isLoading}
					className="flex h-8 w-8 items-center justify-center rounded-full border border-light-300 text-dark-700 transition hover:border-dark-500 hover:text-dark-900 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

			{/* Total Price */}
			<div className="text-right">
				<p className="text-body-medium text-dark-900 font-medium">
					{formatPrice(item.price * item.quantity)}
				</p>
			</div>

			{/* Remove Button */}
			<button
				onClick={handleRemove}
				disabled={isLoading}
				className="flex h-8 w-8 items-center justify-center rounded-full text-dark-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
				title="Remove item"
			>
				<Trash2 className="h-4 w-4" />
			</button>
		</div>
	)
}
