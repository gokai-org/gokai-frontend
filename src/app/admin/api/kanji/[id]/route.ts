import { NextRequest } from "next/server";
import { proxyContentJson, readJsonBody } from "../../vocabulary/_utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyContentJson(req, `/content/kanjis/${id}`, { method: "GET" });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await readJsonBody(req);

  return proxyContentJson(req, "/content/kanjis", {
    method: "PUT",
    body: JSON.stringify({ ...body, id }),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyContentJson(req, `/content/kanjis/${id}`, { method: "DELETE" });
}