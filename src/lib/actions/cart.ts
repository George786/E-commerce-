'use server'

import { db } from '@/lib/db'
import { carts, cartItems } from '@/lib/db/schema/carts'
import { eq } from 'drizzle-orm'

type GetCartArgs = { userId?: string; cartId?: string }

export async function getCart({ userId, cartId }: GetCartArgs) {
    if (!userId && !cartId) throw new Error('userId or cartId is required')

    return db.query.carts.findFirst({
        where: userId ? eq(carts.userId, userId) : eq(carts.id, cartId!),
        with: { items: true },
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
    let cart = await getCart({ userId, cartId })
    if (!cart) {
        const [newCart] = await db.insert(carts).values({ userId: userId ?? null }).returning()
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

// ================= Merge Guest Cart =================

export async function mergeGuestCart({ guestCartId, userId }: { guestCartId: string; userId: string }) {
    // load guest cart from cookies
    const cookieStore = await import('next/headers').then(m => m.cookies())
    const cartCookie = cookieStore.get(`guest_cart_${guestCartId}`)?.value
    if (!cartCookie) return

    const guestCart = JSON.parse(cartCookie) as { productVariantId: string; quantity: number }[]
    for (const item of guestCart) {
        await addCartItem({
            userId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
        })
    }

    // delete guest cart cookie after merging
    cookieStore.delete(`guest_cart_${guestCartId}`)
}
