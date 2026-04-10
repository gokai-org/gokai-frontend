import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const { id } = await params;
  const resource = req.nextUrl.searchParams.get("resource");

  if (resource === "quiz") {
    const upstream = await fetch(`${apiConfig.studyApiBase}/kanji/quiz/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await upstream.text().catch(() => "");

    if (!upstream.ok) {
      let data: Record<string, unknown> = {};
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      } catch {
        data = { message: text };
      }

      return NextResponse.json(
        {
          message: data.message || "Error al obtener quiz",
          success: false,
        },
        { status: upstream.status },
      );
    }

    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data, { status: upstream.status });
  }

  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/kanjis/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const { id } = await params;
  const resource = req.nextUrl.searchParams.get("resource");

  if (resource !== "quiz") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

  const upstream = await fetch(`${apiConfig.studyApiBase}/kanji/quiz/${id}`, {
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
  });

  const text = await upstream.text().catch(() => "");

  if (!upstream.ok) {
    let data: Record<string, unknown> = {};
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = { message: text };
    }

    return NextResponse.json(
      {
        message: data.message || "Error al enviar resultado del quiz",
        success: false,
      },
      { status: upstream.status },
    );
  }

  try {
    return NextResponse.json(text ? JSON.parse(text) : { success: true }, {
      status: upstream.status,
    });
  } catch {
    return NextResponse.json({ success: true }, { status: upstream.status });
  }
}
