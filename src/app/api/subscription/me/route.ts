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

    const response = await fetch(
      `${apiConfig.subscriptionsApiBase}/subscriptions/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Error al obtener suscripción" },
        { status: response.status },
      );
    }

    const subscription = await response.json();
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
