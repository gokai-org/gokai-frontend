import { NextRequest, NextResponse } from "next/server";
import { apiConfig, appConfig, authConfig } from "@/shared/config";

function normalizeProfile(value: unknown): "admin" | "user" | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "admin" || normalized === "user") return normalized;

  return null;
}

function getProfileFromToken(token: string): "admin" | "user" | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
    return normalizeProfile(payload?.profile ?? payload?.role);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=google_auth_failed", request.url),
    );
  }

  const cookieState = request.cookies.get("gokai_oauth_state")?.value;
  if (!state || !cookieState || state !== cookieState) {
    console.error("State inválido:", { state, cookieState });
    return NextResponse.redirect(
      new URL("/auth/login?error=invalid_state", request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=no_code", request.url),
    );
  }

  if (!authConfig.googleClientId || !authConfig.googleClientSecret) {
    console.error("Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET");
    return NextResponse.redirect(
      new URL("/auth/login?error=google_not_configured", request.url),
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: authConfig.googleClientId,
        client_secret: authConfig.googleClientSecret,
        redirect_uri: authConfig.googleRedirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenRaw = await tokenResponse.text();
    let tokens: Record<string, unknown> = {};

    try {
      tokens = JSON.parse(tokenRaw) as Record<string, unknown>;
    } catch {}

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenRaw);
      return NextResponse.redirect(
        new URL("/auth/login?error=token_exchange_failed", request.url),
      );
    }

    const idToken = tokens.id_token;
    if (!idToken) {
      console.error("No id_token:", tokens);
      return NextResponse.redirect(
        new URL("/auth/login?error=no_id_token", request.url),
      );
    }

    const backendUrl = `${apiConfig.usersApiBase}${authConfig.googleAuthPath}`;
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const backendRaw = await backendResponse.text();
    let backendData: Record<string, unknown> = {};

    try {
      backendData = JSON.parse(backendRaw) as Record<string, unknown>;
    } catch {
      backendData = { raw: backendRaw };
    }

    if (!backendResponse.ok) {
      console.error("Backend failed:", backendResponse.status, backendData);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=backend_failed&status=${backendResponse.status}`,
          request.url,
        ),
      );
    }

    if (!backendData.registered) {
      const gd = (backendData.googleData ?? {}) as Record<string, unknown>;
      const url = new URL("/auth/membership", request.url);

      if (gd.email) url.searchParams.set("email", String(gd.email));
      if (gd.givenName) url.searchParams.set("firstName", String(gd.givenName));
      if (gd.familyName) {
        url.searchParams.set("lastName", String(gd.familyName));
      }
      url.searchParams.set("google", "1");

      return NextResponse.redirect(url);
    }

    const token = backendData.token as string | undefined;
    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login?error=no_token", request.url),
      );
    }

    const profile =
      normalizeProfile(backendData.profile) ?? getProfileFromToken(token);
    const destination =
      profile === "admin" ? "/admin/dashboard" : "/dashboard/graph";

    const response = NextResponse.redirect(new URL(destination, request.url));

    response.cookies.set("gokai_oauth_state", "", {
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("gokai_token", token, {
      httpOnly: true,
      secure: appConfig.isProduction,
      sameSite: "lax",
      path: "/",
    });

    if (profile) {
      response.cookies.set("gokai_profile", profile, {
        httpOnly: true,
        secure: appConfig.isProduction,
        sameSite: "lax",
        path: "/",
      });
    } else {
      response.cookies.set("gokai_profile", "", {
        path: "/",
        maxAge: 0,
      });
    }

    return response;
  } catch (err) {
    console.error("Unexpected OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/auth/login?error=unexpected_error", request.url),
    );
  }
}
