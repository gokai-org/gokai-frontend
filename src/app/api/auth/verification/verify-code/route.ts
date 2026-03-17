import { NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";

/**
 * POST /api/auth/verification/verify-code
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
      { error: "Body invalido (JSON requerido)" },
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

  const typeMap: Record<string, "verification" | "password"> = {
    "email-verification": "verification",
    "password-recovery": "password",
    verification: "verification",
    "verify-email": "verification",
    password: "password",
    "password-reset": "password",
    "reset-password": "password",
  };

  const type = typeMap[rawType];

  if (!type) {
    return NextResponse.json(
      {
        error:
          "El campo 'type' es invalido. Usa 'email-verification' o 'password-recovery'.",
        received: rawType,
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${base}/users/verification/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, type }),
    });

    const text = await response.text();
    let data: Record<string, unknown> | null = null;

    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
    } catch {}

    if (!response.ok) {
      console.error("verify-code backend error:", {
        status: response.status,
        text,
      });

      return NextResponse.json(
        { error: data?.error || text || "Codigo invalido o expirado." },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        (data?.message as string) || "Codigo verificado correctamente.",
    });
  } catch (err) {
    console.error("Error al verificar codigo:", err);
    return NextResponse.json(
      { error: "Error interno al verificar el codigo." },
      { status: 500 },
    );
  }
}