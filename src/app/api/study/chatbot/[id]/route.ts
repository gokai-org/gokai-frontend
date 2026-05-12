import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { getBearerTokenFromRequest } from "@/app/api/_utils/auth";

export const dynamic = "force-dynamic";

const STUDY_TIMEOUT_MS = 8000;
const CHATBOT_MESSAGE_TIMEOUT_MS = 45000;

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}

async function readJson(upstream: Response) {
  return upstream.json().catch(() => ({}));
}

async function proxyToStudy(
  req: NextRequest,
  params: Promise<{ id: string }>,
  method: "GET" | "POST" | "PATCH" | "DELETE",
) {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const { id } = await params;
  const upstreamPath = `/chatbot/${id}`;
  const upstreamUrl = buildStudyUrl(upstreamPath);
  const timeoutMs =
    method === "POST" ? CHATBOT_MESSAGE_TIMEOUT_MS : STUDY_TIMEOUT_MS;
  const body =
    method === "POST" || method === "PATCH"
      ? await req.json().catch(() => ({}))
      : undefined;

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
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
    console.error(`${method} /api/study/chatbot/${id} error:`, error);

    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        {
          error:
            "El chatbot tardó demasiado en responder. Intenta de nuevo en unos segundos.",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: "Error interno en la operación del chatbot" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyToStudy(req, params, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyToStudy(req, params, "POST");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyToStudy(req, params, "PATCH");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyToStudy(req, params, "DELETE");
}