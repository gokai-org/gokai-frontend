import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/cookies";

const USERS_API_BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

export async function GET() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Aquí se hará el fetch real al backend cuando esté disponible
    // const response = await fetch(`${USERS_API_BASE}/users/me/export`, {
    //   headers: { Authorization: `Bearer ${token}` },
    // });
    // return response;

    // Datos de ejemplo
    const exportData = {
      user: {
        id: "1",
        email: "usuario@ejemplo.com",
        name: "Usuario Demo",
        plan: "free",
        createdAt: "2025-01-15T10:00:00Z",
        twoFactorEnabled: false,
      },
      progress: {
        lessonsCompleted: 12,
        kanjisLearned: 45,
        studyStreak: 7,
      },
      exportDate: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=gokai-data-${new Date().toISOString()}.json`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Error al exportar datos" }, { status: 500 });
  }
}
