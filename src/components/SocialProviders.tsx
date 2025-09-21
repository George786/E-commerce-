'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { signInWithGoogle, signInWithApple } from "@/lib/auth/actions";
import { Loader2 } from "lucide-react";

type Props = { variant?: "sign-in" | "sign-up" };

export default function SocialProviders({ variant = "sign-in" }: Props) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [availability, setAvailability] = useState<{ googleEnabled: boolean; appleEnabled: boolean } | null>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/providers', { cache: 'no-store' })
        const data = await res.json()
        if (mounted) setAvailability({
          googleEnabled: !!data.googleEnabled,
          appleEnabled: !!data.appleEnabled,
        })
      } catch {
        if (mounted) setAvailability({ googleEnabled: false, appleEnabled: false })
      } finally {
        if (mounted) setLoadingAvailability(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result?.ok && result.url) {
        window.location.href = result.url;
      } else {
        console.error('Google sign in failed:', result?.error);
        alert(result?.error || 'Google sign in is not configured.');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      alert('Google sign in failed. Please try again later.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      const result = await signInWithApple();
      if (result?.ok && result.url) {
        window.location.href = result.url;
      } else {
        console.error('Apple sign in failed:', result?.error);
        alert(result?.error || 'Apple sign in is not configured.');
      }
    } catch (error) {
      console.error('Apple sign in error:', error);
      alert('Apple sign in failed. Please try again later.');
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isAppleLoading || loadingAvailability || availability?.googleEnabled === false}
        className="btn-hover flex w-full items-center justify-center gap-3 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body-medium text-dark-900 hover:bg-light-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`${variant === "sign-in" ? "Continue" : "Sign up"} with Google`}
      >
        {isGoogleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Image src="/google.svg" alt="" width={18} height={18} />
        )}
        <span>{isGoogleLoading ? "Signing in..." : availability?.googleEnabled === false ? "Google unavailable" : "Continue with Google"}</span>
      </button>
      
      <button
        type="button"
        onClick={handleAppleSignIn}
        disabled={isGoogleLoading || isAppleLoading || loadingAvailability || availability?.appleEnabled === false}
        className="btn-hover flex w-full items-center justify-center gap-3 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body-medium text-dark-900 hover:bg-light-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`${variant === "sign-in" ? "Continue" : "Sign up"} with Apple`}
      >
        {isAppleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Image src="/apple.svg" alt="" width={18} height={18} />
        )}
        <span>{isAppleLoading ? "Signing in..." : availability?.appleEnabled === false ? "Apple unavailable" : "Continue with Apple"}</span>
      </button>

      {availability && (!availability.googleEnabled || !availability.appleEnabled) && (
        <p className="text-caption text-dark-600 text-center">
          Some providers are disabled. Ask the site owner to configure OAuth env vars.
        </p>
      )}
    </div>
  );
}
