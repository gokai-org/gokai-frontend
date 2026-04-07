import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/content/kana/quiz/:id
 * Fetches the quiz for a given kana from the backend study service.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  try {
    const upstreamUrl = `${apiConfig.studyApiBase}/kana/quiz/${id}`;
    console.log("[KANA QUIZ GET] fetching:", upstreamUrl);

    const upstream = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const text = await upstream.text();
    console.log("[KANA QUIZ GET] upstream status:", upstream.status);
    console.log("[KANA QUIZ GET] upstream body:", text.substring(0, 1000));

    if (!upstream.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = JSON.parse(text) as Record<string, unknown>;
      } catch {
        errorData = { message: text };
      }

      // 403 = kana not reachable (user doesn't have enough points)
      const defaultMsg =
        upstream.status === 403
          ? "No tienes suficientes puntos para acceder al quiz de este kana"
          : "Error al obtener quiz de kana";

      return NextResponse.json(
        {
          message: errorData.message || defaultMsg,
          success: false,
          reachable: upstream.status !== 403,
          points:
            typeof errorData.points === "number" ? errorData.points : undefined,
          userPoints:
            typeof errorData.userPoints === "number"
              ? errorData.userPoints
              : undefined,
        },
        { status: upstream.status },
      );
    }

    const data: unknown = text ? JSON.parse(text) : null;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching kana quiz:", error);
    return NextResponse.json(
      { message: "Error interno al obtener quiz de kana", success: false },
      { status: 500 },
    );
  }
}

/**
 * POST /api/content/kana/quiz/:id
 * Submits the quiz result for a given kana.
 * Body: { type, score, duration }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const body = await req.json().catch(() => null);

  if (
    !body ||
    !body.type ||
    typeof body.score !== "number" ||
    typeof body.duration !== "number"
  ) {
    return NextResponse.json(
      {
        message: "Body invalido: se requiere type, score y duration",
        success: false,
      },
      { status: 400 },
    );
  }

  const submitPayload = {
    type: body.type,
    score: body.score,
    duration: body.duration,
  };
  const upstreamUrl = `${apiConfig.studyApiBase}/kana/quiz/${id}`;

  console.log("[KANA QUIZ POST] kana_id:", id);
  console.log("[KANA QUIZ POST] payload:", JSON.stringify(submitPayload));
  console.log("[KANA QUIZ POST] upstream URL:", upstreamUrl);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitPayload),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = JSON.parse(text) as Record<string, unknown>;
      } catch {
        errorData = { message: text };
      }

      return NextResponse.json(
        {
          message: errorData.message || "Error al enviar resultado del quiz",
          success: false,
        },
        { status: upstream.status },
      );
    }

    let data: unknown = { success: true };
    try {
      data = text ? JSON.parse(text) : { success: true };
    } catch {
      data = { success: true };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error submitting kana quiz:", error);
    return NextResponse.json(
      { message: "Error interno al enviar resultado", success: false },
      { status: 500 },
    );
  }
}
