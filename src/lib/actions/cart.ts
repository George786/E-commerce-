'use server'

import { db } from '@/lib/db'
import { carts, cartItems } from '@/lib/db/schema/carts'
import { guests } from '@/lib/db/schema/guest'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth/actions'
import { cookies } from 'next/headers'

type GetCartArgs = { userId?: string; cartId?: string; guestId?: string }

export async function getCart({ userId, cartId, guestId }: GetCartArgs) {
    // If no specific cart ID provided, try to get current user's cart
    if (!userId && !cartId && !guestId) {
        const user = await getCurrentUser()
        if (user) {
            userId = user.id
        } else {
            // Try to get guest session
            const cookieStore = await cookies()
            const guestSessionId = cookieStore.get('guest_session')?.value
            if (guestSessionId) {
                guestId = guestSessionId
            }
        }
    }

    if (!userId && !cartId && !guestId) {
        return null
    }

    let whereCondition
    if (userId) {
        whereCondition = eq(carts.userId, userId)
    } else if (cartId) {
        whereCondition = eq(carts.id, cartId)
    } else if (guestId) {
        // If guestId is a session token, get the actual guest ID
        if (!guestId.includes('-')) {
            const guest = await db.query.guests.findFirst({
                where: eq(guests.sessionToken, guestId)
            })
            if (guest) {
                whereCondition = eq(carts.guestId, guest.id)
            } else {
                return null
            }
        } else {
            whereCondition = eq(carts.guestId, guestId)
        }
    }

    return db.query.carts.findFirst({
        where: whereCondition,
        with: { 
            items: {
                with: {
                    variant: {
                        with: {
                            product: true,
                            color: true,
                            size: true
                        }
                    }
                }
            }
        },
    })
}

type AddCartItemArgs = {
    userId?: string
    cartId?: string
    guestId?: string
    productVariantId: string
    quantity: number
}

export async function addCartItem({
                                      userId,
                                      cartId,
                                      guestId,
                                      productVariantId,
                                      quantity,
                                  }: AddCartItemArgs) {
    // get or create cart
    let cart = await getCart({ userId, cartId, guestId })
    if (!cart) {
        // For now, only create user carts to avoid database constraint issues
        // Guest carts will be handled via cookies until the database is properly set up
        if (userId) {
            const [newCart] = await db.insert(carts).values({ 
                userId: userId,
                guestId: null
            }).returning()
            cart = { ...newCart, items: [] }
        } else {
            // For guests, we'll use a simple approach without database constraints
            throw new Error('Guest cart functionality requires database setup')
        }
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

// Guest cart merging functionality can be implemented later when database is properly set up
