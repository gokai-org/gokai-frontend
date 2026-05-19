import { NextRequest, NextResponse } from "next/server";
import {
  authorizeAdmin,
  respondWithUpstream,
} from "../_utils";
import { serverNotificationsConfig } from "@/shared/config/serverNotifications";

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

  try {
    const upstream = await fetch(`${notificationsApiBase.replace(/\/$/, "")}${path}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Gokai-Key": internalApiKey,
      },
      body: body == null ? undefined : JSON.stringify(body),
    });

    return respondWithUpstream(upstream);
  } catch (error) {
    console.error(`[POST ${path}]`, error);
    return NextResponse.json(
      {
        error: `No se pudo conectar con gokai-notifications-api en ${notificationsApiBase}.`,
      },
      { status: 502 },
    );
  }
}