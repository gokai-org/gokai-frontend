import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { getTokenFromRequest, PROFILE_COOKIE } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

type AdminAuthResult =
  | { ok: true; token: string }
  | { ok: false; response: NextResponse };

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return Buffer.from(padded, "base64").toString("utf8");
}

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
    const payload = JSON.parse(decodeBase64Url(tokenParts[1]));
    return normalizeProfile(payload?.profile ?? payload?.role);
  } catch {
    return null;
  }
}

export function authorizeAdmin(req: NextRequest): AdminAuthResult {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const token = normalizeBearerToken(raw);
  const profileFromCookie = normalizeProfile(
    req.cookies.get(PROFILE_COOKIE)?.value,
  );
  const profileFromToken = getProfileFromToken(token);
  const profile = profileFromToken ?? profileFromCookie;

  if (profile !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Acceso restringido a administradores" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, token };
}

export function buildContentUrl(path: string) {
  return `${apiConfig.contentApiBase.replace(/\/$/, "")}${path}`;
}

export async function proxyContentJson(
  req: NextRequest,
  path: string,
  init: RequestInit = {},
) {
  const auth = authorizeAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const upstream = await fetch(buildContentUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
        Cookie: `gokai_token=${encodeURIComponent(auth.token)}`,
        ...(init.headers || {}),
      },
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error(`Admin vocabulary proxy error for ${path}:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function readJsonBody(req: NextRequest) {
  return req.json().catch(() => ({}));
}