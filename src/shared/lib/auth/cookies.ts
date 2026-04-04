import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { appConfig } from "@/shared/config";

export const AUTH_COOKIE = "gokai_token";
export const PROFILE_COOKIE = "gokai_profile";

const COOKIE_CONFIG: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: appConfig.isProduction,
  sameSite: "lax",
  path: "/",
};

export function getCookieConfig(maxAge?: number): Partial<ResponseCookie> {
  return {
    ...COOKIE_CONFIG,
    ...(maxAge ? { maxAge } : {}),
  };
}

export async function setAuthCookie(token: string) {
  (await cookies()).set(AUTH_COOKIE, token, getCookieConfig(60 * 60 * 24 * 7));
}

export async function clearAuthCookie() {
  (await cookies()).set(AUTH_COOKIE, "", getCookieConfig(0));
}

/** Read token from Next.js headers store (may fail in cached route handlers). */
export async function getAuthToken() {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}

/** Read token directly from the incoming request – always reliable. */
export function getTokenFromRequest(req: NextRequest | Request): string | null {
  if (
    "cookies" in req &&
    typeof (req as NextRequest).cookies?.get === "function"
  ) {
    return (req as NextRequest).cookies.get(AUTH_COOKIE)?.value ?? null;
  }

  const header = req.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE}=([^;]*)`));
  return match?.[1] ?? null;
}
