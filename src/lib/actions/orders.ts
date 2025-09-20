'use server'

import { db } from '@/lib/db'
import { orders, orderItems, carts, cartItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { stripe, isStripeConfigured } from '@/lib/stripe/client'

export interface OrderItem {
  id: string
  orderId: string
  productVariantId: string
  quantity: number
  price: number
  variant: {
    id: string
    price: string
    salePrice?: string | null
    product: {
      id: string
      name: string
    }
    color?: {
      id: string
      name: string
    } | null
    size?: {
      id: string
      name: string
    } | null
  }
}

export interface Order {
  id: string
  userId: string | null
  stripeSessionId: string | null
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  totalAmount: number
  currency: string
  customerEmail?: string | null
  shippingAddress?: {
    name?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
  } | null
  billingAddress?: {
    name?: string
    email?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
  } | null
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
}

/**
 * Creates an order from a successful Stripe checkout session
 */
export async function createOrder(
  stripeSessionId: string,
  userId?: string
): Promise<Order> {
  try {
    if (!isStripeConfigured() || !stripe) {
      throw new Error('Stripe is not configured')
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
      expand: ['line_items', 'customer'],
    })

    if (!session) {
      throw new Error('Stripe session not found')
    }

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed')
    }

    const cartId = (session.metadata as { cartId?: string })?.cartId
    if (!cartId) {
      throw new Error('Cart ID not found in session metadata')
    }

    // Get cart items
    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: true,
                color: true,
                size: true,
              },
            },
          },
        },
      },
    })

    if (!cart || !cart.items.length) {
      throw new Error('Cart not found or empty')
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      const price = Number(item.variant.salePrice || item.variant.price)
      return total + price * item.quantity
    }, 0)

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        userId: userId || null,
        stripeSessionId,
        status: 'paid',
        totalAmount: Math.round(totalAmount * 100).toString(), // Store in cents as string
        currency: 'usd',
        customerEmail: session.customer_email || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shippingAddress: (session as any).shipping_details ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (session as any).shipping_details.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          address: (session as any).shipping_details.address,
        } : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        billingAddress: (session as any).customer_details ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (session as any).customer_details.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (session as any).customer_details.email,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          address: (session as any).customer_details.address,
        } : null,
      })
      .returning()

    if (!order) {
      throw new Error('Failed to create order')
    }

    // Create order items
    const orderItemsData = cart.items.map((item) => {
      const price = Number(item.variant.salePrice || item.variant.price)
      return {
        orderId: order.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: Math.round(price * 100).toString(), // Store in cents as string
      }
    })

    await db.insert(orderItems).values(orderItemsData)

    // Clear the cart after successful order
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId))
    await db.delete(carts).where(eq(carts.id, cartId))

    // Fetch the complete order with items
    const completeOrder = await getOrder(order.id)
    if (!completeOrder) {
      throw new Error('Failed to fetch created order')
    }

    return completeOrder
  } catch (error) {
    console.error('Error creating order:', error)
    throw new Error('Failed to create order')
  }
}

/**
 * Retrieves an order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: true,
                color: true,
                size: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return null
    }

    return {
      id: order.id,
      userId: order.userId,
      stripeSessionId: order.stripeSessionId,
      status: order.status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress as Order['shippingAddress'],
      billingAddress: order.billingAddress as Order['billingAddress'],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
      })) as OrderItem[],
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

/**
 * Retrieves an order by Stripe session ID
 */
export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.stripeSessionId, sessionId),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: true,
                color: true,
                size: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return null
    }

    return {
      id: order.id,
      userId: order.userId,
      stripeSessionId: order.stripeSessionId,
      status: order.status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress as Order['shippingAddress'],
      billingAddress: order.billingAddress as Order['billingAddress'],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
      })) as OrderItem[],
    }
  } catch (error) {
    console.error('Error fetching order by session ID:', error)
    return null
  }
}

/**
 * Updates order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
): Promise<boolean> {
  try {
    await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    return false
  }
}
