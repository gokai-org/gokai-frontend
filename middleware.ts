import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("gokai_token")?.value;

  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

  const isAuthPage =
    req.nextUrl.pathname.startsWith("/auth/login") ||
    req.nextUrl.pathname.startsWith("/auth/register") ||
    req.nextUrl.pathname.startsWith("/auth/membership");

  // Si intenta acceder a páginas de auth y ya está autenticado, redirigir al dashboard
  if (isAuthPage && token) {
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
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
