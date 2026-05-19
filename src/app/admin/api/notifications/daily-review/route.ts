import { NextRequest } from "next/server";
import { proxyNotificationDispatch } from "../_helpers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return proxyNotificationDispatch(req, "/push/daily-review");
}