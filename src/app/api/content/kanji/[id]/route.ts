import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

const KANJI_QUIZ_POST_TIMEOUT_MS = 60000;
const KANJI_QUIZ_GET_TIMEOUT_MS = 3500;
const KANJI_DETAIL_TIMEOUT_MS = 6000;
const USER_POINTS_TIMEOUT_MS = 5000;

type KanjiQuizType = "kanji" | "meaning" | "reading" | "writing";

type RawKanji = {
  id?: string;
  symbol?: string;
  readings?: string[] | { on?: string[]; kun?: string[]; other?: string[] };
  meanings?: string[] | { es?: string[]; en?: string[]; other?: string[] };
  pointsToUnlock?: number;
  points_to_unlock?: number;
  viewBox?: string;
  view_box?: string;
  strokes?: string | string[];
};

type NormalizedKanji = ReturnType<typeof normalizeKanji>;

type QuizOption = {
  correct: boolean;
  value: string;
};

function parseStrokeList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }

  if (typeof raw !== "string") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  } catch {
    return raw.startsWith("M") || raw.startsWith("m") ? [raw] : [];
  }
}

function flattenReadings(raw: RawKanji["readings"]): string[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
  }

  if (!raw || typeof raw !== "object") {
    return [];
  }

  return [...(raw.on ?? []), ...(raw.kun ?? []), ...(raw.other ?? [])].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
}

function flattenMeanings(raw: RawKanji["meanings"]): string[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
  }

  if (!raw || typeof raw !== "object") {
    return [];
  }

  return [...(raw.es ?? []), ...(raw.en ?? []), ...(raw.other ?? [])].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
}

function normalizeKanji(raw: RawKanji) {
  return {
    id: raw.id ?? "",
    symbol: raw.symbol ?? "",
    readings: flattenReadings(raw.readings),
    meanings: flattenMeanings(raw.meanings),
    pointsToUnlock: raw.pointsToUnlock ?? raw.points_to_unlock ?? 0,
    viewBox: raw.viewBox ?? raw.view_box,
    strokes: parseStrokeList(raw.strokes),
  };
}

function isKanjiQuizType(value: unknown): value is KanjiQuizType {
  return (
    value === "kanji" ||
    value === "meaning" ||
    value === "reading" ||
    value === "writing"
  );
}

function shuffleItems<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function decodeUserIdFromToken(token: string): string | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(tokenParts[1], "base64").toString(),
    ) as {
      userId?: string;
      sub?: string;
      id?: string;
    };

    return payload.userId ?? payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}

function isTransientUpstreamFetchError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === "AbortError" || error.name === "TimeoutError") {
    return true;
  }

  const cause = "cause" in error ? error.cause : null;
  if (
    cause &&
    typeof cause === "object" &&
    "code" in cause &&
    (cause as { code?: string }).code === "UND_ERR_SOCKET"
  ) {
    return true;
  }

  return /fetch failed|other side closed/i.test(error.message);
}

async function fetchKanjiCatalog(token: string): Promise<NormalizedKanji[]> {
  const upstream = await fetch(`${apiConfig.contentApiBase}/content/kanjis`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(KANJI_DETAIL_TIMEOUT_MS),
  });

  const payload = (await upstream.json().catch(() => null)) as RawKanji[] | null;
  if (!payload || !Array.isArray(payload)) {
    return [];
  }

  return payload.map(normalizeKanji);
}

async function fetchCurrentUserPoints(token: string): Promise<number> {
  const userId = decodeUserIdFromToken(token);
  if (!userId) {
    return 0;
  }

  try {
    const upstream = await fetch(`${apiConfig.usersApiBase}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(USER_POINTS_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      return 0;
    }

    const payload = (await upstream.json().catch(() => null)) as
      | { points?: number }
      | null;

    return typeof payload?.points === "number" ? payload.points : 0;
  } catch {
    return 0;
  }
}

async function fetchKanjiDetailsMap(
  token: string,
  kanjiIds: string[],
): Promise<Map<string, NormalizedKanji>> {
  const uniqueKanjiIds = [...new Set(kanjiIds.filter((kanjiId) => kanjiId.length > 0))];

  if (uniqueKanjiIds.length === 0) {
    return new Map<string, NormalizedKanji>();
  }

  const detailEntries = await Promise.all(
    uniqueKanjiIds.map(async (kanjiId) => {
      try {
        const upstream = await fetch(
          `${apiConfig.contentApiBase}/content/kanjis/${kanjiId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(KANJI_DETAIL_TIMEOUT_MS),
          },
        );

        if (!upstream.ok) {
          return null;
        }

        const payload = (await upstream.json().catch(() => null)) as RawKanji | null;
        if (!payload) {
          return null;
        }

        return [kanjiId, normalizeKanji(payload)] as const;
      } catch {
        return null;
      }
    }),
  );

  return new Map<string, NormalizedKanji>(
    detailEntries.filter(
      (entry): entry is readonly [string, NormalizedKanji] => entry !== null,
    ),
  );
}

