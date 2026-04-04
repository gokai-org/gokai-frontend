import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig, billingConfig } from "@/shared/config";

function parseTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64").toString());
  } catch {
    return null;
  }
}

function isUserNotFoundError(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const error = "error" in data ? String((data as { error?: unknown }).error ?? "") : "";
  const normalized = error.toLowerCase();
  return normalized.includes("user not found") || normalized.includes("usuario no encontrado");
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const rawToken = getTokenFromRequest(req);

    if (!rawToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = normalizeBearerToken(rawToken);
    const payload = parseTokenPayload(token);
    const tokenUserId =
      (payload?.userId as string | undefined) ??
      (payload?.sub as string | undefined) ??
      (payload?.id as string | undefined);
    const tokenEmail = (payload?.email as string | undefined) ?? undefined;
    const body = await req.json().catch(() => ({}));

    const requestedPriceId =
      typeof body.priceId === "string" ? body.priceId.trim() : "";
    const successUrl =
      typeof body.successUrl === "string" ? body.successUrl.trim() : "";

    // Prefer an explicit price from the client, but allow secure server-side fallback.
    const priceId =
      requestedPriceId ||
      billingConfig.subscriptionPriceId ||
      billingConfig.publicSubscriptionPriceId;

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Error de configuración: falta SUBSCRIPTION_PRICE_ID, STRIPE_PRICE_ID, NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID o NEXT_PUBLIC_STRIPE_PRICE_ID",
        },
        { status: 500 },
      );
    }

    const finalSuccessUrl = successUrl || `${req.nextUrl.origin}/checkout/success`;

    const subscribe = async () => {
      return fetch(`${apiConfig.subscriptionsApiBase}/subscriptions/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(tokenUserId ? { "X-User-Id": tokenUserId } : {}),
          ...(tokenEmail ? { "X-User-Email": tokenEmail } : {}),
        },
        body: JSON.stringify({
          priceId,
          successUrl: finalSuccessUrl,
          ...(tokenUserId ? { userId: tokenUserId } : {}),
          ...(tokenEmail ? { email: tokenEmail } : {}),
        }),
        credentials: "include",
      });
    };

    let res = await subscribe();

    if (res.redirected) {
      return NextResponse.redirect(res.url);
    }

    let data = await res.json();

    if (!res.ok && isUserNotFoundError(data)) {
      // Right after registration, some backends need a short propagation window.
      for (const delay of [300, 700, 1200]) {
        await sleep(delay);
        res = await subscribe();
        data = await res.json();
        if (res.ok || !isUserNotFoundError(data)) break;
      }
    }

    if (data.url) {
      return NextResponse.json({ url: data.url });
    }

    return NextResponse.json(
      { error: data.error || "Error al crear sesión de pago" },
      { status: res.status || 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Error de red o formato" },
      { status: 500 },
    );
  }
}
