import { resetPassword } from '@/lib/auth/actions'

type Props = {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

function ResetForm({ token, email }: { token: string; email: string }) {

    async function action(formData: FormData) {
        'use server'
        await resetPassword(formData)
    }

    return (
        <form action={action} className="space-y-6">
            <div className="text-center">
                <h1 className="text-heading-2">Create a new password</h1>
                <p className="mt-2 text-body text-dark-700">Enter and confirm your new password.</p>
            </div>

            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="email" value={email} />

            <div className="space-y-2">
                <label htmlFor="password" className="text-body-medium text-dark-900 font-medium">New password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    minLength={12}
                    pattern={'(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{12,}'}
                    title={'Use at least 12 characters with upper, lower, number, and symbol'}
                    className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus-ring"
                    required
                />
                <p className="text-caption text-dark-600 mt-1">
                    Use at least 12 characters including uppercase, lowercase, a number, and a symbol.
                </p>
            </div>

            <button type="submit" className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-body-medium font-semibold text-white shadow-lg btn-hover">
                Reset password
            </button>
        </form>
    )
}

export default async function Page({ searchParams }: Props) {
    const params = (await searchParams) || {}
    const tokenRaw = params.token
    const emailRaw = params.email
    const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw || ''
    const email = Array.isArray(emailRaw) ? emailRaw[0] : emailRaw || ''
    return <ResetForm token={token} email={email} />
}

