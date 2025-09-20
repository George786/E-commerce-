'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addToWishlist, removeFromWishlist, toggleWishlist, getWishlistItems, type WishlistItem } from '@/lib/actions/wishlist'

interface WishlistStore {
  items: WishlistItem[]
  isLoading: boolean
  error: string | null
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  toggleItem: (productId: string) => Promise<boolean>
  fetchItems: () => Promise<void>
  clearError: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      addItem: async (productId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await addToWishlist(productId)
          
          if (result.success) {
            // Refresh the wishlist items
            await get().fetchItems()
          } else {
            set({ error: result.error || 'Failed to add to wishlist' })
          }
        } catch (error) {
          console.error('Error adding to wishlist:', error)
          set({ error: 'Failed to add to wishlist' })
        } finally {
          set({ isLoading: false })
        }
      },

      removeItem: async (productId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await removeFromWishlist(productId)
          
          if (result.success) {
            set(state => ({
              items: state.items.filter(item => item.productId !== productId)
            }))
          } else {
            set({ error: result.error || 'Failed to remove from wishlist' })
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error)
          set({ error: 'Failed to remove from wishlist' })
        } finally {
          set({ isLoading: false })
        }
      },

      toggleItem: async (productId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await toggleWishlist(productId)
          
          if (result.success) {
            if (result.isInWishlist) {
              // Item was added, refresh the list
              await get().fetchItems()
            } else {
              // Item was removed, update local state
              set(state => ({
                items: state.items.filter(item => item.productId !== productId)
              }))
            }
            return result.isInWishlist
          } else {
            set({ error: result.error || 'Failed to update wishlist' })
            return false
          }
        } catch (error) {
          console.error('Error toggling wishlist:', error)
          set({ error: 'Failed to update wishlist' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      fetchItems: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const items = await getWishlistItems()
          set({ items })
        } catch (error) {
          console.error('Error fetching wishlist items:', error)
          set({ error: 'Failed to load wishlist' })
        } finally {
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
