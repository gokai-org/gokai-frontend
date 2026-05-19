import { NextRequest } from "next/server";
import { proxyContentJson } from "../vocabulary/_utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyContentJson(req, "/content/kanjis", { method: "GET" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyContentJson(req, "/content/kanjis", { method: "POST", body });
}