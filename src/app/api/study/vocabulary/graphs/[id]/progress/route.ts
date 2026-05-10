import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { getBearerTokenFromRequest } from "@/app/api/_utils/auth";

export const dynamic = "force-dynamic";

const STUDY_TIMEOUT_MS = 8000;

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const { id } = await params;
  const upstreamPath = `/vocabulary/graphs/${id}/progress`;
  const upstreamUrl = buildStudyUrl(upstreamPath);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
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
    console.error("GET /api/study/vocabulary/graphs/[id]/progress error:", error);
    return NextResponse.json(
      { error: "Error interno al cargar progreso del grafo" },
      { status: 500 },
    );
  }
}
