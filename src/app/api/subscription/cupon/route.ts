import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export async function GET(req: NextRequest) {
  try {
    const rawToken = getTokenFromRequest(req);

    if (!rawToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = normalizeBearerToken(rawToken);
    const valid = req.nextUrl.searchParams.get("valid");
    const query = valid !== null ? `?valid=${encodeURIComponent(valid)}` : "";

    const response = await fetch(
      `${apiConfig.subscriptionsApiBase}/subscriptions/cupon${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json().catch(() => []);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}