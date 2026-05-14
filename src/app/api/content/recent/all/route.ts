import { NextRequest, NextResponse } from "next/server";
import {
  getBearerTokenFromRequest,
  getUserIdFromToken,
} from "@/app/api/_utils/auth";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const userId = getUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json(
      { error: "Could not resolve user id" },
      { status: 401 },
    );
  }

  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/recent/${userId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}