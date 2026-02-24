import { NextResponse } from "next/server";

/**
 * POST /api/auth/verification/verify-email
 *
 * Body:
 *   - email: string
 *   - code:  string   — código de 5 dígitos
 *
 * Proxy hacia el backend de usuarios:
 *   POST {GOKAI_USERS_API_BASE}/users/verification/verify-email
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

  if (!email || !code) {
    return NextResponse.json(
      { error: "Los campos 'email' y 'code' son requeridos." },
      { status: 400 },
    );
  }

  try {
    const r = await fetch(`${base}/users/verification/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const text = await r.text();
    let data: Record<string, unknown> | null = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      /* respuesta no-JSON del backend */
    }

    if (!r.ok) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            text ||
            "No se pudo verificar el correo.",
        },
        { status: r.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        data?.message || "Correo verificado exitosamente.",
    });
  } catch (err) {
    console.error("Error al verificar correo:", err);
    return NextResponse.json(
      { error: "Error interno al verificar el correo." },
      { status: 500 },
    );
  }
}
