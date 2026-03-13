import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("gokai_token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: { authenticated: true } }, { status: 200 });
}
