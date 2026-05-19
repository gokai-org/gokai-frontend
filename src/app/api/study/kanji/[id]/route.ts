import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { requireKanaContentAccess } from "@/app/api/_utils/kanaContentAccess";

export const dynamic = "force-dynamic";

const KANJI_UNLOCK_TIMEOUT_MS = 6000;

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireKanaContentAccess(req);

  if (access.response) {
    return access.response;
  }

  const { id } = await params;
  const { token } = access;
  const upstreamUrl = buildStudyUrl(`/kanji/${id}`);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(KANJI_UNLOCK_TIMEOUT_MS),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: upstream.status,
      headers: {
        "x-gokai-upstream": new URL(upstreamUrl).host,
        "x-gokai-upstream-path": `/kanji/${id}`,
      },
    });
  } catch (error) {
    console.error("[API] Error unlocking kanji:", error);
    return NextResponse.json(
      { message: "Error interno al desbloquear kanji", success: false },
      { status: 500 },
    );
  }
}