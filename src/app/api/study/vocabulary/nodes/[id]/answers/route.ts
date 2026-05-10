import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { getBearerTokenFromRequest } from "@/app/api/_utils/auth";

export const dynamic = "force-dynamic";

const STUDY_TIMEOUT_MS = 8000;

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const upstreamPath = `/vocabulary/nodes/${id}/answers`;
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

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: upstream.status,
      headers: {
        "x-gokai-upstream": new URL(upstreamUrl).host,
        "x-gokai-upstream-path": upstreamPath,
      },
    });
  } catch (error) {
    console.error("POST /api/study/vocabulary/nodes/[id]/answers error:", error);
    return NextResponse.json(
      { error: "Error interno al guardar respuestas de vocabulario" },
      { status: 500 },
    );
  }
}
