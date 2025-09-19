// import { NextRequest } from "next/server";
// import { toNextJsHandler } from "better-auth/next-js";
//
// export async function GET(req: NextRequest) {
//   const { auth } = await import("@/lib/auth");
//   const { GET } = toNextJsHandler(auth);
//   return GET(req);
// }
//
// export async function POST(req: NextRequest) {
//   const { auth } = await import("@/lib/auth");
//   const { POST } = toNextJsHandler(auth);
//   return POST(req);
// }


// Chatgpt code here
import { NextRequest, NextResponse } from "next/server"
import { toNextJsHandler } from "better-auth/next-js"
import {
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,
} from "@/lib/actions/cart"

export async function GET(req: NextRequest) {
    const { auth } = await import("@/lib/auth")
    const { GET: authGET } = toNextJsHandler(auth)

    const authRes = await authGET(req)
    if (authRes.status !== 200) return authRes

    try {
        const url = new URL(req.url)
        const cartId = url.searchParams.get("cartId") ?? undefined
        const userId = (authRes.headers.get("X-User-Id") as string) ?? undefined

        const cart = await getCart({ userId, cartId })
        return NextResponse.json({ success: true, cart })
    } catch (err: unknown) {
        return NextResponse.json({
            success: false,
            error: (err as Error).message || "Failed to fetch cart",
        }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const { auth } = await import("@/lib/auth")
    const { POST: authPOST } = toNextJsHandler(auth)

    const authRes = await authPOST(req)
    if (authRes.status !== 200) return authRes

    try {
        const body = await req.json()
        const { productVariantId, quantity, cartId } = body
        const userId = (authRes.headers.get("X-User-Id") as string) ?? undefined

        const cart = await addCartItem({ userId, cartId, productVariantId, quantity })
        return NextResponse.json({ success: true, cart })
    } catch (err: unknown) {
        return NextResponse.json({
            success: false,
            error: (err as Error).message || "Failed to add item",
        }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const { auth } = await import("@/lib/auth")
    const { POST: authPOST } = toNextJsHandler(auth)

    const authRes = await authPOST(req)
    if (authRes.status !== 200) return authRes

    try {
        const body = await req.json()
        const { id, quantity } = body
        const cart = await updateCartItem(id, quantity)
        return NextResponse.json({ success: true, cart })
    } catch (err: unknown) {
        return NextResponse.json({
            success: false,
            error: (err as Error).message || "Failed to update item",
        }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const { auth } = await import("@/lib/auth")
    const { POST: authPOST } = toNextJsHandler(auth)

    const authRes = await authPOST(req)
    if (authRes.status !== 200) return authRes

    try {
        const url = new URL(req.url)
        const id = url.searchParams.get("id") ?? undefined
        const action = url.searchParams.get("action") ?? undefined
        const cartId = url.searchParams.get("cartId") ?? undefined

        if (action === "clear") {
            if (!cartId) throw new Error("cartId required to clear cart")
            await clearCart({ cartId })
            return NextResponse.json({ success: true, cart: [] })
        }

        if (!id) {
            return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 })
        }

        const cart = await removeCartItem(id)
        return NextResponse.json({ success: true, cart })
    } catch (err: unknown) {
        return NextResponse.json({
            success: false,
            error: (err as Error).message || "Failed to delete item",
        }, { status: 500 })
    }
}
