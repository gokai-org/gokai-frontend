import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

function parseTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64").toString());
  } catch {
    return null;
  }
}

function buildHeaders(token: string, payload: Record<string, unknown> | null) {
  const userId =
    (payload?.userId as string | undefined) ??
    (payload?.sub as string | undefined) ??
    (payload?.id as string | undefined);
  const email = (payload?.email as string | undefined) ?? undefined;

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(userId ? { "X-User-Id": userId } : {}),
    ...(email ? { "X-User-Email": email } : {}),
  };
}

async function readJsonSafe(response: Response) {
  return response.json().catch(async () => {
    const text = await response.text().catch(() => "");
    return text ? { error: text } : {};
  });
}

export async function GET(req: NextRequest) {
  try {
    const rawToken = getTokenFromRequest(req);

    if (!rawToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = normalizeBearerToken(rawToken);
    const payload = parseTokenPayload(token);
    const userId =
      (payload?.userId as string | undefined) ??
      (payload?.sub as string | undefined) ??
      (payload?.id as string | undefined);

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const headers = buildHeaders(token, payload);

    const response = await fetch(
      `${apiConfig.subscriptionsApiBase}/subscriptions/${userId}`,
      {
        method: "GET",
        headers,
      },
    );

    const data = await readJsonSafe(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            (data as { error?: string })?.error ||
            "Error al obtener suscripción",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
