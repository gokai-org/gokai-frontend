import { NextRequest } from "next/server";
import { proxyContentJson } from "../_utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyContentJson(req, "/content/themes", { method: "GET" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyContentJson(req, "/content/themes", { method: "POST", body });
}