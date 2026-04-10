import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

type RawKana = {
  id?: string;
  symbol?: string;
  kanaType?: string;
  kana_type?: string;
  romaji?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
  viewBox?: string;
  view_box?: string;
  strokes?: string | string[];
};

function parseStrokeList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }

  if (typeof raw !== "string") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  } catch {
    return raw.startsWith("M") || raw.startsWith("m") ? [raw] : [];
  }
}

function normalizeKana(raw: RawKana) {
  return {
    id: raw.id ?? "",
    symbol: raw.symbol ?? "",
    kanaType: raw.kanaType ?? raw.kana_type ?? "hiragana",
    romaji: raw.romaji ?? "",
    pointsToUnlock: raw.pointsToUnlock ?? raw.points_to_unlock ?? 0,
    viewBox: raw.viewBox ?? raw.view_box,
    strokes: parseStrokeList(raw.strokes),
  };
}

/**
 * GET /api/content/kana/:id
 * Proxy al backend unificado: GET {BASE}/content/kanas/:id
 * Devuelve el kana completo (incluyendo strokes y viewBox).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const { id } = await params;
  const resource = req.nextUrl.searchParams.get("resource");

  if (resource === "quiz") {
    const upstream = await fetch(`${apiConfig.studyApiBase}/kana/quiz/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await upstream.text().catch(() => "");

    if (!upstream.ok) {
      let data: Record<string, unknown> = {};
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      } catch {
        data = { message: text };
      }

      const defaultMsg =
        upstream.status === 403
          ? "No tienes suficientes puntos para acceder al quiz de este kana"
          : "Error al obtener quiz de kana";

      return NextResponse.json(
        {
          message: data.message || defaultMsg,
          success: false,
          reachable: upstream.status !== 403,
          points:
            typeof data.points === "number" ? data.points : undefined,
          userPoints:
            typeof data.userPoints === "number" ? data.userPoints : undefined,
        },
        { status: upstream.status },
      );
    }

    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data, { status: upstream.status });
  }

  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/kanas/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(normalizeKana(data as RawKana), {
    status: upstream.status,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const { id } = await params;
  const resource = req.nextUrl.searchParams.get("resource");

  if (resource !== "quiz") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  if (
    !body ||
    !body.type ||
    typeof body.score !== "number" ||
    typeof body.duration !== "number"
  ) {
    return NextResponse.json(
      {
        message: "Body invalido: se requiere type, score y duration",
        success: false,
      },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${apiConfig.studyApiBase}/kana/quiz/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: body.type,
      score: body.score,
      duration: body.duration,
    }),
  });

  const text = await upstream.text().catch(() => "");

  if (!upstream.ok) {
    let data: Record<string, unknown> = {};
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = { message: text };
    }

    return NextResponse.json(
      {
        message: data.message || "Error al enviar resultado del quiz",
        success: false,
      },
      { status: upstream.status },
    );
  }

  try {
    return NextResponse.json(text ? JSON.parse(text) : { success: true }, {
      status: upstream.status,
    });
  } catch {
    return NextResponse.json({ success: true }, { status: upstream.status });
  }
}
