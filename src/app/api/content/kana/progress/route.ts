import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

const KANA_PROGRESS_TIMEOUT_MS = 20000;

type RawProgressItem = {
  kanaId?: string;
  kana_id?: string;
  symbol?: string;
  kanaType?: string;
  kana_type?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
  pointsNeeded?: number;
  points_needed?: number;
  exerciseType?: string;
  exercise_type?: string;
  completed?: boolean;
  message?: string;
};

function normalizeProgressItem(raw: RawProgressItem) {
  return {
    kanaId: raw.kanaId ?? raw.kana_id ?? "",
    symbol: raw.symbol ?? "",
    kanaType:
      raw.kanaType === "katakana" || raw.kana_type === "katakana"
        ? "katakana"
        : "hiragana",
    pointsToUnlock: raw.pointsToUnlock ?? raw.points_to_unlock ?? 0,
    pointsNeeded: raw.pointsNeeded ?? raw.points_needed ?? 0,
    exerciseType:
      raw.exerciseType ?? raw.exercise_type ?? "",
    completed: raw.completed === true,
    message: raw.message,
  };
}

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
    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { progress?: unknown[] })?.progress)
        ? (data as { progress: unknown[] }).progress
        : Array.isArray((data as { data?: unknown[] })?.data)
          ? (data as { data: unknown[] }).data
          : data && typeof data === "object" && (
                typeof (data as RawProgressItem).kanaId === "string" ||
                typeof (data as RawProgressItem).kana_id === "string"
              )
            ? [data]
          : [];

    return NextResponse.json(
      items.map((item) => normalizeProgressItem(item as RawProgressItem)),
    );
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