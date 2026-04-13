import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

/** GET /api/content/grammar  — list all grammar lessons */
export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  const upstream = await fetch(`${apiConfig.contentApiBase}/content/grammar`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
