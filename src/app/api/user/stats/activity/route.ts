import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";

const BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

/** GET /api/user/stats/activity
 *  Proxy → GET {USERS_API_BASE}/users/stats/activity
 *  Retorna: { weekly: WeeklyActivityEntry[], monthly: MonthlyProgressEntry[] }
 *
 *  El endpoint siempre devuelve ambas vistas (weekly + monthly).
 *  No recibe parámetros de período.
 */
export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);
  if (!raw) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const token = normalizeBearerToken(raw);

  const upstream = await fetch(`${BASE}/users/stats/activity`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
