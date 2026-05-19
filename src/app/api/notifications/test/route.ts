import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { serverNotificationsConfig } from "@/shared/config/serverNotifications";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const {
      internalApiKey,
      missingInternalApiKeyMessage,
      notificationsApiBase,
      missingNotificationsApiBaseMessage,
    } = serverNotificationsConfig;

    if (!internalApiKey) {
      return NextResponse.json(
        { error: missingInternalApiKeyMessage },
        { status: 500 },
      );
    }

    if (!notificationsApiBase) {
      return NextResponse.json(
        { error: missingNotificationsApiBaseMessage },
        { status: 500 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | {
          playerId?: unknown;
        }
      | null;

    const playerId =
      typeof body?.playerId === "string" ? body.playerId.trim() : "";

    if (!playerId) {
      return NextResponse.json(
        { error: "playerId es requerido" },
        { status: 400 },
      );
    }

    const sentAt = new Date();
    const message = `Prueba enviada ${sentAt.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const upstream = await fetch(`${notificationsApiBase.replace(/\/$/, "")}/push/`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Gokai-Key": internalApiKey,
      },
      body: JSON.stringify({
        player_ids: [playerId],
        title: "Prueba de notificaciones",
        message,
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => "");

      return NextResponse.json(
        { error: errorText || "No se pudo enviar la notificación de prueba" },
        { status: upstream.status },
      );
    }

    return NextResponse.json({
      success: true,
      title: "Prueba de notificaciones",
      message,
    });
  } catch (error) {
    console.error("[POST /api/notifications/test]", error);
    return NextResponse.json(
      { error: "No se pudo conectar con gokai-notifications-api." },
      { status: 502 },
    );
  }
}