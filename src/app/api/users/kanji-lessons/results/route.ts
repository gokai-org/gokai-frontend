import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
  const userId = payload.userId || payload.sub || payload.id;

  if (!userId) {
    return NextResponse.json(
      { error: "No se encontró ID de usuario" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const backendBody = {
    lessonId: String(body.lessonId || ""),
    kanjiId: String(body.kanjiId || ""),
    mode: String(body.mode || ""),
    score: Number(body.score) || 0,
    duration: Number(body.duration) || 0,
    totalExercises: Number(body.totalExercises) || 0,
    correctExercises: Number(body.correctExercises) || 0,
    answers: (body.answers ?? []).map((a: Record<string, unknown>) => ({
      exerciseType: String(a.exerciseType || "writing"),
      points: Number(a.points) || 0,
      duration: Number(a.duration) || 0,
      isCorrect: Boolean(a.isCorrect),
    })),
  };

  const upstreamUrl = `${apiConfig.usersApiBase}/users/${userId}/kanji-lessons/results`;

  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(backendBody),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  return NextResponse.json(data, { status: upstream.status });
}

export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
  const userId = payload.userId || payload.sub || payload.id;

  if (!userId) {
    return NextResponse.json(
      { error: "No se encontró ID de usuario" },
      { status: 401 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const query = new URLSearchParams();

  const kanjiId = searchParams.get("kanjiId");
  if (kanjiId) query.set("kanji_id", kanjiId);

  const limit = searchParams.get("limit");
  query.set("limit", limit || "100");

  const qs = query.toString();
  const url = `${apiConfig.usersApiBase}/users/${userId}/kanji-lessons/results${qs ? `?${qs}` : ""}`;

  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  return NextResponse.json(data, { status: upstream.status });
}
