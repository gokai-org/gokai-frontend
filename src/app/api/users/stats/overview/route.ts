import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { toCamelCase } from "@/shared/lib/utils/case";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

const VALID_PERIODS = new Set(["week", "month", "all"]);

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

  const period = req.nextUrl.searchParams.get("period") || "week";

  if (!VALID_PERIODS.has(period)) {
    return NextResponse.json(
      {
        error: `Parámetro 'period' inválido: "${period}". Valores permitidos: week, month, all`,
      },
      { status: 400 },
    );
  }

  const upstream = await fetch(
    `${apiConfig.usersApiBase}/users/${userId}/stats/overview?period=${period}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const upstreamData = await upstream.json().catch(() => ({}));
  const data = toCamelCase(upstreamData);

  return NextResponse.json(data, { status: upstream.status });
}
