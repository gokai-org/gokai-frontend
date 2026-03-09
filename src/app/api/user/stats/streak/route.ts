import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";

const BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

/** GET /api/user/stats/streak?weeks=12
 *  Proxy → GET {USERS_API_BASE}/users/stats/streak?weeks=...
 *
 *  Parámetros:
 *    weeks  – entero 1–52 (default: 12)
 *
 *  Retorna: { streak_days: Record<string, number>, current_streak, longest_streak }
 *
 *  Errores:
 *    400  – weeks no es un entero válido (1–52)
 *    401  – token ausente o expirado
 */
export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);
  if (!raw) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const token = normalizeBearerToken(raw);
  const weeksParam = req.nextUrl.searchParams.get("weeks") || "12";
  const weeks = Number(weeksParam);

  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
    return NextResponse.json(
      { error: `Parámetro 'weeks' inválido: "${weeksParam}". Debe ser un entero entre 1 y 52` },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${BASE}/users/stats/streak?weeks=${weeks}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
