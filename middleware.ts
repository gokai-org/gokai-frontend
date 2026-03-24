import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function normalizeProfile(value?: string): "admin" | "user" | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "admin" || normalized === "user") return normalized;

  return null;
}

function getProfileFromToken(token?: string): "admin" | "user" | null {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return normalizeProfile(payload?.profile ?? payload?.role);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get("gokai_token")?.value;
  const cookieProfile = normalizeProfile(req.cookies.get("gokai_profile")?.value);
  const tokenProfile = getProfileFromToken(token);
  const profile = tokenProfile ?? cookieProfile;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/admin/api");
  const isUserDashboardRoute = pathname.startsWith("/dashboard");

  const isProtected = isUserDashboardRoute || isAdminRoute;

  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/membership");

  // Si intenta acceder a páginas de auth y ya está autenticado, redirigir al dashboard
  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = profile === "admin" ? "/admin/dashboard" : "/dashboard/graph";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && !token) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && token && profile !== "admin") {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: "Acceso restringido a administradores" }, { status: 403 });
    }

    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/graph";
    return NextResponse.redirect(url);
  }

  // Si intenta acceder a rutas protegidas sin token, redirigir al login
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
