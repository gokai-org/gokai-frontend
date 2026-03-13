import { NextResponse } from "next/server";

/**
 * POST /api/auth/verification/reset-password
 *
 * Body:
 *   - email:       string
 *   - code:        string   — código de 6 dígitos
 *   - newPassword: string   — nueva contraseña (mín 8 caracteres)
 *
 * Proxy hacia el backend de usuarios:
 *   POST {GOKAI_USERS_API_BASE}/users/verification/reset-password
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
  const newPassword = String(body.newPassword ?? "");

  if (!email || !code || !newPassword) {
    return NextResponse.json(
      { error: "Los campos 'email', 'code' y 'newPassword' son requeridos." },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 },
    );
  }

  try {
    const r = await fetch(`${base}/users/verification/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        code,

        password: newPassword,

        newPassword,

        type: "password",
      }),
    });

    const text = await r.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      /* respuesta no-JSON del backend */
    }

    if (!r.ok) {
      // útil para debug en consola del servidor Next
      console.error("reset-password backend error:", {
        status: r.status,
        text,
      });

      return NextResponse.json(
        {
          error: data?.error || text || "No se pudo restablecer la contraseña.",
        },
        { status: r.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: data?.message || "Contraseña actualizada exitosamente.",
    });
  } catch (err) {
    console.error("Error al restablecer contraseña:", err);
    return NextResponse.json(
      { error: "Error interno al restablecer la contraseña." },
      { status: 500 },
    );
  }
}
