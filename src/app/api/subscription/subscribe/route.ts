import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export async function POST(req: NextRequest) {
  try {
    const rawToken = getTokenFromRequest(req);

    if (!rawToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = normalizeBearerToken(rawToken);
    const { priceId, successUrl } = await req.json();

    const res = await fetch(
      `${apiConfig.subscriptionsApiBase}/subscriptions/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId, successUrl }),
        credentials: "include",
      },
    );

    if (res.redirected) {
      return NextResponse.redirect(res.url);
    }

    const data = await res.json();

    if (data.url) {
      return NextResponse.json({ url: data.url });
    }

    return NextResponse.json(
      { error: data.error || "Error al crear sesión de pago" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Error de red o formato" },
      { status: 500 },
    );
  }
}
