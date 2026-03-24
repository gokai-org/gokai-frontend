import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, PROFILE_COOKIE } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

const VALID_STATUS = new Set(["open", "in_progress", "resolved", "closed"]);

function normalizeProfile(value: unknown): "admin" | "user" | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "admin" || normalized === "user") return normalized;

  return null;
}

function getProfileFromToken(token: string): "admin" | "user" | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
    return normalizeProfile(payload?.profile ?? payload?.role);
  } catch {
    return null;
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const raw = getTokenFromRequest(req);

  console.log("[PUT /admin/api/support/tickets/:id] raw token exists:", !!raw);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const profileFromCookie = normalizeProfile(req.cookies.get(PROFILE_COOKIE)?.value);
  const profileFromToken = getProfileFromToken(token);
  const profile = profileFromToken ?? profileFromCookie;

  if (profile !== "admin") {
    return NextResponse.json(
      { error: "Acceso restringido a administradores" },
      { status: 403 },
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "ID de ticket requerido" },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body invalido (JSON requerido)" },
      { status: 400 },
    );
  }

  const status = String(body.status ?? "")
    .trim()
    .toLowerCase();

  const noteRaw = body.note;
  const note =
    typeof noteRaw === "string"
      ? noteRaw.trim()
      : noteRaw == null
        ? null
        : String(noteRaw);

  if (!VALID_STATUS.has(status)) {
    return NextResponse.json(
      {
        error:
          "'status' invalido. Valores permitidos: open, in_progress, resolved, closed",
      },
      { status: 400 },
    );
  }

  const encodedToken = encodeURIComponent(token);
  const url = `${apiConfig.usersApiBase}/support/tickets/${id}`;

  console.log("[PUT /admin/api/support/tickets/:id] url:", url);
  console.log("[PUT /admin/api/support/tickets/:id] normalized token exists:", !!token);
  console.log("[PUT /admin/api/support/tickets/:id] payload:", { status, note });

  try {
    const upstream = await fetch(url, {
      method: "PUT",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Cookie: `gokai_token=${encodedToken}`,
      },
      body: JSON.stringify({ status, note }),
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    let data: unknown = {};

    if (contentType.includes("application/json")) {
      data = await upstream.json().catch(() => ({}));
    } else {
      const text = await upstream.text().catch(() => "");
      data = text ? { error: text } : {};
    }

    console.log(
      "[PUT /admin/api/support/tickets/:id] upstream status:",
      upstream.status,
    );
    console.log(
      "[PUT /admin/api/support/tickets/:id] upstream response:",
      data,
    );

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("[PUT /admin/api/support/tickets/:id] fetch error:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}