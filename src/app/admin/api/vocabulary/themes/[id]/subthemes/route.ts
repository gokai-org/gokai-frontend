import { NextRequest } from "next/server";
import { proxyContentJson } from "../../../_utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyContentJson(req, `/content/subthemes/${id}`, { method: "GET" });
}