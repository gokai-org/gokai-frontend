import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";
const BASE = process.env.GOKAI_CONTENT_API_BASE!;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const raw = getTokenFromRequest(req);
  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const { id } = await params;

  const upstream = await fetch(`${BASE}/content/kanjis/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const viewBox = data?.viewBox ?? data?.view_box ?? "0 0 109 109";
  const strokes = data?.strokes ?? [];

  if (!Array.isArray(strokes) || strokes.length === 0) {
    return NextResponse.json({ error: "Strokes not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      kanjiId: data?.id ?? id,
      viewBox,
      strokes,
    },
    { status: 200 }
  );
}