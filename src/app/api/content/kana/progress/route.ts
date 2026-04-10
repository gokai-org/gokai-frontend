import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

type RawProgressItem = {
  kanaId?: string;
  symbol?: string;
  kanaType?: string;
  kana_type?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
  pointsNeeded?: number;
  points_needed?: number;
  exerciseType?: string;
  exercise_type?: string;
  completed?: boolean;
  message?: string;
};

function normalizeProgressItem(raw: RawProgressItem) {
  return {
    kanaId: raw.kanaId ?? "",
    symbol: raw.symbol ?? "",
    kanaType:
      raw.kanaType === "katakana" || raw.kana_type === "katakana"
        ? "katakana"
        : "hiragana",
    pointsToUnlock: raw.pointsToUnlock ?? raw.points_to_unlock ?? 0,
    pointsNeeded: raw.pointsNeeded ?? raw.points_needed ?? 0,
    exerciseType:
      raw.exerciseType ?? raw.exercise_type ?? "",
    completed: raw.completed === true,
    message: raw.message,
  };
}

export async function GET(req: NextRequest) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);

  try {
    const upstream = await fetch(`${apiConfig.studyApiBase}/kana/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = JSON.parse(text) as Record<string, unknown>;
      } catch {
        errorData = { message: text };
      }

      return NextResponse.json(
        {
          message: errorData.message || "Error al obtener progreso de kana",
          success: false,
        },
        { status: upstream.status },
      );
    }

    const data: unknown = text ? JSON.parse(text) : [];
    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { progress?: unknown[] })?.progress)
        ? (data as { progress: unknown[] }).progress
        : Array.isArray((data as { data?: unknown[] })?.data)
          ? (data as { data: unknown[] }).data
          : [];

    return NextResponse.json(
      items.map((item) => normalizeProgressItem(item as RawProgressItem)),
    );
  } catch (error) {
    console.error("[API] Error fetching kana progress:", error);
    return NextResponse.json(
      { message: "Error interno al obtener progreso de kana", success: false },
      { status: 500 },
    );
  }
}