import { NextRequest, NextResponse } from "next/server";
import {
  authorizeAdmin,
  buildAdminAuthHeaders,
  buildUsersUrl,
  respondWithUpstream,
} from "../../../_utils";

export const dynamic = "force-dynamic";

function buildUserNotificationsUrl(
  req: NextRequest,
  userId: string,
  mode: "list" | "read" = "list",
) {
  const suffix = mode === "read" ? "/read" : "";
  const upstreamUrl = new URL(
    buildUsersUrl(
      `/users/${encodeURIComponent(userId)}/notifications${suffix}`,
    ),
  );

  for (const key of ["all", "notification_id", "unread_only"]) {
    const value = req.nextUrl.searchParams.get(key);

    if (value) {
      upstreamUrl.searchParams.set(key, value);
    }
  }

  return upstreamUrl.toString();
}

async function proxyUserNotifications(
  req: NextRequest,
  params: Promise<{ id: string }>,
  method: "GET" | "PATCH" | "DELETE",
) {
  const auth = authorizeAdmin(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const upstream = await fetch(
      buildUserNotificationsUrl(req, id, method === "PATCH" ? "read" : "list"),
      {
        method,
        cache: "no-store",
        headers: buildAdminAuthHeaders(auth.token),
      },
    );

    return respondWithUpstream(upstream);
  } catch (error) {
    console.error(`[${method} /admin/api/notifications/users/[id]]`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyUserNotifications(req, params, "GET");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyUserNotifications(req, params, "PATCH");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyUserNotifications(req, params, "DELETE");
}