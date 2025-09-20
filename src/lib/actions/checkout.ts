'use server'

import { stripe, isStripeConfigured } from '@/lib/stripe/client'
import { getCartForCheckout } from '@/lib/utils/mergeSessions'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface CheckoutSessionResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Creates a Stripe checkout session for the current cart
 */
export async function createStripeCheckoutSession(): Promise<CheckoutSessionResult> {
  try {
    if (!isStripeConfigured()) {
      return {
        success: false,
        error: 'Payment system is not configured. Please contact support.',
      }
    }

    if (!stripe) {
      return {
        success: false,
        error: 'Payment system is not available. Please try again later.',
      }
    }

    const cookieStore = await cookies()
    const cartId = cookieStore.get('cartId')?.value
    const userId = cookieStore.get('userId')?.value

    if (!cartId) {
      return {
        success: false,
        error: 'No cart found. Please add items to your cart first.',
      }
    }

    // Get cart with merged sessions if needed
    const cart = await getCartForCheckout(cartId, userId || undefined)

    if (!cart.items.length) {
      return {
        success: false,
        error: 'Cart is empty. Please add items to your cart first.',
      }
    }

    // Create line items for Stripe
    const lineItems = cart.items.map((item) => {
      const price = Number(item.variant.salePrice || item.variant.price)
      const displayPrice = Math.round(price * 100) // Convert to cents

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.variant.product.name,
            description: [
              item.variant.color?.name && `Color: ${item.variant.color.name}`,
              item.variant.size?.name && `Size: ${item.variant.size.name}`,
            ]
              .filter(Boolean)
              .join(', '),
            images: [], // You can add product images here if needed
          },
          unit_amount: displayPrice,
        },
        quantity: item.quantity,
      }
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        cartId: cart.id,
        userId: cart.userId || '',
      },
      customer_email: userId ? undefined : undefined, // Will be collected on checkout page
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add more countries as needed
      },
    })

    if (!session.url) {
      return {
        success: false,
        error: 'Failed to create checkout session',
      }
    }

    return {
      success: true,
      url: session.url,
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return {
      success: false,
      error: 'Failed to create checkout session. Please try again.',
    }
  }
}

/**
 * Redirects to Stripe checkout
 */
export async function redirectToCheckout() {
  const result = await createStripeCheckoutSession()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create checkout session')
  }

  if (result.url) {
    redirect(result.url)
  }
}
