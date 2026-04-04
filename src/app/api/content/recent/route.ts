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

    const upstream = await fetch(`${apiConfig.contentApiBase}/content/recent`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("GET /api/content/recent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = getTokenFromRequest(req);

    if (!raw) {
      return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
    }

    const token = normalizeBearerToken(raw);
    const body = await req.json();

    const upstream = await fetch(`${apiConfig.contentApiBase}/content/recent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("POST /api/content/recent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
