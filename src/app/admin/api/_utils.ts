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

export function buildUsersUrl(path: string) {
  return `${apiConfig.usersApiBase.replace(/\/$/, "")}${path}`;
}

export function buildNotificationsUrl(path: string) {
  return `${apiConfig.notificationsApiBase.replace(/\/$/, "")}${path}`;
}

export function buildAdminAuthHeaders(token: string, headers?: HeadersInit) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Cookie: `gokai_token=${encodeURIComponent(token)}`,
    ...(headers || {}),
  };
}

export async function respondWithUpstream(upstream: Response) {
  const text = await upstream.text().catch(() => "");
  const contentType = upstream.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return NextResponse.json(text ? JSON.parse(text) : {}, {
        status: upstream.status,
      });
    } catch {
      return NextResponse.json(
        { error: text || "Respuesta JSON invalida del upstream" },
        { status: upstream.status },
      );
    }
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType || "text/plain; charset=utf-8",
    },
  });
}