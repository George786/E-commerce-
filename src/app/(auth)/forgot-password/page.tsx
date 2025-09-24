import { requestPasswordReset } from '@/lib/auth/actions'

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = 'force-dynamic'

function FormInner({ sent, error }: { sent: boolean; error: string | null }) {
  async function action(formData: FormData) {
    'use server'
    await requestPasswordReset(formData)
  }

  return (
    <>
      {sent && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
          <p className="text-body text-green-800">
            If an account exists, we&apos;ve sent reset instructions.
          </p>
        </div>
      )}
      {error === 'not-registered' && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
          <p className="text-body text-red-800">
            This email is not registered. Please try again with a correct email.
          </p>
        </div>
      )}
      {error && error !== 'not-registered' && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
          <p className="text-body text-red-800">
            We couldn&apos;t process your request. Please try again.
          </p>
        </div>
      )}
      <form action={action} className="space-y-6">
        <div className="text-center">
          <h1 className="text-heading-2">Reset your password</h1>
          <p className="mt-2 text-body text-dark-700">
            Enter your email and we&apos;ll send reset instructions.
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-body-medium text-dark-900 font-medium"
          >
            Email Address
          </label>
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
          disabled={sent}
          aria-disabled={sent}
          className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-body-medium font-semibold text-white shadow-lg btn-hover disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sent ? 'Reset link sent' : 'Send reset link'}
        </button>
      </form>
    </>
  )
}

export default async function Page({ searchParams }: Props) {
  const params = (await searchParams) || {}
  const raw = params.sent
  const sent = Array.isArray(raw) ? raw[0] === '1' : raw === '1'
  const errRaw = params.error
  const error = Array.isArray(errRaw) ? errRaw[0] : (errRaw as string | undefined) || null
  return <FormInner sent={Boolean(sent)} error={error} />
}
