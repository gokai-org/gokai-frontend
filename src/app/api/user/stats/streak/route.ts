import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { toCamelCase } from "@/shared/lib/utils/case";

export const dynamic = "force-dynamic";

const BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

export async function GET(req: NextRequest) {
  const rawToken = getTokenFromRequest(req);
  if (!rawToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(rawToken);

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
  const userId = payload.userId || payload.sub || payload.id;

  if (!userId) {
    return NextResponse.json(
      { error: "No se encontró ID de usuario" },
      { status: 401 },
    );
  }

  const weeksParam = req.nextUrl.searchParams.get("weeks") || "12";
  const weeks = Number(weeksParam);

  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
    return NextResponse.json(
      {
        error: `Parámetro 'weeks' inválido: "${weeksParam}". Debe ser un entero entre 1 y 52`,
      },
      { status: 400 },
    );
  }

  const upstream = await fetch(
    `${BASE}/users/${userId}/stats/streak?weeks=${weeks}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const upstreamData = await upstream.json().catch(() => ({}));
  const data = toCamelCase(upstreamData);

  return NextResponse.json(data, { status: upstream.status });
}
