import { NextRequest } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

export async function GET(req: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const { GET } = toNextJsHandler(auth);
    return GET(req);
  } catch (error) {
    console.error("Auth GET error:", error);
    return new Response(JSON.stringify({ error: "Authentication service unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const { POST } = toNextJsHandler(auth);
    return POST(req);
  } catch (error) {
    console.error("Auth POST error:", error);
    return new Response(JSON.stringify({ error: "Authentication service unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
