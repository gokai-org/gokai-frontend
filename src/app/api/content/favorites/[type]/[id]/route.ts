import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "kanji",
  "hiragana",
  "katakana",
  "grammar",
  "word",
]);

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const { type, id } = await params;

  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid favorite type" }, { status: 400 });
  }

  const token = normalizeBearerToken(raw);
  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/favorites/${type}/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
