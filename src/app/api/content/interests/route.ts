import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return Buffer.from(padded, "base64").toString("utf8");
}

function getUserIdFromToken(token: string): string | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(tokenParts[1])) as {
      userId?: string;
      sub?: string;
      id?: string;
    };

    return payload.userId ?? payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}

function normalizeThemeIds(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  return Array.from(
    new Set(
      input
        .filter((themeId): themeId is string => typeof themeId === "string")
        .map((themeId) => themeId.trim())
        .filter(Boolean),
    ),
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawToken = getTokenFromRequest(req);

    if (!rawToken) {
      return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
    }

    const token = normalizeBearerToken(rawToken);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const themeIds = normalizeThemeIds(body?.themeIds);

    if (themeIds.length === 0) {
      return NextResponse.json(
        { error: "themeIds are required" },
        { status: 400 },
      );
    }

    const upstream = await fetch(
      `${apiConfig.contentApiBase}/content/interests/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ themeIds }),
        cache: "no-store",
      },
    );

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("POST /api/content/interests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
