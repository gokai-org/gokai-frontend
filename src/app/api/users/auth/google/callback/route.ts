import { NextRequest, NextResponse } from "next/server";
import { apiConfig, appConfig, authConfig } from "@/shared/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeProfile(value: unknown): "admin" | "user" | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "admin" || normalized === "user") {
    return normalized;
  }

  return null;
}

function getProfileFromToken(token: string): "admin" | "user" | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(tokenParts[1], "base64url").toString(),
    );

    return normalizeProfile(payload?.profile ?? payload?.role);
  } catch {
    return null;
  }
}

function getPublicOrigin(request: NextRequest): string {
  try {
    const configuredUrl = new URL(authConfig.googleRedirectUri);
    const isLocalhost =
      configuredUrl.hostname === "localhost" ||
      configuredUrl.hostname === "127.0.0.1";

    if (!appConfig.isProduction || !isLocalhost) {
      return configuredUrl.origin;
    }
  } catch {
    // Intenta obtener el dominio desde los encabezados del proxy.
  }

  const forwardedHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host");

  const forwardedProto =
    request.headers.get("x-forwarded-proto") ??
    (appConfig.isProduction ? "https" : "http");

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function publicUrl(request: NextRequest, path: string): URL {
  return new URL(path, `${getPublicOrigin(request)}/`);
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(publicUrl(request, path));

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0",
  );

  return response;
}

function clearOAuthState(response: NextResponse): void {
  response.cookies.set("gokai_oauth_state", "", {
    httpOnly: true,
    secure: appConfig.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get("gokai_oauth_state")?.value;

  if (error) {
    console.error("Google OAuth error:", error);

    const response = redirectTo(
      request,
      "/auth/login?error=google_auth_failed",
    );

    clearOAuthState(response);
    return response;
  }

  if (!state || !cookieState || state !== cookieState) {
    console.error("Estado OAuth inválido:", {
      hasState: Boolean(state),
      hasCookieState: Boolean(cookieState),
      matches: Boolean(state && cookieState && state === cookieState),
    });

    const response = redirectTo(
      request,
      "/auth/login?error=invalid_state",
    );

    clearOAuthState(response);
    return response;
  }

  if (!code) {
    const response = redirectTo(request, "/auth/login?error=no_code");
    clearOAuthState(response);
    return response;
  }

  if (!authConfig.googleClientId || !authConfig.googleClientSecret) {
    console.error("Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET");

    const response = redirectTo(
      request,
      "/auth/login?error=google_not_configured",
    );

    clearOAuthState(response);
    return response;
  }

  try {
    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: authConfig.googleClientId,
          client_secret: authConfig.googleClientSecret,
          redirect_uri: authConfig.googleRedirectUri,
          grant_type: "authorization_code",
        }),
        cache: "no-store",
      },
    );

    const tokenRaw = await tokenResponse.text();
    let tokens: Record<string, unknown> = {};

    try {
      tokens = JSON.parse(tokenRaw) as Record<string, unknown>;
    } catch {
      tokens = {};
    }

    if (!tokenResponse.ok) {
      console.error("Google token exchange failed:", tokenRaw);

      const response = redirectTo(
        request,
        "/auth/login?error=token_exchange_failed",
      );

      clearOAuthState(response);
      return response;
    }

    const idToken =
      typeof tokens.id_token === "string" ? tokens.id_token : null;

    if (!idToken) {
      console.error("Google no devolvió id_token");

      const response = redirectTo(
        request,
        "/auth/login?error=no_id_token",
      );

      clearOAuthState(response);
      return response;
    }

    const backendUrl =
      `${apiConfig.usersApiBase}${authConfig.googleAuthPath}`;

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    });

    const backendRaw = await backendResponse.text();
    let backendData: Record<string, unknown> = {};

    try {
      backendData = JSON.parse(backendRaw) as Record<string, unknown>;
    } catch {
      backendData = { raw: backendRaw };
    }

    if (!backendResponse.ok) {
      console.error(
        "Google backend failed:",
        backendResponse.status,
        backendData,
      );

      const response = redirectTo(
        request,
        `/auth/login?error=backend_failed&status=${backendResponse.status}`,
      );

      clearOAuthState(response);
      return response;
    }

    if (!backendData.registered) {
      const googleData =
        (backendData.googleData ?? {}) as Record<string, unknown>;

      const membershipUrl = publicUrl(request, "/auth/membership");

      if (googleData.email) {
        membershipUrl.searchParams.set(
          "email",
          String(googleData.email),
        );
      }

      if (googleData.givenName) {
        membershipUrl.searchParams.set(
          "firstName",
          String(googleData.givenName),
        );
      }

      if (googleData.familyName) {
        membershipUrl.searchParams.set(
          "lastName",
          String(googleData.familyName),
        );
      }

      membershipUrl.searchParams.set("google", "1");

      const response = NextResponse.redirect(membershipUrl);
      clearOAuthState(response);
      return response;
    }

    const token =
      typeof backendData.token === "string"
        ? backendData.token
        : null;

    if (!token) {
      const response = redirectTo(
        request,
        "/auth/login?error=no_token",
      );

      clearOAuthState(response);
      return response;
    }

    const profile =
      normalizeProfile(backendData.profile) ??
      getProfileFromToken(token);

    const destination =
      profile === "admin"
        ? "/admin/dashboard"
        : "/dashboard/graph";

    const response = redirectTo(request, destination);

    clearOAuthState(response);

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
        httpOnly: true,
        secure: appConfig.isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }

    return response;
  } catch (error) {
    console.error("Unexpected OAuth callback error:", error);

    const response = redirectTo(
      request,
      "/auth/login?error=unexpected_error",
    );

    clearOAuthState(response);
    return response;
  }
}