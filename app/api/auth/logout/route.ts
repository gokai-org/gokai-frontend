import { NextResponse } from "next/server";
import { AUTH_COOKIE, getCookieConfig } from "@/lib/auth/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", getCookieConfig(0));
  return res;
}