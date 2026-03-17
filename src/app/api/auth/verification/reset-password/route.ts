import { NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";

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
  const base = apiConfig.usersApiBase;

  if (!base) {
    return NextResponse.json(
      { error: "Falta configuración de usersApiBase" },
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
    const response = await fetch(
      `${base}/users/verification/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          password: newPassword,
          newPassword,
          type: "password",
        }),
      },
    );

    const text = await response.text();
    let data: Record<string, unknown> | null = null;

    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
    } catch {}

    if (!response.ok) {
      console.error("reset-password backend error:", {
        status: response.status,
        text,
      });

      return NextResponse.json(
        {
          error: data?.error || text || "No se pudo restablecer la contraseña.",
        },
        { status: response.status },
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