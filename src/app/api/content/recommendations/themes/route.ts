import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import {
  getBearerTokenFromRequest,
  getUserIdFromToken,
} from "@/app/api/_utils/auth";

export const dynamic = "force-dynamic";

const CONTENT_TIMEOUT_MS = 8000;

function buildContentUrl(path: string) {
  return `${apiConfig.contentApiBase.replace(/\/$/, "")}${path}`;
}

export async function GET(req: NextRequest) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const limit = req.nextUrl.searchParams.get("limit") ?? "12";
  const upstreamPath = `/content/recommendations/theme/${userId}?limit=${encodeURIComponent(limit)}`;
  const upstreamUrl = buildContentUrl(upstreamPath);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(CONTENT_TIMEOUT_MS),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: upstream.status,
      headers: {
        "x-gokai-upstream": new URL(upstreamUrl).host,
        "x-gokai-upstream-path": upstreamPath,
      },
    });
  } catch (error) {
    console.error("GET /api/content/recommendations/themes error:", error);
    return NextResponse.json(
      { error: "Error interno al cargar recomendaciones de temas" },
      { status: 500 },
    );
  }
}
