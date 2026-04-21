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

type ApiFetchOptions = {
  dedupeKey?: string;
  cacheKey?: string;
  cacheTtlMs?: number;
};

const inFlightGetRequests = new Map<string, Promise<unknown>>();
const cachedGetResponses = new Map<
  string,
  {
    loadedAt: number;
    data: unknown;
  }
>();

function readCachedGetResponse<T>(cacheKey: string, ttlMs: number): T | null {
  const memoryValue = cachedGetResponses.get(cacheKey);

  if (memoryValue && Date.now() - memoryValue.loadedAt < ttlMs) {
    return memoryValue.data as T;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(cacheKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      loadedAt?: number;
      data?: unknown;
    };

    if (
      typeof parsed.loadedAt !== "number" ||
      Date.now() - parsed.loadedAt >= ttlMs
    ) {
      window.sessionStorage.removeItem(cacheKey);
      return null;
    }

    const cachedValue = {
      loadedAt: parsed.loadedAt,
      data: parsed.data,
    };

    cachedGetResponses.set(cacheKey, cachedValue);
    return cachedValue.data as T;
  } catch {
    return null;
  }
}

function writeCachedGetResponse(cacheKey: string, data: unknown) {
  const nextValue = {
    loadedAt: Date.now(),
    data,
  };

  cachedGetResponses.set(cacheKey, nextValue);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(nextValue));
  } catch {
    // Ignore storage failures.
  }
}

async function performApiFetch<T>(
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

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const responseCacheKey =
    method === "GET" && options.cacheTtlMs && options.cacheKey
      ? `api-cache:${options.cacheKey}`
      : null;
  const requestKey =
    method === "GET" && options.dedupeKey
      ? `${method}:${options.dedupeKey}`
      : null;

  if (responseCacheKey && options.cacheTtlMs) {
    const cachedResponse = readCachedGetResponse<T>(
      responseCacheKey,
      options.cacheTtlMs,
    );

    if (cachedResponse !== null) {
      return cachedResponse;
    }
  }

  if (!requestKey) {
    const response = await performApiFetch<T>(path, init);

    if (responseCacheKey) {
      writeCachedGetResponse(responseCacheKey, response);
    }

    return response;
  }

  const existingRequest = inFlightGetRequests.get(requestKey);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const requestPromise = performApiFetch<T>(path, init)
    .then((response) => {
      if (responseCacheKey) {
        writeCachedGetResponse(responseCacheKey, response);
      }

      return response;
    })
    .finally(() => {
      inFlightGetRequests.delete(requestKey);
    });

  inFlightGetRequests.set(requestKey, requestPromise);
  return requestPromise;
}
