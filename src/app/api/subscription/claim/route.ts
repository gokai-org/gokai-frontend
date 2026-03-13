import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

const SUBSCRIPTIONS_API_BASE =
  process.env.GOKAI_SUBSCRIPTIONS_API_BASE || "http://localhost:8084";

export async function POST(req: NextRequest) {
  try {
    const rawToken = getTokenFromRequest(req);
    if (!rawToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = normalizeBearerToken(rawToken);
    const body = await req.json().catch(() => ({}));
    const code = String(body.code ?? "").trim();

    if (!code) {
      return NextResponse.json(
        { error: "El código de cupón es requerido" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${SUBSCRIPTIONS_API_BASE}/subscriptions/claim`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      },
    );

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error claiming coupon:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
