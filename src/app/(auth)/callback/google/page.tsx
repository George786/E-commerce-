import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function GoogleCallback() {
  return (
    <Suspense fallback={<div>Processing Google authentication...</div>}>
      <GoogleCallbackHandler />
    </Suspense>
  )
}

async function GoogleCallbackHandler() {
  // The actual OAuth callback handling is done by Better Auth
  // This page just redirects to the home page after successful authentication
  redirect('/')
  return null // Add explicit return for JSX component
}
