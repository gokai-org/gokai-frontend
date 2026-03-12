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

  // Extraer userId del JWT
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
  const userId = payload.userId || payload.sub || payload.id;
  if (!userId) return NextResponse.json({ error: "No se encontró ID de usuario" }, { status: 401 });

  const upstream = await fetch(`${BASE}/users/${userId}/stats/recent-activity`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
