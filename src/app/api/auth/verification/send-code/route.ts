import { NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";

/**
 * POST /api/auth/verification/send-code
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
  const rawType = String(body.type ?? "").trim();

  if (!email) {
    return NextResponse.json(
      { error: "El campo 'email' es requerido." },
      { status: 400 },
    );
  }

  const typeMap: Record<string, string> = {
    "email-verification": "verification",
    "password-recovery": "password",
    email_verification: "verification",
    "verify-email": "verification",
    verification: "verification",
    password_recovery: "password",
    "password-reset": "password",
    "reset-password": "password",
    password: "password",
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
    const response = await fetch(`${base}/users/verification/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type }),
    });

    const text = await response.text();
    let data: Record<string, unknown> | null = null;

    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
    } catch {}

    if (!response.ok) {
      console.error("send-code backend error:", {
        status: response.status,
        text,
      });

      return NextResponse.json(
        { error: data?.error || text || "No se pudo enviar el código." },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        (data?.message as string) ||
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