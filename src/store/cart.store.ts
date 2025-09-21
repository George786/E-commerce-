'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface CartItem {
	id: string
	productId: string
	productVariantId: string
	title: string
	price: number
	quantity: number
	imageUrl?: string
	color?: string
	size?: string
}

interface CartState {
	items: CartItem[]
	isLoading: boolean
	error: string | null
	cartId: string | null
	guestSessionId: string | null
	
	// Actions
	fetchCart: () => Promise<void>
	addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => Promise<void>
	updateItem: (itemId: string, quantity: number) => Promise<void>
	removeItem: (itemId: string) => Promise<void>
	clear: () => Promise<void>
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
}

export const useCartStore = create<CartState>()(
	devtools(
		persist(
			(set, get) => ({
				items: [],
				isLoading: false,
				error: null,
				cartId: null,
				guestSessionId: null,

				setLoading: (loading) => set({ isLoading: loading }),
				setError: (error) => set({ error }),

				fetchCart: async () => {
					const { setLoading, setError } = get()
					setLoading(true)
					setError(null)

					try {
						// Use the existing API route for now
						const response = await fetch('/api/cart')
						
						if (!response.ok) {
							// If cart API fails, just set empty cart
							set({ items: [], cartId: null, guestSessionId: null })
							return
						}
						
						const data = await response.json()
						
						if (data.success && data.cart) {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const items = data.cart.items?.map((item: any) => ({
								id: item.id,
								productId: item.variant?.productId || '',
								productVariantId: item.productVariantId,
								title: item.variant?.product?.name || 'Product',
								price: Number(item.variant?.price || 0),
								quantity: item.quantity,
								imageUrl: undefined,
								color: item.variant?.color?.name,
								size: item.variant?.size?.name
							})) || []
							
							set({ 
								items,
								cartId: data.cart.id,
								guestSessionId: null
							})
						} else {
							set({ items: [], cartId: null, guestSessionId: null })
						}
					} catch {
						// Silently handle cart fetch errors - user might not be logged in
						set({ items: [], cartId: null, guestSessionId: null })
					} finally {
						setLoading(false)
					}
				},

				addItem: async (item) => {
					const { setLoading, setError, fetchCart } = get()
					setLoading(true)
					setError(null)

					try {
						// Use the existing API route
						const response = await fetch('/api/cart', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								productVariantId: item.productVariantId,
								quantity: item.quantity || 1,
							}),
						})

						if (!response.ok) {
							const errorData = await response.json().catch(() => ({}))
							console.error('API Error:', errorData)
							throw new Error(errorData.error || 'Failed to add item to cart')
						}

						// Refresh cart
						await fetchCart()
					} catch (error) {
						console.error('Failed to add item:', error)
						setError(error instanceof Error ? error.message : 'Failed to add item to cart')
					} finally {
						setLoading(false)
					}
				},

				updateItem: async (itemId, quantity) => {
					const { setLoading, setError, fetchCart } = get()
					setLoading(true)
					setError(null)

					try {
						if (quantity <= 0) {
							await get().removeItem(itemId)
							return
						}

						const response = await fetch('/api/cart', {
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								id: itemId,
								quantity,
							}),
						})

						if (!response.ok) {
							throw new Error('Failed to update item')
						}

						await fetchCart()
					} catch (error) {
						console.error('Failed to update item:', error)
						setError('Failed to update item')
					} finally {
						setLoading(false)
					}
				},

				removeItem: async (itemId) => {
					const { setLoading, setError, fetchCart } = get()
					setLoading(true)
					setError(null)

					try {
						const response = await fetch(`/api/cart?id=${itemId}`, {
							method: 'DELETE',
						})

						if (!response.ok) {
							throw new Error('Failed to remove item')
						}

						await fetchCart()
					} catch (error) {
						console.error('Failed to remove item:', error)
						setError('Failed to remove item')
					} finally {
						setLoading(false)
					}
				},

				clear: async () => {
					const { setLoading, setError } = get()
					setLoading(true)
					setError(null)

					try {
						const response = await fetch('/api/cart?action=clear', {
							method: 'DELETE',
						})

						if (!response.ok) {
							throw new Error('Failed to clear cart')
						}

						set({ items: [] })
					} catch (error) {
						console.error('Failed to clear cart:', error)
						setError('Failed to clear cart')
					} finally {
						setLoading(false)
					}
				}
			}),
			{
				name: 'cart-storage',
				partialize: (state) => ({
					guestSessionId: state.guestSessionId,
					cartId: state.cartId
				})
			}
		),
		{ name: 'cart-store' }
	)
)
