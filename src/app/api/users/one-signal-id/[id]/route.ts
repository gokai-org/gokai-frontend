import { NextRequest, NextResponse } from "next/server";
import { getBearerTokenFromRequest, getUserIdFromToken } from "@/app/api/_utils/auth";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = getBearerTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const tokenUserId = getUserIdFromToken(token);
    const { id } = await params;

    if (!tokenUserId || tokenUserId !== id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as
      | { providerId?: unknown }
      | null;

    const providerId =
      typeof body?.providerId === "string" ? body.providerId.trim() : "";

    if (!providerId) {
      return NextResponse.json(
        { error: "providerId es requerido" },
        { status: 400 },
      );
    }

    const upstream = await fetch(`${apiConfig.usersApiBase}/users/one-signal-id/${id}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ providerId }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => "");

      return NextResponse.json(
        { error: errorText || "No se pudo guardar el providerId" },
        { status: upstream.status },
      );
    }

    return NextResponse.json({ success: true }, { status: upstream.status });
  } catch (error) {
    console.error("[PUT /api/users/one-signal-id/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}