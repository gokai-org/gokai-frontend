import { NextRequest, NextResponse } from "next/server";
import { getBearerTokenFromRequest, getUserIdFromToken } from "@/app/api/_utils/auth";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 40;

function buildContentUrl(path: string) {
  return `${apiConfig.contentApiBase.replace(/\/$/, "")}${path}`;
}

function normalizeLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return parsed;
}

export async function GET(req: NextRequest) {
  try {
    const token = getBearerTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const requestUrl = new URL(req.url);
    const themeId = requestUrl.searchParams.get("themeId")?.trim();
    const limit = normalizeLimit(requestUrl.searchParams.get("limit"));

    if (!themeId) {
      return NextResponse.json(
        { error: "themeId is required" },
        { status: 400 },
      );
    }

    const upstreamQuery = new URLSearchParams({
      themeId,
      limit: String(limit),
    });

    const upstream = await fetch(
      buildContentUrl(
        `/content/recommendations/subtheme/${userId}?${upstreamQuery.toString()}`,
      ),
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("GET /api/content/recommendations/subthemes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}