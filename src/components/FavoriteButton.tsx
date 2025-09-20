'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist.store'
import { getCurrentUser } from '@/lib/auth/actions'

interface FavoriteButtonProps {
  productId: string
  productName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function FavoriteButton({
  productId,
  className = '',
  size = 'md',
  showText = false,
}: FavoriteButtonProps) {
  const { items, toggleItem, isLoading } = useWishlistStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        setIsAuthenticated(!!user)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    // Check if product is in wishlist
    setIsFavorited(items.some(item => item.productId === productId))
  }, [productId, items])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to sign in page
      window.location.href = '/sign-in?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    try {
      const newFavoriteState = await toggleItem(productId)
      setIsFavorited(newFavoriteState)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const buttonSizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 rounded-full border border-light-300 px-4 py-2 text-body text-dark-700 transition hover:border-red-500 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${className}`}
        title="Sign in to add to favorites"
      >
        <Heart className={sizeClasses[size]} />
        {showText && <span>Sign in to Favorite</span>}
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-body transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
        isFavorited
          ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-light-300 text-dark-700 hover:border-red-500 hover:text-red-600'
      } ${buttonSizeClasses[size]} ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`${sizeClasses[size]} ${isFavorited ? 'fill-current' : ''}`} 
      />
      {showText && (
        <span>
          {isLoading ? 'Updating...' : isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </button>
  )
}
