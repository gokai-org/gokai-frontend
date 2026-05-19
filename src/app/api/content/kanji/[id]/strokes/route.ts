import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { requireKanaContentAccess } from "@/app/api/_utils/kanaContentAccess";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireKanaContentAccess(req);

  if (access.response) {
    return access.response;
  }

  const { token } = access;
  const { id } = await params;

  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/kanjis/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const viewBox = data?.viewBox ?? data?.view_box ?? "0 0 109 109";
  const strokes = data?.strokes ?? [];

  if (!Array.isArray(strokes) || strokes.length === 0) {
    return NextResponse.json({ error: "Strokes not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      kanjiId: data?.id ?? id,
      viewBox,
      strokes,
    },
    { status: 200 },
  );
}
