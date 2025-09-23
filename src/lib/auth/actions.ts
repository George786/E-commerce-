'use server'

import { cookies, headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { guests } from "@/lib/db/schema/index"
import { and, eq, lt } from "drizzle-orm"
import { randomUUID } from "crypto"
// import { mergeGuestCart } from "@/lib/actions/cart" // Not used for now

const COOKIE_OPTIONS = {
    httpOnly: true as const,
    secure: true as const,
    sameSite: "strict" as const,
    path: "/" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
}

const emailSchema = z.string().email()
// Strong password for sign-up: 12+ chars, upper, lower, number, symbol
const passwordSignUpSchema = z
    .string()
    .min(12, { message: "Password must be at least 12 characters long" })
    .max(128, { message: "Password must be at most 128 characters long" })
    .refine((value: string) => /[a-z]/.test(value), { message: "Include at least one lowercase letter" })
    .refine((value: string) => /[A-Z]/.test(value), { message: "Include at least one uppercase letter" })
    .refine((value: string) => /\d/.test(value), { message: "Include at least one number" })
    .refine((value: string) => /[^A-Za-z0-9]/.test(value), { message: "Include at least one symbol" })

// Looser check for sign-in: any non-empty string
const passwordSignInSchema = z.string().min(1, { message: "Password is required" })

const nameSchema = z.string().min(1).max(100)

export async function createGuestSession() {
    const cookieStore = await cookies()
    const existing = cookieStore.get("guest_session")
    if (existing?.value) return { ok: true, sessionToken: existing.value }

    const sessionToken = randomUUID()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + COOKIE_OPTIONS.maxAge * 1000)

    await db.insert(guests).values({ sessionToken, expiresAt })
    cookieStore.set("guest_session", sessionToken, COOKIE_OPTIONS)
    return { ok: true, sessionToken }
}

export async function guestSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get("guest_session")?.value
    if (!token) return { sessionToken: null }

    const now = new Date()
    await db.delete(guests).where(and(eq(guests.sessionToken, token), lt(guests.expiresAt, now)))
    return { sessionToken: token }
}

const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSignUpSchema,
    name: nameSchema,
})

export async function signUp(formData: FormData) {
    try {
        const rawData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        }

        const data = signUpSchema.parse(rawData)
        const res = await auth.api.signUpEmail({
            body: { email: data.email, password: data.password, name: data.name },
        })

        if (!res.user) {
            return { ok: false, error: "Failed to create account. This email may already be registered." }
        }

        await migrateGuestToUser(res.user.id)
        return { ok: true, userId: res.user.id }
    } catch (error) {
        console.error("Sign up error:", error)
        
        if (error instanceof z.ZodError) {
            const fieldErrors = error.issues.map(err => err.message).join(", ")
            return { ok: false, error: `Please check your input: ${fieldErrors}` }
        }
        
        return { ok: false, error: "Failed to create account. This email may already be registered or there was a server error." }
    }
}

const signInSchema = z.object({
    email: emailSchema,
    password: passwordSignInSchema,
})

export async function signIn(formData: FormData) {
    try {
        const rawData = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        }

        const data = signInSchema.parse(rawData)
        const res = await auth.api.signInEmail({ body: { email: data.email, password: data.password } })

        if (!res.user) {
            return { ok: false, error: "Invalid email or password. Please check your credentials and try again." }
        }

        await migrateGuestToUser(res.user.id)
        return { ok: true, userId: res.user.id }
    } catch (error) {
        console.error("Sign in error:", error)
        
        if (error instanceof z.ZodError) {
            return { ok: false, error: "Please enter a valid email and password." }
        }
        
        return { ok: false, error: "Invalid email or password. Please check your credentials and try again." }
    }
}

export async function requestPasswordReset(formData: FormData) {
    try {
        const rawData = {
            email: formData.get("email") as string,
        }

        const { email } = z.object({ email: emailSchema }).parse(rawData)

        // TODO: Integrate with auth provider's reset API when available
        // For now, respond generically to avoid account enumeration
        return { ok: true, message: "If an account exists, a reset link will be sent." }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const fieldErrors = error.issues.map(err => err.message).join(", ")
            return { ok: false, error: `Please check your input: ${fieldErrors}` }
        }
        return { ok: true, message: "If an account exists, a reset link will be sent." }
    }
}

export async function getCurrentUser() {
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        return session?.user ?? null
    } catch {
        // Silently handle auth errors - user is not logged in
        return null
    }
}

export async function signOut() {
    try {
        await auth.api.signOut({ headers: await headers() })
        return { ok: true }
    } catch {
        // Silently handle sign out errors
        return { ok: true }
    }
}

export async function signInWithGoogle() {
    try {
        const res = await auth.api.signInSocial({
            body: {
                provider: "google",
                callbackURL: process.env.NEXT_PUBLIC_APP_URL + "/auth/callback/google"
            }
        })
        
        if (res.url) {
            return { ok: true, url: res.url }
        }
        
        return { ok: false, error: "Failed to initiate Google sign in" }
    } catch (error) {
        console.error("Google sign in error:", error)
        return { ok: false, error: "Failed to sign in with Google" }
    }
}

export async function signInWithApple() {
    try {
        const res = await auth.api.signInSocial({
            body: {
                provider: "apple",
                callbackURL: process.env.NEXT_PUBLIC_APP_URL + "/auth/callback/apple"
            }
        })
        
        if (res.url) {
            return { ok: true, url: res.url }
        }
        
        return { ok: false, error: "Failed to initiate Apple sign in" }
    } catch (error) {
        console.error("Apple sign in error:", error)
        return { ok: false, error: "Failed to sign in with Apple" }
    }
}

// ==================== Guest Cart ====================

export interface GuestCartItem {
    id: string
    productVariantId: string
    quantity: number
    product?: unknown
    variant?: unknown
}

// Guest cart functionality moved to use existing API routes

/**
 * Migrate guest cart to user cart after login/signup
 */
async function migrateGuestToUser(userId?: string) {
    if (!userId) return
    const cookieStore = await cookies()
    const guestSessionId = cookieStore.get("guest_session")?.value
    if (!guestSessionId) return

    try {
        // For now, just clear the guest session
        // Cart merging can be implemented later when database is properly set up
        cookieStore.delete("guest_session")
    } catch (error) {
        console.error('Failed to migrate guest cart:', error)
        // Don't throw error to prevent login failure
    }
}

/**
 * Public method to merge guest cart explicitly
 */
export async function mergeGuestCartWithUserCart(userId: string) {
    await migrateGuestToUser(userId)
    return { ok: true }
}
