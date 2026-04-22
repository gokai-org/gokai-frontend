import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

/** GET /api/content/grammar/:id — get grammar lesson detail */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/grammar/${id}`,
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
  const { id } = await params;
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const resource = req.nextUrl.searchParams.get("resource");
  if (resource !== "unlock") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = normalizeBearerToken(raw);

  try {
    const upstream = await fetch(`${apiConfig.studyApiBase}/grammar/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await upstream.text().catch(() => "");
    let data: Record<string, unknown> = {};

    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = text ? { message: text } : {};
    }

    return NextResponse.json(
      {
        ...data,
        message:
          upstream.status === 403
            ? "El backend actual no autoriza el desbloqueo manual de gramática para usuarios normales."
            : typeof data.message === "string"
            ? data.message
            : typeof data.error === "string"
              ? data.error
              : upstream.ok
                ? "Gramática desbloqueada"
                : "No fue posible desbloquear la gramática",
      },
      { status: upstream.status },
    );
  } catch (error) {
    console.error("[API] Error unlocking grammar:", error);
    return NextResponse.json(
      { message: "Error interno al desbloquear gramática", success: false },
      { status: 500 },
    );
  }
}
