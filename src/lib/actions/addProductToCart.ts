'use server'
import { addCartItem } from './cart'
import { addGuestCartItem } from './guestCart'

export async function addProductToCart({
                                           userId,
                                           guestId,
                                           productVariantId,
                                           quantity,
                                       }: {
    userId?: string | null
    guestId?: string
    productVariantId: string
    quantity: number
}) {
    if (userId) {
        return addCartItem({ userId, productVariantId, quantity })
    } else if (guestId) {
        return addGuestCartItem({ guestId, productVariantId, quantity })
    } else {
        throw new Error('Either userId or guestId required')
    }
}
