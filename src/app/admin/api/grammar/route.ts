import { NextRequest } from "next/server";
import { proxyContentJson } from "../vocabulary/_utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyContentJson(req, "/content/grammar", { method: "GET" });
}