import { NextResponse } from "next/server";

/**
 * POST /api/auth/verification/verify-code
 *
 * Body (frontend):
 *   - email: string
 *   - code: string
 *   - type: "password-recovery" | "email-verification"
 *
 * Body real que espera el backend:
 *   - email: string
 *   - code: string
 *   - type: "password" | "verification"
 *
 * Proxy hacia el backend de usuarios:
 *   POST {GOKAI_USERS_API_BASE}/users/verification/verify-code
 */
export async function POST(req: Request) {
  const base = process.env.GOKAI_USERS_API_BASE;
  if (!base) {
    return NextResponse.json(
      { error: "Falta GOKAI_USERS_API_BASE" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body inválido (JSON requerido)" },
      { status: 400 },
    );
  }

  const email = String(body.email ?? "").trim();
  const code = String(body.code ?? "").trim();
  const rawType = String(body.type ?? "").trim();

  if (!email || !code) {
    return NextResponse.json(
      { error: "Los campos 'email' y 'code' son requeridos." },
      { status: 400 },
    );
  }

  const typeMap: Record<string, string> = {
    "email-verification": "verification",
    "password-recovery": "password",

    "verification": "verification",
    "verify-email": "verification",

    "password": "password",
    "password-reset": "password",
    "reset-password": "password",
  };

  const type = typeMap[rawType];

  if (!type) {
    return NextResponse.json(
      {
        error:
          "El campo 'type' es inválido. Usa 'email-verification' o 'password-recovery'.",
        received: rawType,
      },
      { status: 400 },
    );
  }

  try {
    const r = await fetch(`${base}/users/verification/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, type }),
    });

    const text = await r.text();
    let data: Record<string, unknown> | null = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      /* respuesta no-JSON del backend */
    }

    if (!r.ok) {
      console.error("verify-code backend error:", { status: r.status, text });
      return NextResponse.json(
        { error: data?.error || text || "Código inválido o expirado." },
        { status: r.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: (data?.message as string) || "Código verificado correctamente.",
    });
  } catch (err) {
    console.error("Error al verificar código:", err);
    return NextResponse.json(
      { error: "Error interno al verificar el código." },
      { status: 500 },
    );
  }
}