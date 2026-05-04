import type { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return Buffer.from(padded, "base64").toString("utf8");
}

export function getUserIdFromToken(token: string): string | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(tokenParts[1])) as {
      userId?: string;
      sub?: string;
      id?: string;
    };

    return payload.userId ?? payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}

export function getBearerTokenFromRequest(req: NextRequest) {
  const rawToken = getTokenFromRequest(req);

  if (!rawToken) {
    return null;
  }

  return normalizeBearerToken(rawToken);
}
