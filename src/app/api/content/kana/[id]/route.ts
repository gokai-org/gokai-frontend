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
  strokes?: string[];
};

function normalizeKana(raw: RawKana) {
  return {
    id: raw.id ?? "",
    symbol: raw.symbol ?? "",
    kanaType: raw.kanaType ?? raw.kana_type ?? "hiragana",
    romaji: raw.romaji ?? "",
    pointsToUnlock: raw.pointsToUnlock ?? raw.points_to_unlock ?? 0,
    viewBox: raw.viewBox ?? raw.view_box,
    strokes: Array.isArray(raw.strokes) ? raw.strokes : [],
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

  const upstream = await fetch(`${apiConfig.contentApiBase}/content/kanas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(normalizeKana(data as RawKana), {
    status: upstream.status,
  });
}