import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { carts, cartItems, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ✅ GET: fetch cart
export async function GET() {
    try {
        const cookieStore = await cookies();
        const cartId = cookieStore.get("cartId")?.value;

        if (!cartId) {
            return NextResponse.json({ success: true, cart: { items: [] } });
        }

        const cart = await db.query.carts.findFirst({
            where: eq(carts.id, cartId),
            with: {
                items: {
                    with: {
                        variant: {
                            with: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, cart });
    } catch (err: unknown) {
        console.error("Cart GET error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to fetch cart" },
            { status: 500 }
        );
    }
}

// ✅ POST: add item
export async function POST(req: NextRequest) {
    try {
        const { productVariantId, quantity } = await req.json();

        if (!productVariantId || !quantity) {
            return NextResponse.json(
                { success: false, error: "Missing productVariantId or quantity" },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        let cartId = cookieStore.get("cartId")?.value;

        if (!cartId) {
            // create a new cart if none exists
            const [newCart] = await db
                .insert(carts)
                .values({})
                .returning({ id: carts.id });
            cartId = newCart.id;

            cookieStore.set("cartId", cartId, {
                httpOnly: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });
        }

        // upsert logic
        const existingItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.productVariantId, productVariantId),
        });

        if (existingItem) {
            await db
                .update(cartItems)
                .set({ quantity: existingItem.quantity + quantity })
                .where(eq(cartItems.id, existingItem.id));
        } else {
            await db.insert(cartItems).values({
                cartId,
                productVariantId,
                quantity,
            });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Cart POST error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to add item" },
            { status: 500 }
        );
    }
}

// ✅ PUT: update item quantity
export async function PUT(req: NextRequest) {
    try {
        const { id, quantity } = await req.json();

        if (!id || typeof quantity !== "number") {
            return NextResponse.json(
                { success: false, error: "Missing id or quantity" },
                { status: 400 }
            );
        }

        await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Cart PUT error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to update item" },
            { status: 500 }
        );
    }
}

// ✅ DELETE: remove item or clear cart
export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        const action = url.searchParams.get("action");
        const cookieStore = await cookies();
        const cartId = cookieStore.get("cartId")?.value;

        if (action === "clear") {
            if (!cartId) {
                return NextResponse.json(
                    { success: false, error: "No cartId found" },
                    { status: 400 }
                );
            }
            await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
            return NextResponse.json({ success: true });
        }

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing id" },
                { status: 400 }
            );
        }

        await db.delete(cartItems).where(eq(cartItems.id, id));

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Cart DELETE error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to delete item" },
            { status: 500 }
        );
    }
}
