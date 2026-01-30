import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth/cookies";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";
const USERS_API_BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.error("Error en OAuth de Google:", error);
    return NextResponse.redirect(new URL("/auth/login?error=google_auth_failed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url));
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Credenciales de Google no configuradas");
    return NextResponse.redirect(new URL("/auth/login?error=google_not_configured", request.url));
  }

  try {
    console.log("🔄 Intercambiando código por tokens de Google...");

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
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
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error("Error obteniendo tokens:", errorData);
      return NextResponse.redirect(new URL("/auth/login?error=token_exchange_failed", request.url));
    }

    const tokens = await tokenResponse.json();
    console.log("Tokens obtenidos de Google");

    const idToken = tokens.id_token;
    if (!idToken) {
      console.error("No se recibió id_token de Google");
      return NextResponse.redirect(new URL("/auth/login?error=no_id_token", request.url));
    }

    const backendResponse = await fetch(`${USERS_API_BASE}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken: idToken,
      }),
    });

    console.log("Backend response status:", backendResponse.status);
    console.log("Backend URL:", `${USERS_API_BASE}/auth/google`);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error text:", errorText);
      const errorData = await backendResponse.json().catch(() => ({ error: errorText || "Error en el backend" }));
      console.error("Error en backend:", {
        status: backendResponse.status,
        data: errorData,
      });
      return NextResponse.redirect(new URL(`/auth/login?error=backend_failed&status=${backendResponse.status}`, request.url));
    }

    const backendData = await backendResponse.json();
    console.log("Respuesta del backend:", backendData);

    if (!backendData.registered) {
      console.log("Usuario no registrado, redirigiendo a registro");
      return NextResponse.redirect(new URL("/auth/login?error=google_not_registered&message=Por favor completa tu registro", request.url));
    }

    const token = backendData.token;
    if (!token) {
      console.error("No se recibió token del backend");
      return NextResponse.redirect(new URL("/auth/login?error=no_token", request.url));
    }

    const response = NextResponse.redirect(new URL("/dashboard/graph", request.url));

    await setAuthCookie(token);

    console.log("Redirigiendo a dashboard");
    
    return response;
  } catch (error) {
    console.error("Error en flujo de Google OAuth:", error);
    return NextResponse.redirect(new URL("/auth/login?error=unexpected_error", request.url));
  }
}
