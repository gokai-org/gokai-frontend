import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";
import { normalizeKanaProgressPayload } from "@/app/api/_utils/kanaProgress";

export const dynamic = "force-dynamic";

const KANA_PROGRESS_TIMEOUT_MS = 20000;

function isTransientUpstreamFetchError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === "AbortError" || error.name === "TimeoutError") {
    return true;
  }

  const cause = "cause" in error ? error.cause : null;
  if (
    cause &&
    typeof cause === "object" &&
    "code" in cause &&
    (cause as { code?: string }).code === "UND_ERR_SOCKET"
  ) {
    return true;
  }

  return /fetch failed|other side closed/i.test(error.message);
}

export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  try {
    const upstream = await fetch(`${apiConfig.studyApiBase}/kana/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(KANA_PROGRESS_TIMEOUT_MS),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = JSON.parse(text) as Record<string, unknown>;
      } catch {
        errorData = { message: text };
      }

      return NextResponse.json(
        {
          message: errorData.message || "Error al obtener progreso de kana",
          success: false,
        },
        { status: upstream.status },
      );
    }

    const data: unknown = text ? JSON.parse(text) : [];

    return NextResponse.json(normalizeKanaProgressPayload(data));
  } catch (error) {
    if (isTransientUpstreamFetchError(error)) {
      return NextResponse.json(
        { message: "Servicio de progreso temporalmente no disponible", success: false },
        {
          status: 503,
          headers: { "x-upstream-degraded": "study-kana-progress" },
        },
      );
    }

    return NextResponse.json(
      { message: "Error interno al obtener progreso de kana", success: false },
      { status: 500 },
    );
  }
}