export function redirectToLanding() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/") return;
  window.location.replace("/");
}

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  const current = `${window.location.pathname}${window.location.search}`;
  if (window.location.pathname.startsWith("/auth/")) return;
  window.location.replace(`/auth/login?from=${encodeURIComponent(current)}`);
}

export function handleClientAuthFailure(res: Response): boolean {
  if (typeof window === "undefined") return false;

  const invalidUser =
    res.status === 410 ||
    res.headers.get("x-auth-invalid-user") === "true" ||
    res.headers.get("x-auth-redirect") === "landing";

  if (invalidUser) {
    redirectToLanding();
    return true;
  }

  if (res.status === 401) {
    redirectToLogin();
    return true;
  }

  return false;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    handleClientAuthFailure(res);
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}
