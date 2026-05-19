import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { getBearerTokenFromRequest } from "@/app/api/_utils/auth";
import { normalizeKanaProgressPayload } from "@/app/api/_utils/kanaProgress";
import {
  KANA_ACCESS_REQUIREMENT_MESSAGE,
  resolveKanaMasteryState,
} from "@/features/kana/lib/kanaMastery";

const KANA_PROGRESS_TIMEOUT_MS = 5000;

type RequireKanaContentAccessResult =
  | {
      token: string;
      response: null;
    }
  | {
      token: null;
      response: NextResponse;
    };

function buildKanaProgressUrl() {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}/kana/progress`;
}

export function buildKanaContentAccessDeniedResponse() {
  return NextResponse.json(
    {
      code: "kana_content_access_required",
      message: KANA_ACCESS_REQUIREMENT_MESSAGE,
      success: false,
    },
    { status: 403 },
  );
}

export async function requireKanaContentAccess(
  req: NextRequest,
): Promise<RequireKanaContentAccessResult> {
  const token = getBearerTokenFromRequest(req);

  if (!token) {
    return {
      token: null,
      response: NextResponse.json({ error: "No auth cookie" }, { status: 401 }),
    };
  }

  try {
    const upstream = await fetch(buildKanaProgressUrl(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(KANA_PROGRESS_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      const errorData = await upstream.json().catch(() => ({}));
      return {
        token: null,
        response: NextResponse.json(errorData, { status: upstream.status }),
      };
    }

    const payload = await upstream.json().catch(() => null);
    const progress = normalizeKanaProgressPayload(payload);
    const masteryState = resolveKanaMasteryState(progress);

    if (!masteryState.hasKanaContentAccess) {
      return {
        token: null,
        response: buildKanaContentAccessDeniedResponse(),
      };
    }

    return { token, response: null };
  } catch (error) {
    console.error("[API] Error validating kana content access:", error);
    return {
      token: null,
      response: NextResponse.json(
        {
          code: "kana_content_access_validation_failed",
          message: "No se pudo validar el dominio de hiragana y katakana.",
          success: false,
        },
        { status: 503 },
      ),
    };
  }
}