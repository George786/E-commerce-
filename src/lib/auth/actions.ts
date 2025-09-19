"use server";

import {cookies, headers} from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { guests } from "@/lib/db/schema/index";
import { and, eq, lt } from "drizzle-orm";
import { randomUUID } from "crypto";
import { mergeGuestCart } from '@/lib/actions/cart'

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: true as const,
  sameSite: "strict" as const,
  path: "/" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().min(1).max(100);

export async function createGuestSession() {
  const cookieStore = await cookies();
  const existing = (await cookieStore).get("guest_session");
  if (existing?.value) {
    return { ok: true, sessionToken: existing.value };
  }

  const sessionToken = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + COOKIE_OPTIONS.maxAge * 1000);

  await db.insert(guests).values({
    sessionToken,
    expiresAt,
  });

  (await cookieStore).set("guest_session", sessionToken, COOKIE_OPTIONS);
  return { ok: true, sessionToken };
}

export async function guestSession() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("guest_session")?.value;
  if (!token) {
    return { sessionToken: null };
  }
  const now = new Date();
  await db
    .delete(guests)
    .where(and(eq(guests.sessionToken, token), lt(guests.expiresAt, now)));

  return { sessionToken: token };
}

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export async function signUp(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const data = signUpSchema.parse(rawData);

  const res = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
    },
  });

  await migrateGuestToUser();
  return { ok: true, userId: res.user?.id };
}

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export async function signIn(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const data = signInSchema.parse(rawData);

  const res = await auth.api.signInEmail({
    body: {
      email: data.email,
      password: data.password,
    },
  });

  await migrateGuestToUser();
  return { ok: true, userId: res.user?.id };
}

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    return session?.user ?? null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function signOut() {
  await auth.api.signOut({ headers: {} });
  return { ok: true };
}

export async function mergeGuestCartWithUserCart() {
  await migrateGuestToUser();
  return { ok: true };
}

async function migrateGuestToUser() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("guest_session")?.value;
  if (!token) return;

  await db.delete(guests).where(eq(guests.sessionToken, token));
  (await cookieStore).delete("guest_session");
}



// chatgpt code.....

export interface GuestCartItem {
    productVariantId: string
    quantity: number
}

/**
 * Load guest cart from cookies by session ID
 */
export async function getGuestCart(guestSessionId: string): Promise<GuestCartItem[]> {
    const cookieStore = await cookies()
    const cartCookie = cookieStore.get(`guest_cart_${guestSessionId}`)?.value

    if (!cartCookie) return []

    try {
        const guestCart: GuestCartItem[] = JSON.parse(cartCookie)
        // Optional: validate structure
        if (!Array.isArray(guestCart)) return []
        return guestCart.map(item => ({
            productVariantId: String(item.productVariantId),
            quantity: Number(item.quantity),
        }))
    } catch (err) {
        console.error('Failed to parse guest cart cookie', err)
        return []
    }
}





export async function onSuccessfulLogin(userId: string) {
    const cookieStore = await cookies()
    const guestSessionId = cookieStore.get('guest_session')?.value
    if (guestSessionId) {
        const guestCart = await getGuestCart(guestSessionId)
        await mergeGuestCart(guestCart)
        cookieStore.delete('guest_session')
    }
}
