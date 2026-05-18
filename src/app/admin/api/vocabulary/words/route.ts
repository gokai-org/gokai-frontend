import { NextRequest } from "next/server";
import { proxyContentJson } from "../_utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyContentJson(req, "/content/words", { method: "POST", body });
}