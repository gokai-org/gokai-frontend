import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { requireKanaContentAccess } from "@/app/api/_utils/kanaContentAccess";
import { normalizeGrammarDetailUnlockCost } from "../grammarUnlockCosts";

export const dynamic = "force-dynamic";

const GRAMMAR_UNLOCK_TIMEOUT_MS = 8000;

/** GET /api/content/grammar/:id — get grammar lesson detail */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await requireKanaContentAccess(req);

  if (access.response) {
    return access.response;
  }

  const { token } = access;

  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/grammar/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await upstream.json().catch(() => ({}));
  const normalizedData =
    upstream.ok && data && typeof data === "object" && !Array.isArray(data)
      ? normalizeGrammarDetailUnlockCost(data as Record<string, unknown>)
      : data;
  return NextResponse.json(normalizedData, { status: upstream.status });
}

/**
 * POST /api/content/grammar/:id?resource=unlock
 * Proxy directo al study-api `POST /grammar/:id` (UnlockGrammar).
 * El backend persiste en `users_unlock_grammar` y descuenta el costo fijo
 * de desbloqueo manual.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await requireKanaContentAccess(req);

  const resource = req.nextUrl.searchParams.get("resource");
  if (resource !== "unlock") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (access.response) {
    return access.response;
  }

  const { token } = access;

  try {
    const upstream = await fetch(`${apiConfig.studyApiBase}/grammar/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(GRAMMAR_UNLOCK_TIMEOUT_MS),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("[API] Error unlocking grammar:", error);
    return NextResponse.json(
      { message: "Error interno al desbloquear gramática", success: false },
      { status: 500 },
    );
  }
}
