import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

/**
 * POST /api/content/grammar/quiz/:id
 * Submits grammar quiz result to the study API.
 * Body: { score, duration }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const body = await req.json();

  try {
    const upstream = await fetch(
      `${apiConfig.studyApiBase}/grammar/quiz/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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
          message: errorData.message || "Error al enviar respuesta de grammar",
          success: false,
        },
        { status: upstream.status },
      );
    }

    const data: unknown = text ? JSON.parse(text) : null;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error submitting grammar quiz:", error);
    return NextResponse.json(
      { message: "Error interno al enviar quiz de grammar", success: false },
      { status: 500 },
    );
  }
}
