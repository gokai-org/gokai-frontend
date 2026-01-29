import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("gokai_token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: { authenticated: true } }, { status: 200 });
}