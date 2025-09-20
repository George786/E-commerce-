'use client'

import { useState, useEffect } from 'react'
import AddToCartButton from './AddToCartButton'
import FavoriteButton from './FavoriteButton'

interface Variant {
	id: string
	productId: string
	price: string
	salePrice?: string | null
	colorId: string
	sizeId: string
	color?: { name: string } | null
	size?: { name: string } | null
}

interface ProductSelectionProps {
	productId: string
	productName: string
	variants: Variant[]
	defaultPrice: number
}

export default function ProductSelection({
	productId,
	productName,
	variants,
	defaultPrice
}: ProductSelectionProps) {
	const [selectedColor, setSelectedColor] = useState<string | null>(null)
	const [selectedSize, setSelectedSize] = useState<string | null>(null)
	const [availableSizes, setAvailableSizes] = useState<string[]>([])
	const [availableColors, setAvailableColors] = useState<string[]>([])

	// Get unique colors and sizes from variants
	useEffect(() => {
		const colors = [...new Set(variants.map(v => v.color?.name).filter(Boolean))]
		const sizes = [...new Set(variants.map(v => v.size?.name).filter(Boolean))]
		setAvailableColors(colors as string[])
		setAvailableSizes(sizes as string[])
	}, [variants])

	// Update available sizes when color changes
	useEffect(() => {
		if (selectedColor) {
			const sizesForColor = variants
				.filter(v => v.color?.name === selectedColor)
				.map(v => v.size?.name)
				.filter(Boolean)
			setAvailableSizes([...new Set(sizesForColor)] as string[])
			
			// Reset size if it's not available for selected color
			if (selectedSize && !sizesForColor.includes(selectedSize)) {
				setSelectedSize(null)
			}
		} else {
			// Show all sizes when no color is selected
			const allSizes = [...new Set(variants.map(v => v.size?.name).filter(Boolean))]
			setAvailableSizes(allSizes as string[])
		}
	}, [selectedColor, variants, selectedSize])

	// Find the selected variant
	const selectedVariant = variants.find(
		v => v.color?.name === selectedColor && v.size?.name === selectedSize
	)

	const displayPrice = selectedVariant 
		? Number(selectedVariant.salePrice || selectedVariant.price)
		: defaultPrice

	const isSelectionComplete = selectedColor && selectedSize && selectedVariant

	return (
		<div className="space-y-6">
			{/* Color Selection */}
			{availableColors.length > 0 && (
				<div className="flex flex-col gap-3">
					<p className="text-body-medium text-dark-900">Select Color</p>
					<div className="flex flex-wrap gap-2">
						{availableColors.map((color) => (
							<button
								key={color}
								onClick={() => setSelectedColor(color)}
								className={`rounded-lg border px-4 py-2 text-body transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${
									selectedColor === color
										? 'border-dark-900 text-dark-900'
										: 'border-light-300 text-dark-700 hover:border-dark-500'
								}`}
							>
								{color}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Size Selection */}
			{availableSizes.length > 0 && (
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<p className="text-body-medium text-dark-900">Select Size</p>
						<button className="text-caption text-dark-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]">
							Size Guide
						</button>
					</div>
					<div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
						{availableSizes.map((size) => (
							<button
								key={size}
								onClick={() => setSelectedSize(size)}
								disabled={!selectedColor}
								className={`rounded-lg border px-3 py-3 text-center text-body transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${
									selectedSize === size
										? 'border-dark-900 text-dark-900'
										: 'border-light-300 text-dark-700 hover:border-dark-500'
								} ${!selectedColor ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								{size}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Add to Cart Button */}
			<div className="flex flex-col gap-3">
				<AddToCartButton
					productId={productId}
					variantId={selectedVariant?.id || ''}
					title={productName}
					price={displayPrice}
					imageUrl={undefined}
					color={selectedColor || undefined}
					size={selectedSize || undefined}
					disabled={!isSelectionComplete}
				/>

				<FavoriteButton
					productId={productId}
					productName={productName}
					showText={true}
					size="md"
					className="w-full"
				/>
			</div>

		</div>
	)
}
