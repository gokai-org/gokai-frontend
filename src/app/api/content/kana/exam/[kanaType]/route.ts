import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

function resolveKanaType(value: string) {
  return value === "hiragana" || value === "katakana" ? value : null;
}

async function proxyKanaExam(
  req: NextRequest,
  method: "GET" | "POST",
  kanaType: string,
) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const normalizedKanaType = resolveKanaType(kanaType);
  if (!normalizedKanaType) {
    return NextResponse.json(
      { message: "Tipo de examen de kana invalido", success: false },
      { status: 400 },
    );
  }

  const token = normalizeBearerToken(raw);
  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  if (method === "POST") {
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

    init.body = JSON.stringify({
      type: body.type,
      score: body.score,
      duration: body.duration,
    });
  }

  try {
    const upstream = await fetch(
      `${apiConfig.studyApiBase}/kana/exam/${normalizedKanaType}`,
      init,
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
          message: errorData.message || "Error en examen de kana",
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
    console.error("[API] Error proxying kana exam:", error);
    return NextResponse.json(
      { message: "Error interno en examen de kana", success: false },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kanaType: string }> },
) {
  const { kanaType } = await params;
  return proxyKanaExam(req, "GET", kanaType);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kanaType: string }> },
) {
  const { kanaType } = await params;
  return proxyKanaExam(req, "POST", kanaType);
}