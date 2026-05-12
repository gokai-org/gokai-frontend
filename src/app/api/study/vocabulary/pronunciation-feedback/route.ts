import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { getBearerTokenFromRequest } from "@/app/api/_utils/auth";

export const dynamic = "force-dynamic";

const STUDY_TIMEOUT_MS = 15000;

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}

async function readUpstreamBody(upstream: Response) {
  const contentType = upstream.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return upstream.json().catch(() => ({}));
  }

  const text = await upstream.text().catch(() => "");
  return text ? { error: text } : {};
}

export async function POST(req: NextRequest) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const wordId = formData?.get("wordId");
  const audioFile = formData?.get("audio_file") ?? formData?.get("audio");

  if (typeof wordId !== "string" || !wordId.trim()) {
    return NextResponse.json({ error: "wordId es requerido" }, { status: 400 });
  }

  if (!(audioFile instanceof File)) {
    return NextResponse.json({ error: "audio_file es requerido" }, { status: 400 });
  }

  const upstreamForm = new FormData();
  upstreamForm.append("wordId", wordId.trim());
  upstreamForm.append("audio_file", audioFile, audioFile.name || "pronunciation.wav");

  const upstreamPath = "/vocabulary/pronunciation-feedback";
  const upstreamUrl = buildStudyUrl(upstreamPath);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: upstreamForm,
      cache: "no-store",
      signal: AbortSignal.timeout(STUDY_TIMEOUT_MS),
    });

    const data = await readUpstreamBody(upstream);
    return NextResponse.json(data, {
      status: upstream.status,
      headers: {
        "x-gokai-upstream": new URL(upstreamUrl).host,
        "x-gokai-upstream-path": upstreamPath,
      },
    });
  } catch (error) {
    console.error("POST /api/study/vocabulary/pronunciation-feedback error:", error);
    return NextResponse.json(
      { error: "Error interno al evaluar pronunciación de vocabulario" },
      { status: 500 },
    );
  }
}