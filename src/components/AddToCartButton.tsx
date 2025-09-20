interface AddToCartButtonProps {
}

export default function AddToCartButton({
	productId,
	variantId,
	quantity = 1,
	title,
	price,
}: AddToCartButtonProps) {

	const handleAdd = () => {
		addItem({
			productId,
			productVariantId: variantId,
			price,

	return (
		<button
			onClick={handleAdd}
		>
			<ShoppingBag className="h-5 w-5" />
		</button>
}
