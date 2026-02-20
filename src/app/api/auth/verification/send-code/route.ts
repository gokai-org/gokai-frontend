import { NextResponse } from "next/server";

/**
 * POST /api/auth/verification/send-code
 *
 * Envía un código de verificación al correo del usuario.
 *
 * Body:
 *   - email: string          — correo destino
 *   - type: "password-recovery" | "email-verification"
 *
 * Proxy hacia el backend de usuarios:
 *   POST {GOKAI_USERS_API_BASE}/users/verification/send-code
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
  const type = String(body.type ?? "").trim();

  if (!email) {
    return NextResponse.json(
      { error: "El campo 'email' es requerido." },
      { status: 400 },
    );
  }

  if (type !== "password-recovery" && type !== "email-verification") {
    return NextResponse.json(
      {
        error:
          "El campo 'type' debe ser 'password-recovery' o 'email-verification'.",
      },
      { status: 400 },
    );
  }

  try {
    const r = await fetch(`${base}/users/verification/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type }),
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
        { error: data?.error || text || "No se pudo enviar el código." },
        { status: r.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        data?.message ||
        `Código de verificación enviado a ${email}.`,
    });
  } catch (err) {
    console.error("Error al enviar código:", err);
    return NextResponse.json(
      { error: "Error interno al enviar el código." },
      { status: 500 },
    );
  }
}
