import { NextRequest, NextResponse } from "next/server";
import { proxyNotificationDispatch } from "../_helpers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | {
          themeId?: unknown;
          themeName?: unknown;
        }
      | null;

    const themeId =
      typeof body?.themeId === "string" ? body.themeId.trim() : "";
    const themeName =
      typeof body?.themeName === "string" ? body.themeName.trim() : "";

    if (!themeId || !themeName) {
      return NextResponse.json(
        { error: "themeId y themeName son requeridos" },
        { status: 400 },
      );
    }

    return proxyNotificationDispatch(req, "/push/theme-released", {
      theme_id: themeId,
      theme_name: themeName,
    });
  } catch (error) {
    console.error("[POST /admin/api/notifications/theme-released]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}