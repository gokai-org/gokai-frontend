import { NextRequest, NextResponse } from "next/server";

import { getBearerTokenFromRequest } from "@/app/api/_utils/auth";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

const STUDY_TIMEOUT_MS = 8000;

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}

async function readJson(upstream: Response) {
  return upstream.json().catch(() => ({}));
}

async function proxyToStudy(
  req: NextRequest,
  method: "GET" | "POST",
) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const search = method === "GET" ? req.nextUrl.search : "";
  const upstreamPath = `/recommendations${search}`;
  const upstreamUrl = buildStudyUrl(upstreamPath);

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    console.error(`${method} /api/study/reviews error:`, error);
    return NextResponse.json(
      { error: "Error interno al cargar recomendaciones de repaso" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyToStudy(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxyToStudy(req, "POST");
}