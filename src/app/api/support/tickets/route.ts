import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set([
  "technical_issue",
  "billing",
  "account_access",
  "bug_report",
  "feature_request",
  "other",
]);

export async function POST(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body inválido (JSON requerido)" },
      { status: 400 },
    );
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const category = String(body.category ?? "").trim();
  const message = String(body.message ?? "").trim();

  const errors: string[] = [];

  if (!name) errors.push("'name' es requerido");
  if (!email) errors.push("'email' es requerido");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("'email' tiene formato inválido");
  }
  if (!subject) errors.push("'subject' es requerido");
  if (!category) errors.push("'category' es requerido");
  else if (!VALID_CATEGORIES.has(category)) {
    errors.push(
      `'category' inválida: "${category}". Valores: ${[...VALID_CATEGORIES].join(", ")}`,
    );
  }
  if (!message) errors.push("'message' es requerido");
  else if (message.length < 10) {
    errors.push("'message' debe tener al menos 10 caracteres");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${apiConfig.usersApiBase}/support/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, subject, category, message }),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error("Error proxy support/tickets:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}