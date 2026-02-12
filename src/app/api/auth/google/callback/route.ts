import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/api/auth/google/callback";

const USERS_API_BASE =
  process.env.GOKAI_USERS_API_BASE ||
  "http://localhost:8082";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Error enviado por Google
  if (error) {
    console.error("Error en OAuth de Google:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=google_auth_failed", request.url)
    );
  }

  // No vino code
  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=no_code", request.url)
    );
  }

  // Variables mal configuradas
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Credenciales de Google no configuradas");
    return NextResponse.redirect(
      new URL("/auth/login?error=google_not_configured", request.url)
    );
  }

  try {
    console.log("Intercambiando código por tokens de Google...");

    // Intercambio code -> tokens
    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error("Error intercambiando código con Google");
      return NextResponse.redirect(
        new URL("/auth/login?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const idToken = tokens.id_token;

    if (!idToken) {
      console.error("No se recibió id_token de Google");
      return NextResponse.redirect(
        new URL("/auth/login?error=no_id_token", request.url)
      );
    }

    console.log("Tokens obtenidos de Google");

    // Enviar idToken a tu backend
    const GOOGLE_AUTH_PATH = process.env.GOKAI_GOOGLE_AUTH_PATH || "/auth/google";
    const backendUrl = `${USERS_API_BASE}${GOOGLE_AUTH_PATH}`;

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
      }),
    });

    console.log("Backend URL:", backendUrl);
    console.log("Backend status:", backendResponse.status);

    if (!backendResponse.ok) {
      const raw = await backendResponse.text();
      let errorData: any = { error: raw || "Error en backend" };
      try {
        errorData = JSON.parse(raw);
      } catch {}

      console.error("Error backend:", errorData);

      return NextResponse.redirect(
        new URL(
          `/auth/login?error=backend_failed&status=${backendResponse.status}`,
          request.url
        )
      );
    }

    const backendData = await backendResponse.json();
    console.log("Respuesta backend:", backendData);

    // Usuario no registrado
    if (!backendData.registered) {
      return NextResponse.redirect(
        new URL(
          "/auth/login?error=google_not_registered&message=Completa tu registro",
          request.url
        )
      );
    }

    const token = backendData.token;

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login?error=no_token", request.url)
      );
    }

    // Redirigir y setear cookie correctamente
    const response = NextResponse.redirect(
      new URL("/dashboard/graph", request.url)
    );

    response.cookies.set("gokai_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    console.log("Cookie seteada y redirigiendo a dashboard");

    return response;
  } catch (err) {
    console.error("Error inesperado en Google OAuth:", err);

    return NextResponse.redirect(
      new URL("/auth/login?error=unexpected_error", request.url)
    );
  }
}