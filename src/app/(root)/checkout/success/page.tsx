import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getOrderBySessionId } from '@/lib/actions/orders'
import OrderSuccess from '@/components/OrderSuccess'
import { CheckCircle, Loader2 } from 'lucide-react'

interface CheckoutSuccessPageProps {
	searchParams: Promise<{ session_id?: string }>
}

async function OrderDetails({ sessionId }: { sessionId: string }) {
	const order = await getOrderBySessionId(sessionId)

	if (!order) {
		return (
			<div className="mx-auto max-w-4xl text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
					<CheckCircle className="h-8 w-8 text-red-600" />
				</div>
				<h1 className="text-heading-2 text-dark-900 mb-2">
					Order Not Found
				</h1>
				<p className="text-body text-dark-700 mb-6">
					We couldn&apos;t find your order. Please contact support if you believe this is an error.
				</p>
				<button
					onClick={() => window.location.href = '/products'}
					className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
				>
					Continue Shopping
				</button>
			</div>
		)
	}

	return <OrderSuccess order={order} />
}

function LoadingState() {
	return (
		<div className="mx-auto max-w-4xl text-center">
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
			</div>
			<h1 className="text-heading-2 text-dark-900 mb-2">
				Loading Your Order
			</h1>
			<p className="text-body text-dark-700">
				Please wait while we retrieve your order details...
			</p>
		</div>
	)
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
	const { session_id } = await searchParams

	if (!session_id) {
		redirect('/cart')
	}

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Suspense fallback={<LoadingState />}>
				<OrderDetails sessionId={session_id} />
			</Suspense>
		</main>
	)
}
