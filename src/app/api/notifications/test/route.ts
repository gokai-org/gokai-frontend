import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { serverNotificationsConfig } from "@/shared/config/serverNotifications";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";

function buildNotificationsUpstreamUrl(request: NextRequest, base: string, path: string) {
  const normalizedBase = base.replace(/\/$/, "");

  if (normalizedBase.startsWith("/")) {
    return new URL(`${normalizedBase}${path}`, request.url).toString();
  }

  return `${normalizedBase}${path}`;
}

async function mapNotificationsUpstreamAuthError(upstream: Response) {
  if (upstream.status !== 401) {
    return null;
  }

  const text = await upstream.text().catch(() => "");
  const normalized = text.trim().toLowerCase();

  if (
    normalized.includes("invalid token") ||
    normalized.includes("token is expired") ||
    normalized.includes("token has invalid claims")
  ) {
    return NextResponse.json(
      {
        error:
          "gokai-notifications-api rechazo el JWT del usuario. Si estas mezclando servicios locales con servicios remotos, alinea AUTH_JWT_SECRET o usa el mismo entorno para login y notificaciones.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { error: text || "No se pudo enviar la notificación de prueba" },
    { status: upstream.status },
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawToken = getTokenFromRequest(request);
    const token = rawToken ? normalizeBearerToken(rawToken) : null;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { notificationsApiBase, missingNotificationsApiBaseMessage } =
      serverNotificationsConfig;

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

    const upstream = await fetch(buildNotificationsUpstreamUrl(request, notificationsApiBase, "/push/"), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        player_ids: [playerId],
        title: "Prueba de notificaciones",
        message,
      }),
    });

    if (!upstream.ok) {
      const mappedAuthError = await mapNotificationsUpstreamAuthError(upstream);
      if (mappedAuthError) {
        return mappedAuthError;
      }
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