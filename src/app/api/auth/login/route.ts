import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  PROFILE_COOKIE,
  getCookieConfig,
} from "@/shared/lib/auth/cookies";
import { apiConfig } from "@/shared/config";

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

export async function POST(req: Request) {
  const base = apiConfig.usersApiBase;

  if (!base) {
    return NextResponse.json(
      { error: "Falta configuración de usersApiBase" },
      { status: 500 },
    );
  }

  const body = await req.json();

  const response = await fetch(`${base}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
    }),
  });

  const text = await response.text();
  let data: Record<string, unknown> | null = null;

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {}

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error || text || "Credenciales inválidas." },
      { status: response.status },
    );
  }

  const token = data?.token as string | undefined;

  if (!token) {
    return NextResponse.json(
      { error: "Respuesta inválida (token faltante)" },
      { status: 500 },
    );
  }

  const profile = normalizeProfile(data?.profile) ?? getProfileFromToken(token);

  const remember = Boolean(body.remember);
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

  const res = NextResponse.json({
    user: {
      id: data?.id,
      email: data?.email,
      firstName: data?.firstName,
      lastName: data?.lastName,
      profile,
      birthdate: data?.birthdate,
    },
  });

  res.cookies.set(AUTH_COOKIE, token, getCookieConfig(maxAge));

  if (profile) {
    res.cookies.set(PROFILE_COOKIE, profile, getCookieConfig(maxAge));
  } else {
    res.cookies.set(PROFILE_COOKIE, "", getCookieConfig(0));
  }

  return res;
}