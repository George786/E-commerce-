'use client'

import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'

interface AddToCartButtonProps {
	productId: string
	variantId: string
	quantity?: number
	title: string
	price: number
	imageUrl?: string
	color?: string
	size?: string
	disabled?: boolean
}

export default function AddToCartButton({
	productId,
	variantId,
	quantity = 1,
	title,
	price,
	imageUrl,
	color,
	size,
	disabled = false,
}: AddToCartButtonProps) {
	const { addItem, isLoading } = useCartStore()

	const handleAdd = () => {
		addItem({
			productId,
			productVariantId: variantId,
			title,
			price,
			imageUrl,
			color,
			size,
			quantity,
		})
	}

	return (
		<button
			onClick={handleAdd}
			disabled={isLoading || disabled}
			className="flex items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<ShoppingBag className="h-5 w-5" />
			{isLoading ? 'Adding...' : disabled ? 'Select Size & Color' : 'Add to Bag'}
		</button>
	)
}
