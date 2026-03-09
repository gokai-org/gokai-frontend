import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";

const BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

/** GET /api/user/stats/recent-activity
 *  Proxy → GET {USERS_API_BASE}/users/stats/recent-activity
 *  Retorna: { activities: [...] }
 */
export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);
  if (!raw) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const token = normalizeBearerToken(raw);

  const upstream = await fetch(`${BASE}/users/stats/recent-activity`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
