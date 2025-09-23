import { requestPasswordReset } from '@/lib/auth/actions'

export const dynamic = 'force-dynamic'

export default function Page() {
    async function action(formData: FormData) {
        'use server'
        await requestPasswordReset(formData)
    }

    return (
        <form action={action} className="space-y-6">
            <div className="text-center">
                <h1 className="text-heading-2">Reset your password</h1>
                <p className="mt-2 text-body text-dark-700">Enter your email and we'll send reset instructions.</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-body-medium text-dark-900 font-medium">Email Address</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus-ring"
                    required
                />
            </div>

            <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-body-medium font-semibold text-white shadow-lg btn-hover"
            >
                Send reset link
            </button>
        </form>
    )
}

