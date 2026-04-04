import { NextRequest, NextResponse } from "next/server";
import { appConfig, authConfig } from "@/shared/config";

export async function GET(request: NextRequest) {
  if (!authConfig.googleClientId) {
    return NextResponse.json(
      { error: "Google OAuth no configurado (GOOGLE_CLIENT_ID)" },
      { status: 500 },
    );
  }

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const state = crypto.randomUUID();

  googleAuthUrl.searchParams.set("client_id", authConfig.googleClientId);
  googleAuthUrl.searchParams.set("redirect_uri", authConfig.googleRedirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");
  googleAuthUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(googleAuthUrl.toString());

  res.cookies.set("gokai_oauth_state", state, {
    httpOnly: true,
    secure: appConfig.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return res;
}
