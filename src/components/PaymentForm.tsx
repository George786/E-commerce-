'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Gift, 
  Shield,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  popular?: boolean
}

interface CouponCode {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minAmount: number
  description: string
}

interface PaymentFormProps {
  total: number
  shippingAddress: unknown
  onBack: () => void
  onComplete: () => void
  className?: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express',
    popular: true,
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: Smartphone,
    description: 'Google Pay, PhonePe, Paytm, BHIM',
    popular: true,
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    description: 'PayPal, Apple Pay, Google Pay',
  },
  {
    id: 'gift-voucher',
    name: 'Gift Voucher',
    icon: Gift,
    description: 'Redeem your gift voucher',
  },
  {
    id: 'gift-card',
    name: 'Gift Card',
    icon: Gift,
    description: 'Use your Nike gift card',
  },
]

const couponCodes: CouponCode[] = [
  {
    code: 'WELCOME10',
    discount: 10,
    type: 'percentage',
    minAmount: 50,
    description: '10% off on your first order',
  },
  {
    code: 'BBD2024',
    discount: 25,
    type: 'percentage',
    minAmount: 100,
    description: 'Big Billion Day - 25% off on orders above $100',
  },
  {
    code: 'FESTIVE20',
    discount: 20,
    type: 'percentage',
    minAmount: 75,
    description: 'Festive season special - 20% off',
  },
  {
    code: 'SAVE15',
    discount: 15,
    type: 'fixed',
    minAmount: 50,
    description: 'Flat $15 off on orders above $50',
  },
]

export default function PaymentForm({ 
  total, 
  onBack, 
  onComplete, 
  className = '' 
}: PaymentFormProps) {
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null)
  const [giftCardCode, setGiftCardCode] = useState('')
  const [giftCardAmount, setGiftCardAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCouponApply = () => {
    const coupon = couponCodes.find(c => c.code.toUpperCase() === couponCode.toUpperCase())
    if (coupon && total >= coupon.minAmount) {
      setAppliedCoupon(coupon)
    } else if (coupon) {
      alert(`Minimum order amount for this coupon is $${coupon.minAmount}`)
    } else {
      alert('Invalid coupon code')
    }
  }

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.type === 'percentage') {
      return (total * appliedCoupon.discount) / 100
    }
    return appliedCoupon.discount
  }

  const calculateFinalTotal = () => {
    const discount = calculateDiscount()
    return Math.max(0, total - discount - giftCardAmount)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real app, you would integrate with your payment provider here
      // For demo purposes, we'll simulate a successful payment
      console.log('Payment processed successfully:', {
        method: selectedPayment,
        amount: calculateFinalTotal(),
        coupon: appliedCoupon?.code,
        giftCard: giftCardAmount > 0 ? giftCardCode : null
      })
      
      setIsProcessing(false)
      onComplete()
    } catch (error) {
      console.error('Payment processing error:', error)
      alert('Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-heading-2 font-bold text-dark-900 mb-2">Payment</h2>
        <p className="text-body text-dark-600">
          Complete your purchase securely with your preferred payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method Selection */}
          <div className="bg-light-100 rounded-lg p-6">
            <h3 className="text-heading-3 font-semibold text-dark-900 mb-4">Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPayment === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-light-300 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="sr-only"
                  />
                  <method.icon className="h-6 w-6 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-body-medium font-medium text-dark-900">
                        {method.name}
                      </span>
                      {method.popular && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-caption text-dark-600">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          {selectedPayment === 'card' && (
            <div className="bg-light-100 rounded-lg p-6">
              <h3 className="text-heading-3 font-semibold text-dark-900 mb-4">Card Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-medium font-medium text-dark-900 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-medium font-medium text-dark-900 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-body-medium font-medium text-dark-900 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-body-medium font-medium text-dark-900 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedPayment === 'upi' && (
            <div className="bg-light-100 rounded-lg p-6">
              <h3 className="text-heading-3 font-semibold text-dark-900 mb-4">UPI Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-medium font-medium text-dark-900 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="yourname@paytm"
                    className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="text-caption text-dark-600">
                  You will be redirected to your UPI app to complete the payment.
                </div>
              </div>
            </div>
          )}

          {selectedPayment === 'gift-voucher' && (
            <div className="bg-light-100 rounded-lg p-6">
              <h3 className="text-heading-3 font-semibold text-dark-900 mb-4">Gift Voucher</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-medium font-medium text-dark-900 mb-2">
                    Voucher Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter voucher code"
                    className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedPayment === 'gift-card' && (
            <div className="bg-light-100 rounded-lg p-6">
              <h3 className="text-heading-3 font-semibold text-dark-900 mb-4">Gift Card</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-medium font-medium text-dark-900 mb-2">
                    Gift Card Code
                  </label>
                  <input
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    placeholder="Enter gift card code"
                    className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-body-medium font-medium text-dark-900 mb-2">
                    Amount to Use
                  </label>
                  <input
                    type="number"
                    value={giftCardAmount}
                    onChange={(e) => setGiftCardAmount(Number(e.target.value))}
                    placeholder="0.00"
                    max={total}
                    className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Coupons */}
        <div className="space-y-6">
          {/* Coupon Codes */}
          <div className="bg-light-100 rounded-lg p-6">
            <h3 className="text-heading-3 font-semibold text-dark-900 mb-4">Coupon Code</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-lg border border-light-300 px-3 py-2 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={handleCouponApply}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-body-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  Apply
                </button>
              </div>
              
              {appliedCoupon && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-body-medium text-green-800">
                      {appliedCoupon.code} applied!
                    </span>
                  </div>
                  <p className="text-caption text-green-600 mt-1">
                    {appliedCoupon.description}
                  </p>
                </div>
              )}

              {/* Available Coupons */}
              <div className="space-y-2">
                <p className="text-caption font-medium text-dark-700">Available Offers:</p>
                {couponCodes.map((coupon) => (
                  <div key={coupon.code} className="flex items-center justify-between p-2 rounded border border-light-300">
                    <div>
                      <span className="text-body-medium font-medium text-dark-900">
                        {coupon.code}
                      </span>
                      <p className="text-caption text-dark-600">{coupon.description}</p>
                    </div>
                    <button
                      onClick={() => setCouponCode(coupon.code)}
                      className="text-caption text-blue-600 hover:text-blue-800"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-light-100 rounded-lg p-6">
            <h3 className="text-heading-3 font-semibold text-dark-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-body text-dark-700">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-body text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              
              {giftCardAmount > 0 && (
                <div className="flex justify-between text-body text-blue-600">
                  <span>Gift Card</span>
                  <span>-${giftCardAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-body text-dark-700">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="border-t border-light-300 pt-3">
                <div className="flex justify-between text-body-medium font-semibold text-dark-900">
                  <span>Total</span>
                  <span>${calculateFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-6 flex items-center gap-2 text-caption text-dark-600">
              <Shield className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-light-100 border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Payment
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              
              <button
                onClick={onBack}
                className="w-full rounded-full border border-light-300 px-6 py-3 text-body text-dark-700 transition hover:border-blue-500 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shipping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
