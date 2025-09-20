import { db } from '@/lib/db'
import { carts, cartItems } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export interface MergedCartItem {
  id: string
  productVariantId: string
  quantity: number
  variant: {
    id: string
    price: string
    salePrice?: string | null
    product: {
      id: string
      name: string
    }
    color?: {
      id: string
      name: string
    } | null
    size?: {
      id: string
      name: string
    } | null
  }
}

export interface MergedCart {
  id: string
  userId: string | null
  items: MergedCartItem[]
  totalAmount: number
}

/**
 * Merges guest cart into user cart and returns the merged cart
 * If no user cart exists, creates a new one and moves guest items
 * If user cart exists, merges quantities for existing items
 */
export async function mergeGuestToUserCart(
  guestCartId: string,
  userId: string
): Promise<MergedCart> {
  // Get guest cart with items
  const guestCart = await db.query.carts.findFirst({
    where: eq(carts.id, guestCartId),
    with: {
      items: {
        with: {
          variant: {
            with: {
              product: true,
              color: true,
              size: true,
            },
          },
        },
      },
    },
  })

  if (!guestCart || !guestCart.items.length) {
    throw new Error('Guest cart not found or empty')
  }

  // Find or create user cart
  let userCart = await db.query.carts.findFirst({
    where: and(eq(carts.userId, userId), isNull(carts.guestId)),
    with: {
      items: {
        with: {
          variant: {
            with: {
              product: true,
              color: true,
              size: true,
            },
          },
        },
      },
    },
  })

  if (!userCart) {
    // Create new user cart
    const [newUserCart] = await db
      .insert(carts)
      .values({
        userId,
        guestId: null,
      })
      .returning()

    if (!newUserCart) {
      throw new Error('Failed to create user cart')
    }

    userCart = {
      id: newUserCart.id,
      userId: newUserCart.userId,
      guestId: newUserCart.guestId,
      createdAt: newUserCart.createdAt,
      updatedAt: newUserCart.updatedAt,
      items: [],
    }
  }

  // Merge guest items into user cart
  for (const guestItem of guestCart.items) {
    const existingItem = userCart.items.find(
      (item) => item.productVariantId === guestItem.productVariantId
    )

    if (existingItem) {
      // Update quantity
      await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + guestItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
    } else {
      // Add new item to user cart
      await db.insert(cartItems).values({
        cartId: userCart.id,
        productVariantId: guestItem.productVariantId,
        quantity: guestItem.quantity,
      })
    }
  }

  // Delete guest cart
  await db.delete(cartItems).where(eq(cartItems.cartId, guestCartId))
  await db.delete(carts).where(eq(carts.id, guestCartId))

  // Fetch updated user cart
  const updatedUserCart = await db.query.carts.findFirst({
    where: eq(carts.id, userCart.id),
    with: {
      items: {
        with: {
          variant: {
            with: {
              product: true,
              color: true,
              size: true,
            },
          },
        },
      },
    },
  })

  if (!updatedUserCart) {
    throw new Error('Failed to fetch updated user cart')
  }

  // Calculate total amount
  const totalAmount = updatedUserCart.items.reduce((total, item) => {
    const price = Number(item.variant.salePrice || item.variant.price)
    return total + price * item.quantity
  }, 0)

  return {
    id: updatedUserCart.id,
    userId: updatedUserCart.userId,
    items: updatedUserCart.items as MergedCartItem[],
    totalAmount,
  }
}

/**
 * Gets cart for checkout (handles both guest and user carts)
 */
export async function getCartForCheckout(
  cartId: string,
  userId?: string
): Promise<MergedCart> {
  const cart = await db.query.carts.findFirst({
    where: eq(carts.id, cartId),
    with: {
      items: {
        with: {
          variant: {
            with: {
              product: true,
              color: true,
              size: true,
            },
          },
        },
      },
    },
  })

  if (!cart) {
    throw new Error('Cart not found')
  }

  if (!cart.items.length) {
    throw new Error('Cart is empty')
  }

  // If user is authenticated and cart is a guest cart, merge it
  if (userId && cart.guestId && !cart.userId) {
    return await mergeGuestToUserCart(cartId, userId)
  }

  // Calculate total amount
  const totalAmount = cart.items.reduce((total, item) => {
    const price = Number(item.variant.salePrice || item.variant.price)
    return total + price * item.quantity
  }, 0)

  return {
    id: cart.id,
    userId: cart.userId,
    items: cart.items as MergedCartItem[],
    totalAmount,
  }
}
