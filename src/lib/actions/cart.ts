'use server'

import { db } from '@/lib/db'
import { carts, cartItems } from '@/lib/db/schema/carts'
import { eq } from 'drizzle-orm'



    return db.query.carts.findFirst({
    })
}

type AddCartItemArgs = {
    userId?: string
    cartId?: string
    productVariantId: string
    quantity: number
}

export async function addCartItem({
                                      userId,
                                      cartId,
                                      productVariantId,
                                      quantity,
                                  }: AddCartItemArgs) {
    // get or create cart
    if (!cart) {
            cart = { ...newCart, items: [] }
    }

    // check if item exists
    const existing = cart.items.find((i) => i.productVariantId === productVariantId)
    if (existing) {
        await db.update(cartItems)
            .set({ quantity: existing.quantity + quantity })
            .where(eq(cartItems.id, existing.id))
    } else {
        await db.insert(cartItems).values({
            cartId: cart.id,
            productVariantId,
            quantity,
        })
    }

    return getCart({ cartId: cart.id })
}

export async function updateCartItem(id: string, quantity: number) {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id))
    const item = await db.query.cartItems.findFirst({ where: eq(cartItems.id, id) })
    if (!item) throw new Error('Cart item not found')
    return getCart({ cartId: item.cartId })
}

export async function removeCartItem(id: string) {
    const item = await db.query.cartItems.findFirst({ where: eq(cartItems.id, id) })
    if (!item) throw new Error('Cart item not found')
    await db.delete(cartItems).where(eq(cartItems.id, id))
    return getCart({ cartId: item.cartId })
}

export async function clearCart({ cartId }: { cartId: string }) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId))
    return []
}

