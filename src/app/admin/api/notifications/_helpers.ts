import { NextRequest, NextResponse } from "next/server";
import {
  authorizeAdmin,
  respondWithUpstream,
} from "../_utils";
import { serverNotificationsConfig } from "@/shared/config/serverNotifications";

function buildNotificationsUpstreamUrl(req: NextRequest, base: string, path: string) {
  const normalizedBase = base.replace(/\/$/, "");

  if (normalizedBase.startsWith("/")) {
    return new URL(`${normalizedBase}${path}`, req.url).toString();
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
          "gokai-notifications-api rechazo el JWT del administrador. Si el frontend usa gokai-users de otro entorno y notifications-api corre local, ambos deben compartir el mismo AUTH_JWT_SECRET o apuntar al mismo entorno.",
      },
      { status: 502 },
    );
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "text/plain; charset=utf-8",
    },
  });
}

export async function proxyNotificationDispatch(
  req: NextRequest,
  path: string,
  body?: unknown,
) {
  const auth = authorizeAdmin(req);
  if (!auth.ok) {
    return auth.response;
  }

  const {
    notificationsApiBase,
    missingNotificationsApiBaseMessage,
  } = serverNotificationsConfig;

  if (!notificationsApiBase) {
    return NextResponse.json(
      { error: missingNotificationsApiBaseMessage },
      { status: 500 },
    );
  }

  try {
    const upstream = await fetch(buildNotificationsUpstreamUrl(req, notificationsApiBase, path), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: body == null ? undefined : JSON.stringify(body),
    });

    const mappedAuthError = await mapNotificationsUpstreamAuthError(upstream);
    if (mappedAuthError) {
      return mappedAuthError;
    }

    return respondWithUpstream(upstream);
  } catch (error) {
    console.error(`[POST ${path}]`, error);
    return NextResponse.json(
      {
        error: `No se pudo conectar con gokai-notifications-api usando ${notificationsApiBase}.`,
      },
      { status: 502 },
    );
  }
}