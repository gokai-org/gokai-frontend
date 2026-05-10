import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import {
  getBearerTokenFromRequest,
  getUserIdFromToken,
} from "@/app/api/_utils/auth";

export const dynamic = "force-dynamic";

const STUDY_TIMEOUT_MS = 8000;

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}

async function readJson(upstream: Response) {
  return upstream.json().catch(() => ({}));
}

export async function GET(req: NextRequest) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const upstreamPath = `/vocabulary/graphs/${userId}`;
  const upstreamUrl = buildStudyUrl(upstreamPath);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(STUDY_TIMEOUT_MS),
    });

    const data = await readJson(upstream);
    return NextResponse.json(data, {
      status: upstream.status,
      headers: {
        "x-gokai-upstream": new URL(upstreamUrl).host,
        "x-gokai-upstream-path": upstreamPath,
      },
    });
  } catch (error) {
    console.error("GET /api/study/vocabulary/graphs error:", error);
    return NextResponse.json(
      { error: "Error interno al listar grafos de vocabulario" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const upstreamPath = "/vocabulary/graphs";
  const upstreamUrl = buildStudyUrl(upstreamPath);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(STUDY_TIMEOUT_MS),
    });

    const data = await readJson(upstream);
    return NextResponse.json(data, {
      status: upstream.status,
      headers: {
        "x-gokai-upstream": new URL(upstreamUrl).host,
        "x-gokai-upstream-path": upstreamPath,
      },
    });
  } catch (error) {
    console.error("POST /api/study/vocabulary/graphs error:", error);
    return NextResponse.json(
      { error: "Error interno al crear grafo de vocabulario" },
      { status: 500 },
    );
  }
}
