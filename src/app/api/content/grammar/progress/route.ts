import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/content/grammar/progress
 * Proxy directo al study-api `GET /grammar/progress` (GetUserGrammarProgress).
 * Retorna `{ hasUnlocked: false }` si el usuario aún no ha desbloqueado
 * ninguna lección, o `{ grammarId, title, pointsToUnlock, completed }`
 * con la lección desbloqueada más avanzada.
 */
export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  const upstream = await fetch(`${apiConfig.studyApiBase}/grammar/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}