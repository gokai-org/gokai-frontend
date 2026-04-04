import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      console.error("No hay token de autenticación");
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { themeId } = body;

    if (!themeId) {
      console.error("themeId no proporcionado");
      return NextResponse.json({ error: "themeId requerido" }, { status: 400 });
    }

    console.log("Enviando preferencia al backend:", { theme_id: themeId });

    const response = await fetch(
      `${apiConfig.usersApiBase}/users/preferences`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme_id: themeId }),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Error al guardar preferencias" }));

      console.error("Backend respondió con error:", {
        status: response.status,
        error: errorData,
      });

      return NextResponse.json(
        { error: errorData.error || "Error al guardar preferencias" },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("Preferencia guardada exitosamente en el backend:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en el endpoint de preferencias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
