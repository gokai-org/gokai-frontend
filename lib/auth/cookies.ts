import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const AUTH_COOKIE = "gokai_token";

const COOKIE_CONFIG: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
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

export async function getAuthToken() {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}