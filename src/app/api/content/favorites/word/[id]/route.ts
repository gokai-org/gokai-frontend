import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";

const BASE = process.env.GOKAI_CONTENT_API_BASE!;

/** DELETE /api/content/favorites/word/:id → proxy a DELETE /content/favorites/word/:id */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const raw = getTokenFromRequest(req);
  if (!raw)
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });

  const { id } = await params;
  const token = normalizeBearerToken(raw);

  const upstream = await fetch(`${BASE}/content/favorites/word/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
