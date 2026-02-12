import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";

export const dynamic = "force-dynamic";

const USERS_API_BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "enabled debe ser un booleano" }, { status: 400 });
    }

    // Aquí harías el fetch real al backend cuando esté disponible
    // const response = await fetch(`${USERS_API_BASE}/users/me/2fa`, {
    //   method: "PATCH",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({ enabled }),
    // });

    console.log("Actualizando 2FA:", { enabled });

    return NextResponse.json({ 
      success: true,
      twoFactorEnabled: enabled
    });
  } catch (error) {
    console.error("Error updating 2FA:", error);
    return NextResponse.json({ error: "Error al actualizar 2FA" }, { status: 500 });
  }
}
