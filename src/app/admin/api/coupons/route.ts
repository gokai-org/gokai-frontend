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

function authorizeAdmin(req: NextRequest) {
  const raw = getTokenFromRequest(req);
  if (!raw) return { error: "No autenticado", status: 401, token: "" };

  const token = normalizeBearerToken(raw);
  const profileFromCookie = normalizeProfile(
    req.cookies.get(PROFILE_COOKIE)?.value,
  );
  const profileFromToken = getProfileFromToken(token);
  const profile = profileFromToken ?? profileFromCookie;

  if (profile !== "admin")
    return {
      error: "Acceso restringido a administradores",
      status: 403,
      token: "",
    };

  return { error: null, status: 200, token };
}

export async function GET(req: NextRequest) {
  const auth = authorizeAdmin(req);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const valid = req.nextUrl.searchParams.get("valid");
  const qs = valid === "true" ? "?valid=true" : "";
  const url = `${apiConfig.subscriptionsApiBase}/subscriptions/cupon${qs}`;

  try {
    const upstream = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
        Cookie: `gokai_token=${encodeURIComponent(auth.token)}`,
      },
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = authorizeAdmin(req);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = `${apiConfig.subscriptionsApiBase}/subscriptions/cupon`;
  const body = await req.text();

  try {
    const upstream = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
        Cookie: `gokai_token=${encodeURIComponent(auth.token)}`,
      },
      body,
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
