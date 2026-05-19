import { NextRequest, NextResponse } from "next/server";
import { proxyNotificationDispatch } from "../_helpers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | {
          title?: unknown;
          message?: unknown;
        }
      | null;

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!title || !message) {
      return NextResponse.json(
        { error: "title y message son requeridos" },
        { status: 400 },
      );
    }

    return proxyNotificationDispatch(req, "/push/general-notice", {
      title,
      message,
    });
  } catch (error) {
    console.error("[POST /admin/api/notifications/general]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}