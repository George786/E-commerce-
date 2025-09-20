'use client'

import { useState } from 'react'
import { MapPin, User, Phone, Mail, Home } from 'lucide-react'

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface ShippingFormProps {
  onNext: (address: ShippingAddress) => void
  onBack: () => void
  className?: string
}

export default function ShippingForm({ onNext, onBack, className = '' }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  })

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof ShippingAddress]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(formData)
    }
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="mb-8">
        <h2 className="text-heading-2 font-bold text-dark-900 mb-2">Shipping Address</h2>
        <p className="text-body text-dark-600">
          Please provide your shipping information to continue with checkout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-body-medium font-medium text-dark-900 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                errors.firstName 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-light-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-caption text-red-600 mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-body-medium font-medium text-dark-900 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                errors.lastName 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-light-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-caption text-red-600 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-body-medium font-medium text-dark-900 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-light-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-caption text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-body-medium font-medium text-dark-900 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                errors.phone 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-light-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="text-caption text-red-600 mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-body-medium font-medium text-dark-900 mb-2">
            <Home className="inline h-4 w-4 mr-1" />
            Street Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full rounded-lg border px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
              errors.address 
                ? 'border-red-500 focus:ring-red-500/20' 
                : 'border-light-300 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            placeholder="Enter your street address"
          />
          {errors.address && <p className="text-caption text-red-600 mt-1">{errors.address}</p>}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="city" className="block text-body-medium font-medium text-dark-900 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                errors.city 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-light-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              placeholder="City"
            />
            {errors.city && <p className="text-caption text-red-600 mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-body-medium font-medium text-dark-900 mb-2">
              State *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                errors.state 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-light-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              placeholder="State"
            />
            {errors.state && <p className="text-caption text-red-600 mt-1">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-body-medium font-medium text-dark-900 mb-2">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                errors.zipCode 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-light-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              placeholder="ZIP Code"
            />
            {errors.zipCode && <p className="text-caption text-red-600 mt-1">{errors.zipCode}</p>}
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-body-medium font-medium text-dark-900 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Country *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="India">India</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Japan">Japan</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-full border border-light-300 px-6 py-3 text-body text-dark-700 transition hover:border-blue-500 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            className="flex-1 rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  )
}
