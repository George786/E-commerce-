'use server'

import { db } from '@/lib/db'
import { carts, cartItems } from '@/lib/db/schema/carts'
import { eq } from 'drizzle-orm'

export async function getGuestCart(guestId: string) {
    return db.query.carts.findFirst({
        where: eq(carts.guestId, guestId),
        with: { items: true },
    })
}

export async function addGuestCartItem({
                                           guestId,
                                           productVariantId,
                                           quantity,
                                       }: {
    guestId: string
    productVariantId: string
    quantity: number
}) {
    let guestCart = await db.query.carts.findFirst({
        where: eq(carts.guestId, guestId),
        with: { items: true },
    })

    if (!guestCart) {
        const [newCart] = await db.insert(carts).values({ guestId }).returning()
        guestCart = { ...newCart, items: [] }
    }

    const existing = guestCart.items.find(
        (i) => i.productVariantId === productVariantId
    )

    if (existing) {
        await db
            .update(cartItems)
            .set({ quantity: existing.quantity + quantity })
            .where(eq(cartItems.id, existing.id))
    } else {
        await db.insert(cartItems).values({
            cartId: guestCart.id,
            productVariantId,
            quantity,
        })
    }

    return getGuestCart(guestId)
}

export async function clearGuestCart(guestId: string) {
    const cart = await db.query.carts.findFirst({
        where: eq(carts.guestId, guestId),
    })
    if (!cart) return
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id))
}
