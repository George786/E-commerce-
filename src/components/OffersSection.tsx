'use client'

import { useState, useEffect } from 'react'
import { Tag, Percent, Gift, Star, Clock, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface Offer {
  id: string
  title: string
  description: string
  discount: string
  type: 'percentage' | 'fixed' | 'bogo' | 'festive'
  validUntil: string
  imageUrl: string
  backgroundColor: string
  textColor: string
  isActive: boolean
}

const OFFERS: Offer[] = [
  {
    id: 'bbd-2024',
    title: 'Big Billion Day',
    description: 'Up to 70% off on all shoes',
    discount: '70% OFF',
    type: 'festive',
    validUntil: '2024-12-31',
    imageUrl: '/trending-1.png',
    backgroundColor: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'new-year-2025',
    title: 'New Year Sale',
    description: 'Start the year with style',
    discount: '50% OFF',
    type: 'percentage',
    validUntil: '2025-01-15',
    imageUrl: '/trending-2.png',
    backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'winter-collection',
    title: 'Winter Collection',
    description: 'Stay warm and stylish',
    discount: '30% OFF',
    type: 'percentage',
    validUntil: '2025-02-28',
    imageUrl: '/trending-3.png',
    backgroundColor: 'bg-gradient-to-r from-gray-600 to-blue-600',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'student-discount',
    title: 'Student Special',
    description: 'Extra 15% off for students',
    discount: '15% OFF',
    type: 'percentage',
    validUntil: '2025-06-30',
    imageUrl: '/hero-shoe.png',
    backgroundColor: 'bg-gradient-to-r from-green-500 to-teal-500',
    textColor: 'text-white',
    isActive: true,
  },
]

export default function OffersSection() {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
  })

  const activeOffers = OFFERS.filter(offer => offer.isActive)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const endTime = new Date(activeOffers[currentOfferIndex]?.validUntil || '').getTime()
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
  }, [currentOfferIndex, activeOffers])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % activeOffers.length)
    }, 5000) // Change offer every 5 seconds

    return () => clearInterval(interval)
  }, [activeOffers.length])

  if (activeOffers.length === 0) {
    return null
  }

  const currentOffer = activeOffers[currentOfferIndex]

  const getOfferIcon = (type: Offer['type']) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-5 w-5" />
      case 'fixed':
        return <Tag className="h-5 w-5" />
      case 'bogo':
        return <Gift className="h-5 w-5" />
      case 'festive':
        return <Star className="h-5 w-5" />
      default:
        return <Tag className="h-5 w-5" />
    }
  }

  return (
    <section className="py-12 bg-gradient-to-br from-light-50 to-light-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-heading-2 font-bold text-dark-900 mb-2">
            🎉 Special Offers
          </h2>
          <p className="text-body text-dark-600">
            Don&apos;t miss out on these amazing deals!
          </p>
        </div>

        <div className="relative">
          {/* Main Offer Card */}
          <div className={`relative overflow-hidden rounded-2xl ${currentOffer.backgroundColor} ${currentOffer.textColor} shadow-2xl`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Content */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2">
                  {getOfferIcon(currentOffer.type)}
                  <span className="text-body-medium font-medium">
                    {currentOffer.type === 'festive' ? 'Festive Special' : 'Limited Time'}
                  </span>
                </div>
                
                <h3 className="text-heading-1 font-bold">
                  {currentOffer.title}
                </h3>
                
                <p className="text-lead opacity-90">
                  {currentOffer.description}
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-heading-3 font-bold">
                      {currentOffer.discount}
                    </span>
                  </div>
                  
                  {timeLeft.days > 0 && (
                    <div className="flex items-center gap-1 text-body">
                      <Clock className="h-4 w-4" />
                      <span>
                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
                      </span>
                    </div>
                  )}
                </div>
                
                <button className="btn-hover inline-flex items-center gap-2 bg-white text-dark-900 px-6 py-3 rounded-full font-medium hover:bg-light-100 transition-all duration-300 w-fit">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
              {/* Image */}
              <div className="relative">
                <div className="relative h-64 lg:h-80">
                  <Image
                    src={currentOffer.imageUrl}
                    alt={currentOffer.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Offer Indicators */}
          {activeOffers.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {activeOffers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentOfferIndex(index)}
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    index === currentOfferIndex
                      ? 'bg-blue-500'
                      : 'bg-light-300 hover:bg-light-400'
                  }`}
                  aria-label={`Go to offer ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Additional Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {activeOffers.slice(1, 4).map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-light-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  {getOfferIcon(offer.type)}
                  <span className="text-body-medium font-medium text-dark-900">
                    {offer.title}
                  </span>
                </div>
                
                <p className="text-body text-dark-600 mb-4">
                  {offer.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-heading-3 font-bold text-blue-600">
                    {offer.discount}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
