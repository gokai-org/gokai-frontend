import { NextRequest, NextResponse } from "next/server";
import { appConfig, authConfig } from "@/shared/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  if (!authConfig.googleClientId) {
    return NextResponse.json(
      {
        error: "Google OAuth no configurado (GOOGLE_CLIENT_ID)",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store, no-cache, max-age=0",
        },
      },
    );
  }

  const googleAuthUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth",
  );

  const state = crypto.randomUUID();

  googleAuthUrl.searchParams.set(
    "client_id",
    authConfig.googleClientId,
  );

  googleAuthUrl.searchParams.set(
    "redirect_uri",
    authConfig.googleRedirectUri,
  );

  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");
  googleAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(
    googleAuthUrl.toString(),
  );

  response.cookies.set("gokai_oauth_state", state, {
    httpOnly: true,
    secure: appConfig.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0",
  );

  return response;
}