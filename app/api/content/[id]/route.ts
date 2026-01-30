import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/cookies";
import { normalizeBearerToken } from "@/lib/auth/normalizeToken";

const BASE = process.env.GOKAI_CONTENT_API_BASE!;
export async function GET() {
  const raw = await getAuthToken();
  if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = normalizeBearerToken(raw);

  const upstream = await fetch(`${BASE}/content/kanji`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const token = getAuthToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const upstream = await fetch(`${BASE}/content/kanji/${ctx.params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const token = getAuthToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const upstream = await fetch(`${BASE}/content/kanji/${ctx.params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}