import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";

export async function POST(req: NextRequest) {
  const base = apiConfig.usersApiBase;

  if (!base) {
    return NextResponse.json(
      { error: "Falta configuración de usersApiBase" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown> | null = null;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body invalido (JSON requerido)" },
      { status: 400 },
    );
  }

  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");
  const birthdate = String(body?.birthdate || "").trim();
  const fromGoogle = Boolean(body?.isGoogleUser || false);

  if (!firstName || !lastName || !email || !password || !birthdate) {
    return NextResponse.json(
      {
        error:
          "firstName, lastName, email, password y birthdate son requeridos.",
      },
      { status: 400 },
    );
  }

  const response = await fetch(`${base}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
      birthdate,
      isGoogleUser: fromGoogle,
    }),
  });

  const text = await response.text();
  let data: Record<string, unknown> | null = null;

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    // Backend devolvió algo que no es JSON
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error || text || "No se pudo registrar." },
      { status: response.status },
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