import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";

const BASE = process.env.GOKAI_CONTENT_API_BASE!;

/**
 * GET /api/content/kana?kana_type=hiragana|katakana
 * Proxy al backend unificado: GET {BASE}/content/kana?kana_type=…
 */
export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);
  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const kanaType = req.nextUrl.searchParams.get("kana_type") ?? "";

  const url = new URL(`${BASE}/content/kana`);
  if (kanaType) {
    url.searchParams.set("kana_type", kanaType);
  }

  const upstream = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

/**
 * POST /api/content/kana
 * Proxy al backend unificado: POST {BASE}/content/kana
 */
export async function POST(req: NextRequest) {
  const raw = getTokenFromRequest(req);
  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const body = await req.json();

  const upstream = await fetch(`${BASE}/content/kana`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
