'use server'

import { db } from '@/lib/db'
import { carts, cartItems } from '@/lib/db/schema/carts'
import { eq, and } from 'drizzle-orm'

export async function getCart(userId: string) {
    return db.query.carts.findFirst({
        where: eq(carts.userId, userId),
        with: { items: true },
    })
}

export async function addCartItem({
                                      userId,
                                      productVariantId,
                                      quantity,
                                  }: {
    userId: string
    productVariantId: string
    quantity: number
}) {
    // ensure user has cart
    let userCart = await db.query.carts.findFirst({
        where: eq(carts.userId, userId),
        with: { items: true },
    })

    if (!userCart) {
        const [newCart] = await db.insert(carts).values({ userId }).returning()
        userCart = { ...newCart, items: [] }
    }

    // check if item exists
    const existing = userCart.items.find(
        (i) => i.productVariantId === productVariantId
    )

    if (existing) {
        await db
            .update(cartItems)
            .set({ quantity: existing.quantity + quantity })
            .where(eq(cartItems.id, existing.id))
    } else {
        await db.insert(cartItems).values({
            cartId: userCart.id,
            productVariantId,
            quantity,
        })
    }

    return getCart(userId)
}

export async function updateCartItem(id: string, quantity: number) {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id))
}

export async function removeCartItem(id: string) {
    await db.delete(cartItems).where(eq(cartItems.id, id))
}

export async function clearCart(userId: string) {
    const cart = await db.query.carts.findFirst({
        where: eq(carts.userId, userId),
    })
    if (!cart) return
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id))
}
