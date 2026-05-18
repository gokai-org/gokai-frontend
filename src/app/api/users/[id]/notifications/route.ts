import { NextRequest, NextResponse } from "next/server";
import { getBearerTokenFromRequest, getUserIdFromToken } from "@/app/api/_utils/auth";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

function buildUpstreamUrl(req: NextRequest, userId: string) {
  const upstreamUrl = new URL(
    `${apiConfig.usersApiBase.replace(/\/$/, "")}/users/${userId}/notifications`,
  );

  for (const key of ["all", "notification_id", "unread_only"]) {
    const value = req.nextUrl.searchParams.get(key);

    if (value) {
      upstreamUrl.searchParams.set(key, value);
    }
  }

  return upstreamUrl.toString();
}

async function authorizeRequest(
  req: NextRequest,
  params: Promise<{ id: string }>,
) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const tokenUserId = getUserIdFromToken(token);
  const { id } = await params;

  if (!tokenUserId || tokenUserId !== id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    token,
    userId: id,
  };
}

async function forwardRequest(
  req: NextRequest,
  params: Promise<{ id: string }>,
  method: "GET" | "PATCH" | "DELETE",
) {
  try {
    const auth = await authorizeRequest(req, params);

    if (!auth.ok) {
      return auth.response;
    }

    const upstream = await fetch(buildUpstreamUrl(req, auth.userId), {
      method,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
    });

    const text = await upstream.text().catch(() => "");
    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return NextResponse.json(text ? JSON.parse(text) : {}, {
        status: upstream.status,
      });
    }

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType || "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error(`[${method} /api/users/[id]/notifications]`, error);
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
  return forwardRequest(req, params, "GET");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return forwardRequest(req, params, "PATCH");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return forwardRequest(req, params, "DELETE");
}