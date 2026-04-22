import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  const upstream = await fetch(`${apiConfig.studyApiBase}/grammar/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (upstream.status === 403) {
    return NextResponse.json(
      {
        hasUnlocked: false,
        message:
          "El backend actual no autoriza consultar grammar progress para usuarios normales.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json(data, { status: upstream.status });
}