import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, PROFILE_COOKIE } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

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

export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  console.log("[GET /admin/api/support/tickets] raw token exists:", !!raw);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const profileFromCookie = normalizeProfile(
    req.cookies.get(PROFILE_COOKIE)?.value,
  );
  const profileFromToken = getProfileFromToken(token);
  const profile = profileFromToken ?? profileFromCookie;

  if (profile !== "admin") {
    return NextResponse.json(
      { error: "Acceso restringido a administradores" },
      { status: 403 },
    );
  }

  const encodedToken = encodeURIComponent(token);
  const url = `${apiConfig.usersApiBase}/support/tickets/`;

  console.log("[GET /admin/api/support/tickets] url:", url);
  console.log(
    "[GET /admin/api/support/tickets] normalized token exists:",
    !!token,
  );

  try {
    const upstream = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Cookie: `gokai_token=${encodedToken}`,
      },
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
      "[GET /admin/api/support/tickets] upstream status:",
      upstream.status,
    );
    console.log("[GET /admin/api/support/tickets] upstream response:", data);

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("[GET /admin/api/support/tickets] fetch error:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
