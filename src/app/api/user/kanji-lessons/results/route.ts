import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

export const dynamic = "force-dynamic";

const BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

/** POST /api/user/kanji-lessons/results
 *  Proxy → POST {USERS_API_BASE}/users/{userId}/kanji-lessons/results
 *
 *  Body (JSON):
 *    lessonId         – ID de la lección completada
 *    kanjiId          – ID del kanji practicado
 *    mode             – "writing" | "listening" | "reading" | "speaking"
 *    score            – Puntuación obtenida (0-100)
 *    duration         – Duración total en segundos
 *    totalExercises   – Cantidad de ejercicios en la lección
 *    correctExercises – Cantidad de ejercicios correctos
 *    answers[]        – Detalle de cada respuesta individual
 *      exerciseType   – "writing" | "meaning"
 *      points         – Puntos del ejercicio
 *      duration       – Duración del ejercicio en segundos
 *      isCorrect      – Si la respuesta fue correcta
 *
 *  Respuesta exitosa (201):
 *    KanjiLessonResult completo con id, userId, completedAt, etc.
 *
 *  Errores:
 *    400  – Body inválido o campos faltantes
 *    401  – Token ausente o expirado
 */
export async function POST(req: NextRequest) {
  const raw = getTokenFromRequest(req);
  if (!raw) {
    console.error("[API ROUTE] No autenticado: no se encontró token");
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    console.error("[API ROUTE] Token inválido");
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
  const userId = payload.userId || payload.sub || payload.id;

  console.log("[API ROUTE] token payload:", payload);
  console.log("[API ROUTE] userId detectado:", userId);

  if (!userId) {
    console.error("[API ROUTE] No se encontró ID de usuario en el token");
    return NextResponse.json(
      { error: "No se encontró ID de usuario" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);

  console.log("[API ROUTE] raw body recibido del frontend:", body);
  console.log(
    "[API ROUTE] raw body JSON recibido del frontend:",
    JSON.stringify(body, null, 2),
  );

  if (!body) {
    console.error("[API ROUTE] Body JSON inválido");
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

  console.log("[API ROUTE] backendBody transformado:", backendBody);
  console.log(
    "[API ROUTE] backendBody JSON transformado:",
    JSON.stringify(backendBody, null, 2),
  );

  const upstreamUrl = `${BASE}/users/${userId}/kanji-lessons/results`;
  console.log("[API ROUTE] enviando a upstream:", upstreamUrl);

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

  console.log("[API ROUTE] upstream status:", upstream.status);
  console.log("[API ROUTE] upstream response:", data);
  console.log(
    "[API ROUTE] upstream response JSON:",
    JSON.stringify(data, null, 2),
  );

  return NextResponse.json(data, { status: upstream.status });
}

/** GET /api/user/kanji-lessons/results?kanjiId=...&limit=...
 *  Proxy → GET {USERS_API_BASE}/users/{userId}/kanji-lessons/results?...
 *
 *  Query params (opcionales):
 *    kanjiId – Filtrar por kanji específico
 *    limit   – Cantidad máxima de resultados (default: 20, max: 100)
 *
 *  Respuesta (200):
 *    { results: KanjiLessonResult[] }
 */
export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);
  if (!raw) {
    console.error("[API ROUTE GET] No autenticado");
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    console.error("[API ROUTE GET] Token inválido");
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
  const userId = payload.userId || payload.sub || payload.id;

  console.log("[API ROUTE GET] token payload:", payload);
  console.log("[API ROUTE GET] userId detectado:", userId);

  if (!userId) {
    console.error("[API ROUTE GET] No se encontró ID de usuario");
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
  if (limit) query.set("limit", limit);

  console.log("[API ROUTE GET] searchParams frontend:", {
    kanjiId,
    limit,
  });

  const qs = query.toString();
  const url = `${BASE}/users/${userId}/kanji-lessons/results${qs ? `?${qs}` : ""}`;

  console.log("[API ROUTE GET] url final al backend:", url);

  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  console.log("[API ROUTE GET] upstream status:", upstream.status);
  console.log("[API ROUTE GET] upstream response:", data);
  console.log(
    "[API ROUTE GET] upstream response JSON:",
    JSON.stringify(data, null, 2),
  );

  return NextResponse.json(data, { status: upstream.status });
}
