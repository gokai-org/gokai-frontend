import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { requireKanaContentAccess } from "@/app/api/_utils/kanaContentAccess";

export const dynamic = "force-dynamic";

const STUDY_TIMEOUT_MS = 10000;
const allowedQuizTypes = new Set(["speaking", "listening", "meaning", "writing"]);

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireKanaContentAccess(req);

  if (access.response) {
    return access.response;
  }

  const { id } = await params;
  const { token } = access;
  const type = req.nextUrl.searchParams.get("type") ?? "meaning";
  const wordId = req.nextUrl.searchParams.get("wordId");

  if (!allowedQuizTypes.has(type)) {
    return NextResponse.json({ error: "Invalid quiz type" }, { status: 400 });
  }

  const upstreamQuery = new URLSearchParams({ type });
  if (wordId) {
    upstreamQuery.set("wordId", wordId);
  }

  const upstreamPath = `/vocabulary/quiz/${id}?${upstreamQuery.toString()}`;
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
    console.error("GET /api/study/vocabulary/quiz/[id] error:", error);
    return NextResponse.json(
      { error: "Error interno al cargar quiz de vocabulario" },
      { status: 500 },
    );
  }
}
