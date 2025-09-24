'use server'

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { guests, verifications, users } from "@/lib/db/schema/index"
import { and, eq, lt } from "drizzle-orm"
import { randomUUID } from "crypto"
import nodemailer from 'nodemailer' // treated as any per your d.ts

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: true as const,
  sameSite: "strict" as const,
  path: "/" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

const emailSchema = z.string().email()
const passwordSignUpSchema = z
  .string()
  .min(12, { message: "Password must be at least 12 characters long" })
  .max(128, { message: "Password must be at most 128 characters long" })
  .refine((v) => /[a-z]/.test(v), { message: "Include at least one lowercase letter" })
  .refine((v) => /[A-Z]/.test(v), { message: "Include at least one uppercase letter" })
  .refine((v) => /\d/.test(v), { message: "Include at least one number" })
  .refine((v) => /[^A-Za-z0-9]/.test(v), { message: "Include at least one symbol" })

const passwordSignInSchema = z.string().min(1, { message: "Password is required" })
const nameSchema = z.string().min(1).max(100)

export async function createGuestSession() {
  const cookieStore = await cookies()
  const existing = cookieStore.get("guest_session")
  if (existing?.value) return { ok: true, sessionToken: existing.value }

  const sessionToken = randomUUID()
  const expiresAt = new Date(Date.now() + COOKIE_OPTIONS.maxAge * 1000)

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
      return { ok: false, error: "Failed to create account. Email may be registered." }
    }

    await migrateGuestToUser(res.user.id)
    return { ok: true, userId: res.user.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(i => i.message).join(", ")
      return { ok: false, error: `Input error: ${errors}` }
    }
    console.error("Sign up error:", error)
    return { ok: false, error: "Failed to create account." }
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
      return { ok: false, error: "Invalid email or password." }
    }

    await migrateGuestToUser(res.user.id)
    return { ok: true, userId: res.user.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, error: "Invalid input." }
    }
    console.error("Sign in error:", error)
    return { ok: false, error: "Invalid email or password." }
  }
}

export async function requestPasswordReset(formData: FormData) {
  const raw = { email: formData.get('email') as string }
  let email: string

  try {
    email = z.object({ email: emailSchema }).parse(raw).email
  } catch {
    return redirect('/forgot-password?error=invalid-input')
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (!existing?.[0]) return redirect('/forgot-password?error=not-registered')

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 mins
  await db.insert(verifications).values({ identifier: email, value: token, expiresAt })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Reset your password',
        html: `<p>Reset link (valid 30 min): <a href="${resetUrl}">${resetUrl}</a></p>`,
      })
    } else {
      throw new Error('SMTP not configured')
    }
  } catch {
    try {
      const testAccount = await nodemailer.createTestAccount()
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      })
      const info = await transporter.sendMail({
        from: 'no-reply@example.com',
        to: email,
        subject: 'Reset your password',
        html: `<p>Reset link (valid 30 min): <a href="${resetUrl}">${resetUrl}</a></p>`,
      })
      console.log('Ethereal preview URL:', nodemailer.getTestMessageUrl?.(info))
    } catch (etherealErr) {
      console.error('SMTP and Ethereal both failed:', etherealErr)
    }
  }

  return redirect('/forgot-password?sent=1')
}

const resetSchema = z.object({
  email: emailSchema,
  token: z.string().min(1),
  password: passwordSignUpSchema,
})

export async function resetPassword(formData: FormData) {
  try {
    const raw = {
      email: formData.get('email') as string,
      token: formData.get('token') as string,
      password: formData.get('password') as string,
    }
    const data = resetSchema.parse(raw)

    const now = new Date()
    const record = await db.select().from(verifications)
      .where(and(eq(verifications.identifier, data.email), eq(verifications.value, data.token)))
      .limit(1)

    const match = record?.[0]
    if (!match || match.expiresAt < now) {
      return { ok: false, error: 'Reset link invalid or expired.' }
    }

    // TODO: Implement password update with your auth system
    console.log(`Password reset requested for ${data.email}, new password: ${data.password}`)

    await db.delete(verifications).where(and(eq(verifications.identifier, data.email), eq(verifications.value, data.token)))

    return { ok: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, error: error.issues.map(i => i.message).join(", ") }
    }
    return { ok: false, error: "Failed to reset password." }
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user ?? null
  } catch {
    return null
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({ headers: await headers() })
    return { ok: true }
  } catch {
    return { ok: true }
  }
}

export async function signInWithGoogle() {
  try {
    const res = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/google`,
      }
    })
    if (res.url) return { ok: true, url: res.url }
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
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/apple`,
      }
    })
    if (res.url) return { ok: true, url: res.url }
    return { ok: false, error: "Failed to initiate Apple sign in" }
  } catch (error) {
    console.error("Apple sign in error:", error)
    return { ok: false, error: "Failed to sign in with Apple" }
  }
}

async function migrateGuestToUser(userId?: string) {
  if (!userId) return
  const cookieStore = await cookies()
  const guestSessionId = cookieStore.get("guest_session")?.value
  if (!guestSessionId) return

  try {
    // Currently just clearing guest_session cookie
    cookieStore.delete("guest_session")
  } catch (error) {
    console.error("Failed to migrate guest cart:", error)
  }
}

export async function mergeGuestCartWithUserCart(userId: string) {
  await migrateGuestToUser(userId)
  return { ok: true }
}
