'use server'

import { db } from '@/lib/db'
import { wishlists } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth/actions'

export interface WishlistItem {
  id: string
  productId: string
  addedAt: Date
  product: {
    id: string
    name: string
    price?: number
    imageUrl?: string
  }
}

/**
 * Get user's wishlist items
 */
export async function getWishlistItems(): Promise<WishlistItem[]> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    const items = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, user.id),
      with: {
        product: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            variants: {
              columns: {
                price: true,
                salePrice: true,
              },
              limit: 1,
            },
            images: {
              columns: {
                url: true,
              },
              where: (images, { eq }) => eq(images.isPrimary, true),
              limit: 1,
            },
          },
        },
      },
      orderBy: (wishlists, { desc }) => [desc(wishlists.addedAt)],
    })

    return items.map(item => {
      const variant = item.product.variants[0]
      const image = item.product.images[0]
      const price = variant ? Number(variant.salePrice || variant.price) : undefined
      
      return {
        id: item.id,
        productId: item.productId,
        addedAt: item.addedAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          price,
          imageUrl: image?.url || undefined,
        },
      }
    })
  } catch (error) {
    console.error('Error fetching wishlist items:', error)
    return []
  }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Please sign in to add items to your wishlist' }
    }

    // Check if already in wishlist
    const existing = await db.query.wishlists.findFirst({
      where: and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)),
    })

    if (existing) {
      return { success: false, error: 'Product is already in your wishlist' }
    }

    await db.insert(wishlists).values({
      userId: user.id,
      productId,
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return { success: false, error: 'Failed to add product to wishlist' }
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Please sign in to manage your wishlist' }
    }

    await db.delete(wishlists).where(
      and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId))
    )

    return { success: true }
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return { success: false, error: 'Failed to remove product from wishlist' }
  }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return false
    }

    const item = await db.query.wishlists.findFirst({
      where: and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)),
    })

    return !!item
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return false
  }
}

/**
 * Toggle product in wishlist (add if not present, remove if present)
 */
export async function toggleWishlist(productId: string): Promise<{ success: boolean; isInWishlist: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, isInWishlist: false, error: 'Please sign in to manage your wishlist' }
    }

    const existing = await db.query.wishlists.findFirst({
      where: and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)),
    })

    if (existing) {
      await db.delete(wishlists).where(eq(wishlists.id, existing.id))
      return { success: true, isInWishlist: false }
    } else {
      await db.insert(wishlists).values({
        userId: user.id,
        productId,
      })
      return { success: true, isInWishlist: true }
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    return { success: false, isInWishlist: false, error: 'Failed to update wishlist' }
  }
}
