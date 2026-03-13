import { NextResponse } from "next/server";
import { AUTH_COOKIE, getCookieConfig } from "@/shared/lib/auth/cookies";

export async function POST(req: Request) {
  const base = process.env.GOKAI_USERS_API_BASE;
  if (!base)
    return NextResponse.json(
      { error: "Falta GOKAI_USERS_API_BASE" },
      { status: 500 },
    );

  const body = await req.json();

  const r = await fetch(`${base}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const text = await r.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!r.ok) {
    return NextResponse.json(
      { error: data?.error || text || "Credenciales inválidas." },
      { status: r.status },
    );
  }

  const token = data?.token as string;
  if (!token)
    return NextResponse.json(
      { error: "Respuesta inválida (token faltante)" },
      { status: 500 },
    );

  const remember = !!body.remember;
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

  const res = NextResponse.json({
    user: {
      id: data?.id,
      email: data?.email,
      firstName: data?.firstName,
      lastName: data?.lastName,
      profile: data?.profile,
      birthdate: data?.birthdate,
    },
  });

  res.cookies.set(AUTH_COOKIE, token, getCookieConfig(maxAge));

  return res;
}
