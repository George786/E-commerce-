import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AppleCallback() {
  return (
    <Suspense fallback={<div>Processing Apple authentication...</div>}>
      <AppleCallbackHandler />
    </Suspense>
  )
}

async function AppleCallbackHandler() {
  // The actual OAuth callback handling is done by Better Auth
  // This page just redirects to the home page after successful authentication
  redirect('/')
  return null // Add explicit return for JSX component
}
