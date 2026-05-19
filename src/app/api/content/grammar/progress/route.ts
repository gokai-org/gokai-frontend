import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { requireKanaContentAccess } from "@/app/api/_utils/kanaContentAccess";

export const dynamic = "force-dynamic";

/**
 * GET /api/content/grammar/progress
 * Proxy directo al study-api `GET /grammar/progress` (GetUserGrammarProgress).
 * Retorna `{ hasUnlocked: false }` si el usuario aún no ha desbloqueado
 * ninguna lección, o `{ grammarId, title, pointsToUnlock, completed }`
 * con la lección desbloqueada más avanzada.
 */
export async function GET(req: NextRequest) {
  const access = await requireKanaContentAccess(req);

  if (access.response) {
    return access.response;
  }

  const { token } = access;

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