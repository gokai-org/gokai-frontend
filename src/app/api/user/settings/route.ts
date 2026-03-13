import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";

export const dynamic = "force-dynamic";

const USERS_API_BASE =
  process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

// ─── Helpers ─────────────────────────────────────────────────────

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

/**
 * Convierte claves camelCase → snake_case para enviar al backend Go.
 */
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[snakeKey] = toSnakeCase(value as Record<string, unknown>);
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
}

/**
 * Convierte claves snake_case → camelCase al recibir del backend Go.
 */
function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[camelKey] = toCamelCase(value as Record<string, unknown>);
    } else {
      result[camelKey] = value;
    }
  }
  return result;
}

// ─── GET /api/user/settings ──────────────────────────────────────
// Obtiene todas las configuraciones del usuario.

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const response = await fetch(`${USERS_API_BASE}/users/${userId}/settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Si 404, el usuario aún no tiene settings → devolver null para que el front use defaults
      if (response.status === 404) {
        return NextResponse.json({ settings: null });
      }
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Error al obtener configuración" },
        { status: response.status },
      );
    }

    const raw = await response.json();
    const settings = toCamelCase(raw.settings || raw);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[GET /api/user/settings]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/user/settings ────────────────────────────────────
// Actualiza parcialmente la configuración del usuario.
// Body esperado: { section: "general" | "notifications" | ... , data: { ...fields } }

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: "Se requieren 'section' y 'data'" },
        { status: 400 },
      );
    }

    const validSections = [
      "general",
      "notifications",
      "appearance",
      "learning",
      "accessibility",
      "privacy",
    ];

    if (!validSections.includes(section)) {
      return NextResponse.json(
        {
          error: `Sección inválida. Secciones válidas: ${validSections.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const payload = toSnakeCase({ section, data: toSnakeCase(data) });

    const response = await fetch(`${USERS_API_BASE}/users/${userId}/settings`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Error al actualizar configuración" },
        { status: response.status },
      );
    }

    const raw = await response.json();
    const settings = toCamelCase(raw.settings || raw);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[PATCH /api/user/settings]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// ─── PUT /api/user/settings ──────────────────────────────────────
// Reemplaza TODAS las configuraciones del usuario (bulk save).

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const payload = toSnakeCase(body);

    const response = await fetch(`${USERS_API_BASE}/users/${userId}/settings`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Error al guardar configuración" },
        { status: response.status },
      );
    }

    const raw = await response.json();
    const settings = toCamelCase(raw.settings || raw);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[PUT /api/user/settings]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
