import { NextRequest, NextResponse } from 'next/server'
import { stripe, isStripeConfigured } from '@/lib/stripe/client'
import { createOrder } from '@/lib/actions/orders'
import { headers } from 'next/headers'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured() || !stripe || !webhookSecret) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Received Stripe webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { id: string; metadata?: { userId?: string } }
        
        try {
          const userId = session.metadata?.userId || undefined
          const order = await createOrder(session.id, userId)
          console.log('Order created successfully:', order.id)
        } catch (error) {
          console.error('Error creating order:', error)
          return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
          )
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as { id: string; last_payment_error?: unknown }
        console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error)
        
        // You could update order status here if you track payment intents
        // For now, we'll just log the failure
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as { id: string }
        console.log('Checkout session expired:', session.id)
        
        // You could update order status to cancelled here
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
