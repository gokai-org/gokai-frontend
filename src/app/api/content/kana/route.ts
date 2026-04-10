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

type RawKanaListResponse = {
  hiragana?: RawKana[];
  katakana?: RawKana[];
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

function normalizeKanaBody(body: unknown) {
  if (!body || typeof body !== "object") return body;

  const input = body as Record<string, unknown>;
  return {
    id: typeof input.id === "string" ? input.id : undefined,
    symbol: typeof input.symbol === "string" ? input.symbol : "",
    kanaType:
      typeof input.kanaType === "string"
        ? input.kanaType
        : typeof input.kana_type === "string"
          ? input.kana_type
          : "",
    romaji: typeof input.romaji === "string" ? input.romaji : "",
    pointsToUnlock:
      typeof input.pointsToUnlock === "number"
        ? input.pointsToUnlock
        : typeof input.points_to_unlock === "number"
          ? input.points_to_unlock
          : 0,
    viewBox:
      typeof input.viewBox === "string"
        ? input.viewBox
        : typeof input.view_box === "string"
          ? input.view_box
          : "",
    strokes: parseStrokeList(input.strokes),
  };
}

/**
 * GET /api/content/kana?kana_type=hiragana|katakana
 */
export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const kanaType = req.nextUrl.searchParams.get("kana_type") ?? "";

  const upstream = await fetch(`${apiConfig.contentApiBase}/content/kanas`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const rawData = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(rawData, { status: upstream.status });
  }

  const data = rawData as RawKanaListResponse | RawKana[];
  const hiragana = Array.isArray((data as RawKanaListResponse)?.hiragana)
    ? (data as RawKanaListResponse).hiragana!
    : [];
  const katakana = Array.isArray((data as RawKanaListResponse)?.katakana)
    ? (data as RawKanaListResponse).katakana!
    : [];

  // Some environments may still return a flat array.
  const flat = Array.isArray(data) ? data : [...hiragana, ...katakana];
  const normalizedFlat = flat.map(normalizeKana);

  if (kanaType === "hiragana" || kanaType === "katakana") {
    const filtered = normalizedFlat.filter(
      (item) => item.kanaType === kanaType,
    );
    return NextResponse.json(filtered, {
      status: upstream.status,
    });
  }

  const grouped = {
    hiragana: normalizedFlat.filter((item) => item.kanaType === "hiragana"),
    katakana: normalizedFlat.filter((item) => item.kanaType === "katakana"),
  };

  return NextResponse.json(grouped, {
    status: upstream.status,
  });
}

/**
 * POST /api/content/kana
 */
export async function POST(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const body = await req.json();

  const upstream = await fetch(`${apiConfig.contentApiBase}/content/kanas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(normalizeKanaBody(body)),
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(normalizeKana(data as RawKana), {
    status: upstream.status,
  });
}
