'use client'

import { useState, useEffect } from 'react'
import { Tag, Percent, Gift, Star, Clock, Zap } from 'lucide-react'

interface ProductOffer {
  id: string
  title: string
  description: string
  discount: string
  type: 'percentage' | 'fixed' | 'bogo' | 'festive' | 'flash'
  validUntil: string
  backgroundColor: string
  textColor: string
  isActive: boolean
}

const PRODUCT_OFFERS: ProductOffer[] = [
  {
    id: 'flash-sale',
    title: 'Flash Sale',
    description: 'Limited time offer on this product',
    discount: '25% OFF',
    type: 'flash',
    validUntil: '2024-12-31',
    backgroundColor: 'bg-gradient-to-r from-red-500 to-pink-500',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'free-shipping',
    title: 'Free Shipping',
    description: 'Get free shipping on orders over $50',
    discount: 'FREE',
    type: 'fixed',
    validUntil: '2025-12-31',
    backgroundColor: 'bg-gradient-to-r from-green-500 to-teal-500',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'buy-one-get-one',
    title: 'Buy One Get One',
    description: 'Buy any shoe, get another at 50% off',
    discount: 'BOGO',
    type: 'bogo',
    validUntil: '2025-01-15',
    backgroundColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    textColor: 'text-white',
    isActive: true,
  },
]

export default function ProductOffers() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
  })

  const activeOffers = PRODUCT_OFFERS.filter(offer => offer.isActive)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const endTime = new Date(activeOffers[0]?.validUntil || '').getTime()
      const difference = endTime - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [activeOffers])

  if (activeOffers.length === 0) {
    return null
  }

  const getOfferIcon = (type: ProductOffer['type']) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />
      case 'fixed':
        return <Tag className="h-4 w-4" />
      case 'bogo':
        return <Gift className="h-4 w-4" />
      case 'festive':
        return <Star className="h-4 w-4" />
      case 'flash':
        return <Zap className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Flash Sale Offer */}
      {activeOffers[0] && (
        <div className={`relative overflow-hidden rounded-xl ${activeOffers[0].backgroundColor} ${activeOffers[0].textColor} p-4 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getOfferIcon(activeOffers[0].type)}
              <div>
                <h4 className="text-body-medium font-semibold">
                  {activeOffers[0].title}
                </h4>
                <p className="text-caption opacity-90">
                  {activeOffers[0].description}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-heading-3 font-bold">
                {activeOffers[0].discount}
              </div>
              {timeLeft.days > 0 && (
                <div className="flex items-center gap-1 text-caption">
                  <Clock className="h-3 w-3" />
                  <span>
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Offers */}
      <div className="grid grid-cols-1 gap-3">
        {activeOffers.slice(1).map((offer) => (
          <div
            key={offer.id}
            className="flex items-center justify-between bg-light-50 rounded-lg p-3 border border-light-200"
          >
            <div className="flex items-center gap-2">
              {getOfferIcon(offer.type)}
              <div>
                <span className="text-body-medium font-medium text-dark-900">
                  {offer.title}
                </span>
                <p className="text-caption text-dark-600">
                  {offer.description}
                </p>
              </div>
            </div>
            
            <span className="text-body-medium font-bold text-blue-600">
              {offer.discount}
            </span>
          </div>
        ))}
      </div>

      {/* Special Promo */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 text-blue-600" />
          <span className="text-body-medium font-semibold text-blue-900">
            Member Exclusive
          </span>
        </div>
        <p className="text-body text-blue-700 mb-2">
          Sign up for our newsletter and get an extra 10% off your first order!
        </p>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-body">
          Join Now →
        </button>
      </div>
    </div>
  )
}
