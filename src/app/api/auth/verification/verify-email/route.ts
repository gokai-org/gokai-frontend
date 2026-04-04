import { NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";

/**
 * POST /api/auth/verification/verify-email
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

  if (!email || !code) {
    return NextResponse.json(
      { error: "Los campos 'email' y 'code' son requeridos." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${base}/users/verification/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const text = await response.text();
    let data: Record<string, unknown> | null = null;

    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
    } catch {}

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.error || text || "No se pudo verificar el correo.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: data?.message || "Correo verificado exitosamente.",
    });
  } catch (err) {
    console.error("Error al verificar correo:", err);
    return NextResponse.json(
      { error: "Error interno al verificar el correo." },
      { status: 500 },
    );
  }
}
