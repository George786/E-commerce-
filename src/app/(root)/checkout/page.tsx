'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/actions'
import { useCartStore } from '@/store/cart.store'
import ShippingForm from '@/components/ShippingForm'
import PaymentForm from '@/components/PaymentForm'
import { CheckCircle, ShoppingBag, MapPin, CreditCard } from 'lucide-react'

type CheckoutStep = 'shipping' | 'payment' | 'complete'

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [shippingAddress, setShippingAddress] = useState<unknown>(null)
  const { items, clear } = useCartStore()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/sign-in?redirect=' + encodeURIComponent('/checkout'))
          return
        }
        setIsAuthenticated(true)
      } catch {
        router.push('/sign-in?redirect=' + encodeURIComponent('/checkout'))
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-dark-900 border-t-transparent mx-auto mb-4" />
          <p className="text-body text-dark-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="h-16 w-16 text-dark-400 mx-auto mb-4" />
          <h2 className="text-heading-2 font-bold text-dark-900 mb-2">Your cart is empty</h2>
          <p className="text-body text-dark-600 mb-6">
            Add some items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:opacity-90 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const handleShippingNext = (address: unknown) => {
    setShippingAddress(address)
    setCurrentStep('payment')
  }

  const handlePaymentComplete = () => {
    setCurrentStep('complete')
    clear() // Clear cart after successful payment
  }

  const steps = [
    { id: 'shipping', name: 'Shipping', icon: MapPin },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'complete', name: 'Complete', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-light-100">
      {/* Header */}
      <div className="bg-white border-b border-light-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-heading-1 font-bold text-dark-900 mb-2">Checkout</h1>
          <p className="text-body text-dark-600">
            Complete your purchase securely
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-light-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index
              const Icon = step.icon

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : isActive
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-light-300 bg-white text-dark-500'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-body-medium font-medium ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-dark-500'
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-16 ${
                        isCompleted ? 'bg-green-500' : 'bg-light-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'shipping' && (
          <ShippingForm
            onNext={handleShippingNext}
            onBack={() => router.push('/cart')}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentForm
            total={total}
            shippingAddress={shippingAddress}
            onBack={() => setCurrentStep('shipping')}
            onComplete={handlePaymentComplete}
          />
        )}

        {currentStep === 'complete' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-heading-2 font-bold text-green-800 mb-2">
                Order Confirmed!
              </h2>
              <p className="text-body text-green-700 mb-6">
                Thank you for your purchase. Your order has been placed successfully and you will receive a confirmation email shortly.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full rounded-full bg-green-600 px-6 py-3 text-body-medium text-white hover:bg-green-700 transition"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full rounded-full border border-green-600 px-6 py-3 text-body-medium text-green-600 hover:bg-green-50 transition"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
