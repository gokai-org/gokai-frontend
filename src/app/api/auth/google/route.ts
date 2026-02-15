import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google OAuth no configurado (GOOGLE_CLIENT_ID)" }, { status: 500 });
  }

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  // Anti-CSRF
  const state = crypto.randomUUID();

  googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");
  googleAuthUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(googleAuthUrl.toString());

  // Validar en callback
  res.cookies.set("gokai_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return res;
}