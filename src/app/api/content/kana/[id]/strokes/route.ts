import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

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

/**
 * GET /api/content/kana/:id/strokes
 * Obtiene los datos de trazo de un kana desde el backend.
 * Hace fetch al detalle del kana y extrae viewBox + strokes.
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

  const viewBox = data?.viewBox ?? data?.view_box ?? "0 0 109 109";
  const strokes = parseStrokeList(data?.strokes);

  if (!Array.isArray(strokes) || strokes.length === 0) {
    return NextResponse.json({ error: "Strokes not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      kanaId: data?.id ?? id,
      viewBox,
      strokes,
    },
    { status: 200 },
  );
}
