import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";

const SUBSCRIPTIONS_API_BASE = process.env.GOKAI_SUBSCRIPTIONS_API_BASE || "http://localhost:8084";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const response = await fetch(`${SUBSCRIPTIONS_API_BASE}/subscriptions/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || "Error al obtener suscripción" }, { status: response.status });
    }

    const subscription = await response.json();
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}