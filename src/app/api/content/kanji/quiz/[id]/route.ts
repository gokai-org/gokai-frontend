import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/content/kanji/quiz/:id
 * Fetches the quiz block for a given kanji from the backend.
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
    const upstreamGetUrl = `${apiConfig.studyApiBase}/kanji/quiz/${id}`;
    console.log("[QUIZ GET] fetching:", upstreamGetUrl);

    const upstream = await fetch(upstreamGetUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const text = await upstream.text();
    console.log("[QUIZ GET] upstream status:", upstream.status);
    console.log("[QUIZ GET] upstream body:", text.substring(0, 1000));

    if (!upstream.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = JSON.parse(text) as Record<string, unknown>;
      } catch {
        errorData = { message: text };
      }

      return NextResponse.json(
        {
          message: errorData.message || "Error al obtener quiz",
          success: false,
        },
        { status: upstream.status },
      );
    }

    const data: unknown = text ? JSON.parse(text) : null;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching kanji quiz:", error);
    return NextResponse.json(
      { message: "Error interno al obtener quiz", success: false },
      { status: 500 },
    );
  }
}

/**
 * POST /api/content/kanji/quiz/:id
 * Submits the quiz result for a given kanji.
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

  if (!body || !body.type || typeof body.score !== "number" || typeof body.duration !== "number") {
    return NextResponse.json(
      { message: "Body inválido: se requiere type, score y duration", success: false },
      { status: 400 },
    );
  }

  const submitPayload = {
    type: body.type,
    score: body.score,
    duration: body.duration,
  };
  const upstreamUrl = `${apiConfig.studyApiBase}/kanji/quiz/${id}`;

  console.log("[QUIZ POST] kanji_id:", id);
  console.log("[QUIZ POST] payload →", JSON.stringify(submitPayload));
  console.log("[QUIZ POST] upstream URL:", upstreamUrl);

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

    console.log("[QUIZ POST] upstream status:", upstream.status);
    console.log("[QUIZ POST] upstream body:", text.substring(0, 1000));

    if (!upstream.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = JSON.parse(text) as Record<string, unknown>;
      } catch {
        errorData = { message: text };
      }

      console.error("[QUIZ POST] upstream error:", upstream.status, errorData);
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

    console.log("[QUIZ POST] respuesta final al cliente:", JSON.stringify(data));
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error submitting kanji quiz:", error);
    return NextResponse.json(
      { message: "Error interno al enviar resultado", success: false },
      { status: 500 },
    );
  }
}
