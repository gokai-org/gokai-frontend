import { NextRequest } from "next/server";
import { proxyContentJson, readJsonBody } from "../../vocabulary/_utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await readJsonBody(req);

  return proxyContentJson(req, "/content/kanjis/reorder", {
    method: "POST",
    body: JSON.stringify(body),
  });
}