import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const raw = getTokenFromRequest(req);

    if (!raw) {
      return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
    }

    const token = normalizeBearerToken(raw);

    const upstream = await fetch(`${apiConfig.contentApiBase}/content/themes`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("GET /api/content/themes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}