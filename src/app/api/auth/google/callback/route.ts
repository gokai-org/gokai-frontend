import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

const USERS_API_BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8080";
const GOOGLE_AUTH_PATH = process.env.GOKAI_GOOGLE_AUTH_PATH || "/auth/google";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  // 1) Error de Google
  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/auth/login?error=google_auth_failed", request.url));
  }

  // 2) Validación CSRF state
  const cookieState = request.cookies.get("gokai_oauth_state")?.value;
  if (!state || !cookieState || state !== cookieState) {
    console.error("State inválido:", { state, cookieState });
    return NextResponse.redirect(new URL("/auth/login?error=invalid_state", request.url));
  }

  // 3) No vino code
  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url));
  }

  // 4) Variables necesarias
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET");
    return NextResponse.redirect(new URL("/auth/login?error=google_not_configured", request.url));
  }

  try {
    // 5) code -> tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenRaw = await tokenResponse.text();
    let tokens: any = {};
    try { tokens = JSON.parse(tokenRaw); } catch {}

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenRaw);
      return NextResponse.redirect(new URL("/auth/login?error=token_exchange_failed", request.url));
    }

    const idToken = tokens?.id_token;
    if (!idToken) {
      console.error("No id_token:", tokens);
      return NextResponse.redirect(new URL("/auth/login?error=no_id_token", request.url));
    }

    // 6) Mandar idToken a tu backend (validación + creación de sesión)
    const backendUrl = `${USERS_API_BASE}${GOOGLE_AUTH_PATH}`;
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const backendRaw = await backendResponse.text();
    let backendData: any = {};
    try { backendData = JSON.parse(backendRaw); } catch { backendData = { raw: backendRaw }; }

    if (!backendResponse.ok) {
      console.error("Backend failed:", backendResponse.status, backendData);
      return NextResponse.redirect(
        new URL(`/auth/login?error=backend_failed&status=${backendResponse.status}`, request.url)
      );
    }

    if (!backendData?.registered) {
      const gd = backendData?.googleData || {};
      const url = new URL("/auth/login", request.url);

      if (gd.email) url.searchParams.set("email", String(gd.email));
      if (gd.givenName) url.searchParams.set("firstName", String(gd.givenName));
      if (gd.familyName) url.searchParams.set("lastName", String(gd.familyName));
      url.searchParams.set("google", "1");

      return NextResponse.redirect(url);
    }

    const token = backendData?.token;
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?error=no_token", request.url));
    }

    // 7) Cookie + redirect
    const response = NextResponse.redirect(new URL("/dashboard/graph", request.url));

    // limpia state
    response.cookies.set("gokai_oauth_state", "", { path: "/", maxAge: 0 });

    response.cookies.set("gokai_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Unexpected OAuth callback error:", err);
    return NextResponse.redirect(new URL("/auth/login?error=unexpected_error", request.url));
  }
}