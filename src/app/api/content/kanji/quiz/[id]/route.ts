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
    const upstream = await fetch(
      `${apiConfig.studyApiBase}/kanji/quiz/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

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

  try {
    const upstream = await fetch(
      `${apiConfig.studyApiBase}/kanji/quiz/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: body.type,
          score: body.score,
          duration: body.duration,
        }),
      },
    );

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
    console.error("[API] Error submitting kanji quiz:", error);
    return NextResponse.json(
      { message: "Error interno al enviar resultado", success: false },
      { status: 500 },
    );
  }
}
