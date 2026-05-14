import { NextRequest, NextResponse } from "next/server";

import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { toCamelCase } from "@/shared/lib/utils/case";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

function readUserIdFromToken(token: string) {
  const tokenParts = token.split(".");

  if (tokenParts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
    return payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest) {
  const raw = getTokenFromRequest(_req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const userId = readUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  try {
    const upstream = await fetch(
      `${apiConfig.usersApiBase}/users/${userId}/streaks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const upstreamData = await upstream.json().catch(() => ({}));
    return NextResponse.json(toCamelCase(upstreamData), {
      status: upstream.status,
    });
  } catch (error) {
    console.error("GET /api/users/streaks error:", error);
    return NextResponse.json(
      { error: "Error interno al obtener la racha del usuario" },
      { status: 500 },
    );
  }
}