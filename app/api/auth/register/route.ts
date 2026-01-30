import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.GOKAI_USERS_API_BASE;
  if (!base) {
    return NextResponse.json({ error: "Falta GOKAI_USERS_API_BASE" }, { status: 500 });
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido (JSON requerido)" }, { status: 400 });
  }

  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");
  const birthdate = String(body?.birthdate || "").trim(); // "YYYY-MM-DD"

  if (!firstName || !lastName || !email || !password || !birthdate) {
    return NextResponse.json(
      { error: "firstName, lastName, email, password y birthdate son requeridos." },
      { status: 400 }
    );
  }

  const r = await fetch(`${base}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
      birthdate,
      isGoogleUser: false,
    }),
  });

  const text = await r.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!r.ok) {
    return NextResponse.json(
      { error: data?.error || text || "No se pudo registrar." },
      { status: r.status }
    );
  }

  return NextResponse.json({
    user: {
      id: data?.id,
      email: data?.email,
      firstName: data?.firstName,
      lastName: data?.lastName,
      profile: data?.profile,
      birthdate: data?.birthdate,
    },
  });
}