function buildOptionSet(
  correctValue: string,
  pool: string[],
  size: number,
): QuizOption[] {
  const options: QuizOption[] = [{ correct: true, value: correctValue }];

  for (const candidate of shuffleItems(pool)) {
    if (!candidate || candidate === correctValue) {
      continue;
    }

    if (options.some((option) => option.value === candidate)) {
      continue;
    }

    options.push({ correct: false, value: candidate });

    if (options.length >= size) {
      break;
    }
  }

  return shuffleItems(options);
}

function buildFallbackKanjiQuiz(
  kanjiId: string,
  kanjiCatalog: NormalizedKanji[],
  userPoints: number,
  preferredQuizType: KanjiQuizType,
) {
  const mainKanji = kanjiCatalog.find((item) => item.id === kanjiId);
  if (!mainKanji) {
    return null;
  }

  const effectivePoints = Math.max(userPoints, mainKanji.pointsToUnlock);
  const knownKanjis = kanjiCatalog.filter(
    (item) => item.pointsToUnlock <= effectivePoints,
  );
  const questionPool = knownKanjis.length > 0 ? knownKanjis : [mainKanji];
  const questionCount = questionPool.length >= 5 ? 4 : 1;
  const questionKanjis = [
    mainKanji,
    ...shuffleItems(questionPool.filter((item) => item.id !== mainKanji.id)).slice(
      0,
      questionCount - 1,
    ),
  ];

  if (preferredQuizType === "writing") {
    return {
      type: preferredQuizType,
      questionIds: questionKanjis.map((item) => item.id),
      questions: questionKanjis.map((item) => ({
        kanji: item.symbol,
        viewBox: item.viewBox,
        strokes: JSON.stringify(item.strokes),
      })),
    };
  }

  if (preferredQuizType === "kanji") {
    const meaningPool = questionPool
      .map((item) => item.meanings[0] ?? "")
      .filter((value) => value.length > 0);

    return {
      type: preferredQuizType,
      questions: questionKanjis.map((item) => ({
        kanji: item.symbol,
        options: buildOptionSet(item.meanings[0] ?? item.symbol, meaningPool, 4),
      })),
    };
  }

  if (preferredQuizType === "meaning") {
    const symbolPool = questionPool.map((item) => item.symbol).filter(Boolean);

    return {
      type: preferredQuizType,
      questions: questionKanjis.map((item) => ({
        kanji: item.meanings[0] ?? item.symbol,
        options: buildOptionSet(item.symbol, symbolPool, 6),
      })),
    };
  }

  const readingPool = questionPool
    .map((item) => item.readings[0] ?? "")
    .filter((value) => value.length > 0);

  return {
    type: preferredQuizType,
    questions: questionKanjis.map((item) => ({
      kanji: item.symbol,
      options: buildOptionSet(item.readings[0] ?? item.symbol, readingPool, 4),
    })),
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const { id } = await params;
  const resource = req.nextUrl.searchParams.get("resource");
  const requestedQuizType = req.nextUrl.searchParams.get("quizType");
  const fallbackQuizType = req.nextUrl.searchParams.get("fallbackType");
  const forceFallback = req.nextUrl.searchParams.get("forceFallback") === "1";
  const preferredQuizType = isKanjiQuizType(requestedQuizType)
    ? requestedQuizType
    : undefined;
  const preferredFallbackQuizType = isKanjiQuizType(fallbackQuizType)
    ? fallbackQuizType
    : undefined;

  if (resource === "quiz") {
    if (!preferredQuizType && !forceFallback) {
      try {
        const upstream = await fetch(`${apiConfig.studyApiBase}/kanji/quiz/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(KANJI_QUIZ_GET_TIMEOUT_MS),
        });

        const text = await upstream.text().catch(() => "");
        let upstreamPayload: unknown = null;

        if (text) {
          try {
            upstreamPayload = JSON.parse(text);
          } catch {
            upstreamPayload = text;
          }
        }

        if (upstream.ok) {
          const upstreamQuizType =
            upstreamPayload && typeof upstreamPayload === "object"
              ? (upstreamPayload as { type?: unknown }).type
              : undefined;

          if (
            !preferredFallbackQuizType ||
            upstreamQuizType === preferredFallbackQuizType
          ) {
            return NextResponse.json(upstreamPayload, {
              status: upstream.status,
            });
          }
        }

        let data: Record<string, unknown> = {};
        if (upstreamPayload && typeof upstreamPayload === "object") {
          data = upstreamPayload as Record<string, unknown>;
        } else if (typeof upstreamPayload === "string") {
          data = { message: upstreamPayload };
        }

        if (upstream.status < 500) {
          return NextResponse.json(
            {
              message: data.message || "Error al obtener quiz",
              success: false,
            },
            { status: upstream.status },
          );
        }
      } catch {
        // Fall through to local fast fallback.
      }
    }

    const [kanjiCatalog, userPoints] = await Promise.all([
      fetchKanjiCatalog(token).catch(() => []),
      fetchCurrentUserPoints(token),
    ]);
    const selectedKanji = kanjiCatalog.find((item) => item.id === id);

    if (selectedKanji && userPoints < selectedKanji.pointsToUnlock) {
      return NextResponse.json(
        {
          message: "No se tienen los puntos necesarios para este ejercicio",
          success: false,
          points: selectedKanji.pointsToUnlock,
          userPoints,
        },
        { status: 403 },
      );
    }

    const fallbackQuiz = buildFallbackKanjiQuiz(
      id,
      kanjiCatalog,
      userPoints,
      preferredQuizType ?? preferredFallbackQuizType ?? "kanji",
    );

    if (!fallbackQuiz) {
      return NextResponse.json(
        {
          message: "Error al obtener quiz",
          success: false,
        },
        { status: 500 },
      );
    }

    if (fallbackQuiz.type === "writing") {
      const detailMap = await fetchKanjiDetailsMap(token, fallbackQuiz.questionIds);

      return NextResponse.json(
        {
          type: fallbackQuiz.type,
          questions: fallbackQuiz.questions.map((question, index) => {
            const detail = detailMap.get(fallbackQuiz.questionIds[index] ?? "");
            return detail
              ? {
                  ...question,
                  kanji: detail.symbol || question.kanji,
                  viewBox: detail.viewBox || question.viewBox,
                  strokes: JSON.stringify(
                    detail.strokes.length > 0
                      ? detail.strokes
                      : parseStrokeList(question.strokes),
                  ),
                }
              : question;
          }),
        },
        { status: 200 },
      );
    }

    return NextResponse.json(fallbackQuiz, { status: 200 });
  }

  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/kanjis/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const raw = getTokenFromRequest(req);

  if (!raw) {
    return NextResponse.json({ error: "No auth cookie" }, { status: 401 });
  }

  const token = normalizeBearerToken(raw);
  const { id } = await params;
  const resource = req.nextUrl.searchParams.get("resource");

  if (resource !== "quiz") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  if (
    !body ||
    !body.type ||
    typeof body.score !== "number" ||
    typeof body.duration !== "number"
  ) {
    return NextResponse.json(
      {
        message: "Body invalido: se requiere type, score y duration",
        success: false,
      },
      { status: 400 },
    );
  }

  let upstream: Response;

  try {
    upstream = await fetch(`${apiConfig.studyApiBase}/kanji/quiz/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: body.type,
        score: body.score,
        duration: body.duration,
      }),
      signal: AbortSignal.timeout(KANJI_QUIZ_POST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isTransientUpstreamFetchError(error)) {
      return NextResponse.json(
        {
          message: "El servicio de quizzes no respondio a tiempo. Intenta de nuevo.",
          success: false,
        },
        { status: 504 },
      );
    }

    throw error;
  }

  const text = await upstream.text().catch(() => "");

  if (!upstream.ok) {
    let data: Record<string, unknown> = {};
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = { message: text };
    }

    return NextResponse.json(
      {
        message: data.message || "Error al enviar resultado del quiz",
        success: false,
      },
      { status: upstream.status },
    );
  }

  try {
    return NextResponse.json(text ? JSON.parse(text) : { success: true }, {
      status: upstream.status,
    });
  } catch {
    return NextResponse.json({ success: true }, { status: upstream.status });
  }
}
