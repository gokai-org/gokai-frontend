import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

const SUBSCRIPTIONS_API_BASE = process.env.GOKAI_SUBSCRIPTIONS_API_BASE || "http://localhost:8084";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rawToken = getTokenFromRequest(req);
    if (!rawToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = normalizeBearerToken(rawToken);

    const { id } = await params;
    const response = await fetch(`${SUBSCRIPTIONS_API_BASE}/subscriptions/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rawToken = getTokenFromRequest(req);
    if (!rawToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = normalizeBearerToken(rawToken);

    const { id } = await params;
    const response = await fetch(`${SUBSCRIPTIONS_API_BASE}/subscriptions/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Error al cancelar suscripción" }, { status: 500 });
  }
}
