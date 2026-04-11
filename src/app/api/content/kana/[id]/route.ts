import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { normalizeBearerToken } from "@/shared/lib/auth/normalizeToken";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

type KanaQuizType = "from_kana" | "from_romaji" | "canvas";

type RawKana = {
  id?: string;
  symbol?: string;
  kanaType?: string;
  kana_type?: string;
  romaji?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
  viewBox?: string;
  view_box?: string;
  strokes?: string | string[];
};

type RawProgressItem = {
  kanaId?: string;
  kana_id?: string;
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

type NormalizedKana = ReturnType<typeof normalizeKana>;

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

function normalizeKana(raw: RawKana) {
  return {
    id: raw.id ?? "",
    symbol: raw.symbol ?? "",
    kanaType: raw.kanaType ?? raw.kana_type ?? "hiragana",
    romaji: raw.romaji ?? "",
    pointsToUnlock: raw.pointsToUnlock ?? raw.points_to_unlock ?? 0,
    viewBox: raw.viewBox ?? raw.view_box,
    strokes: parseStrokeList(raw.strokes),
  };
}

function isKanaQuizType(value: unknown): value is KanaQuizType {
  return (
    value === "from_kana" ||
    value === "from_romaji" ||
    value === "canvas"
  );
}

function normalizeProgressItem(raw: RawProgressItem) {
  return {
    kanaId: raw.kanaId ?? raw.kana_id ?? "",
    exerciseType: raw.exerciseType ?? raw.exercise_type ?? "",
    completed: raw.completed === true,
  };
}

function shuffleItems<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function buildKanaMap(items: NormalizedKana[]) {
  const map = new Map<string, NormalizedKana>();

  for (const item of items) {
    map.set(item.id, item);
  }

  return map;
}

function decodeUserIdFromToken(token: string): string | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString()) as {
      userId?: string;
      sub?: string;
      id?: string;
    };

    return payload.userId ?? payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}

async function fetchCurrentUserKanaPoints(token: string): Promise<number> {
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
      signal: AbortSignal.timeout(1500),
    });

    if (!upstream.ok) {
      return 0;
    }

    const payload = (await upstream.json().catch(() => null)) as
      | { kanaPoints?: number; kana_points?: number }
      | null;

    if (!payload) {
      return 0;
    }

    if (typeof payload.kanaPoints === "number") {
      return payload.kanaPoints;
    }

    return typeof payload.kana_points === "number" ? payload.kana_points : 0;
  } catch {
    return 0;
  }
}

async function fetchKanaCatalog(token: string): Promise<NormalizedKana[]> {
  const upstream = await fetch(`${apiConfig.contentApiBase}/content/kanas`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = (await upstream.json().catch(() => null)) as
    | { hiragana?: RawKana[]; katakana?: RawKana[] }
    | RawKana[]
    | null;

  if (!payload) {
    return [];
  }

  const flat = Array.isArray(payload)
    ? payload
    : [
        ...(Array.isArray(payload.hiragana) ? payload.hiragana : []),
        ...(Array.isArray(payload.katakana) ? payload.katakana : []),
      ];

  return flat.map(normalizeKana);
}

async function fetchKanaDetailsMap(
  token: string,
  kanaIds: string[],
): Promise<Map<string, NormalizedKana>> {
  const uniqueKanaIds = [...new Set(kanaIds.filter((kanaId) => kanaId.length > 0))];

  if (uniqueKanaIds.length === 0) {
    return new Map<string, NormalizedKana>();
  }

  const detailEntries = await Promise.all(
    uniqueKanaIds.map(async (kanaId) => {
      try {
        const upstream = await fetch(
          `${apiConfig.contentApiBase}/content/kanas/${kanaId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(2500),
          },
        );

        if (!upstream.ok) {
          return null;
        }

        const payload = (await upstream.json().catch(() => null)) as RawKana | null;
        if (!payload) {
          return null;
        }

        const normalized = normalizeKana(payload);
        return [kanaId, normalized] as const;
      } catch {
        return null;
      }
    }),
  );

  return new Map<string, NormalizedKana>(
    detailEntries.filter(
      (entry): entry is readonly [string, NormalizedKana] => entry !== null,
    ),
  );
}

async function fetchKanaProgressItem(token: string) {
  try {
    const upstream = await fetch(`${apiConfig.studyApiBase}/kana/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(900),
    });

    if (!upstream.ok) {
      return null;
    }

    const payload = (await upstream.json().catch(() => null)) as
      | RawProgressItem
      | RawProgressItem[]
      | { progress?: RawProgressItem[]; data?: RawProgressItem[] }
      | null;

    if (!payload) {
      return null;
    }

    if (Array.isArray(payload)) {
      return payload.length > 0 ? normalizeProgressItem(payload[0]) : null;
    }

    if (
      "progress" in payload &&
      Array.isArray(payload.progress) &&
      payload.progress.length > 0
    ) {
      return normalizeProgressItem(payload.progress[0]);
    }

    if (
      "data" in payload &&
      Array.isArray(payload.data) &&
      payload.data.length > 0
    ) {
      return normalizeProgressItem(payload.data[0]);
    }

    if (
      "kanaId" in payload ||
      "kana_id" in payload ||
      "exerciseType" in payload ||
      "exercise_type" in payload ||
      "completed" in payload
    ) {
      return normalizeProgressItem(payload);
    }

    return null;
  } catch {
    return null;
  }
}

function buildChoiceOptions(
  correctKana: NormalizedKana,
  pool: NormalizedKana[],
  mode: "romaji" | "symbol",
  size: number,
) {
  const distractors = shuffleItems(
    pool.filter((candidate) => candidate.id !== correctKana.id),
  );

  const options = [
    {
      correct: true,
      option: mode === "romaji" ? correctKana.romaji : correctKana.symbol,
    },
  ];

  for (const candidate of distractors) {
    const label = mode === "romaji" ? candidate.romaji : candidate.symbol;

    if (!label || options.some((item) => item.option === label)) {
      continue;
    }

    options.push({ correct: false, option: label });

    if (options.length >= size) {
      break;
    }
  }

  while (options.length < size) {
    options.push({ correct: false, option: "" });
  }

  return shuffleItems(options);
}

function buildFallbackKanaQuiz(
  kanaId: string,
  kanaCatalog: NormalizedKana[],
  userKanaPoints: number,
  progress?: ReturnType<typeof normalizeProgressItem> | null,
  preferredQuizType?: KanaQuizType | null,
) {
  const kanaMap = buildKanaMap(kanaCatalog);
  const mainKana = kanaMap.get(kanaId);

  if (!mainKana) {
    return null;
  }

  const effectiveKanaPoints = Math.max(userKanaPoints, mainKana.pointsToUnlock);
  const sameTypeKanas = kanaCatalog.filter(
    (kana) => kana.kanaType === mainKana.kanaType,
  );
  const knownKanas = sameTypeKanas.filter(
    (kana) => kana.pointsToUnlock <= effectiveKanaPoints,
  );
  const questionType: KanaQuizType =
    preferredQuizType && isKanaQuizType(preferredQuizType)
      ? preferredQuizType
      : progress &&
          progress.kanaId === kanaId &&
          !progress.completed &&
          isKanaQuizType(progress.exerciseType)
        ? progress.exerciseType
      : "from_kana";

  const questionPool =
    knownKanas.length > 0
      ? knownKanas
      : sameTypeKanas.length > 0
        ? sameTypeKanas
        : [mainKana];

  if (questionType === "canvas") {
    const canvasQuestions = [
      mainKana,
      ...shuffleItems(questionPool.filter((kana) => kana.id !== mainKana.id)).slice(0, 2),
    ].map((kana) => ({
      type: "canvas" as const,
      kanaId: kana.id,
      symbol: kana.symbol,
      romaji: kana.romaji,
      viewBox: kana.viewBox,
      strokes: kana.strokes,
      options: [],
    }));

    return {
      type: questionType,
      questions: canvasQuestions,
    };
  }

  const questionsCount = questionPool.length >= 5 ? 4 : 1;
  const questionKanas = [
    mainKana,
    ...shuffleItems(questionPool.filter((kana) => kana.id !== mainKana.id)).slice(
      0,
      questionsCount - 1,
    ),
  ];

  return {
    type: questionType,
    questions: questionKanas.map((kana) => ({
      type: questionType,
      kanaId: kana.id,
      symbol: kana.symbol,
      romaji: kana.romaji,
      options:
        questionType === "from_kana"
          ? buildChoiceOptions(kana, questionPool, "romaji", 4)
          : buildChoiceOptions(kana, questionPool, "symbol", 6),
      viewBox: kana.viewBox,
      strokes: kana.strokes,
    })),
  };
}

/**
 * GET /api/content/kana/:id
 * Proxy al backend unificado: GET {BASE}/content/kanas/:id
 * Devuelve el kana completo (incluyendo strokes y viewBox).
 */
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
  const preferredQuizType = isKanaQuizType(requestedQuizType)
    ? requestedQuizType
    : undefined;
  const preferredFallbackQuizType = isKanaQuizType(fallbackQuizType)
    ? fallbackQuizType
    : undefined;

  if (resource === "quiz") {
    if (!preferredQuizType && !forceFallback) {
      try {
        const upstream = await fetch(`${apiConfig.studyApiBase}/kana/quiz/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(1200),
        });

        const text = await upstream.text().catch(() => "");

        if (upstream.ok) {
          return NextResponse.json(text ? JSON.parse(text) : null, {
            status: upstream.status,
          });
        }

        let data: Record<string, unknown> = {};
        try {
          data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
        } catch {
          data = { message: text };
        }

        if (upstream.status < 500) {
          return NextResponse.json(
            {
              message: data.message || "Error al obtener quiz de kana",
              success: false,
              reachable:
                typeof data.reachable === "boolean"
                  ? data.reachable
                  : upstream.status !== 403,
              points: typeof data.points === "number" ? data.points : undefined,
              userPoints:
                typeof data.userPoints === "number" ? data.userPoints : undefined,
            },
            { status: upstream.status },
          );
        }
      } catch {
        // Fall through to local fast fallback.
      }
    }

    const [kanaCatalog, userKanaPoints, progress] = await Promise.all([
      fetchKanaCatalog(token).catch(() => []),
      fetchCurrentUserKanaPoints(token),
      fetchKanaProgressItem(token),
    ]);
    const kanaMap = buildKanaMap(kanaCatalog);
    const selectedKana = kanaMap.get(id);

    if (selectedKana && userKanaPoints < selectedKana.pointsToUnlock) {
      return NextResponse.json(
        {
          message: "No tienes suficientes puntos para acceder al quiz de este kana",
          success: false,
          reachable: false,
          points: selectedKana.pointsToUnlock,
          userPoints: userKanaPoints,
        },
        { status: 403 },
      );
    }

    const fallbackQuiz = buildFallbackKanaQuiz(
      id,
      kanaCatalog,
      userKanaPoints,
      progress,
      preferredQuizType ?? preferredFallbackQuizType ?? null,
    );

    if (fallbackQuiz) {
      if (fallbackQuiz.type === "canvas") {
        const detailMap = await fetchKanaDetailsMap(
          token,
          fallbackQuiz.questions.map((question) => question.kanaId),
        );

        return NextResponse.json(
          {
            ...fallbackQuiz,
            questions: fallbackQuiz.questions.map((question) => {
              const detail = detailMap.get(question.kanaId);

              return detail
                ? {
                    ...question,
                    symbol: detail.symbol || question.symbol,
                    romaji: detail.romaji || question.romaji,
                    viewBox: detail.viewBox || question.viewBox,
                    strokes:
                      detail.strokes.length > 0
                        ? detail.strokes
                        : question.strokes,
                  }
                : question;
            }),
          },
          { status: 200 },
        );
      }

      return NextResponse.json(fallbackQuiz, { status: 200 });
    }

    return NextResponse.json(
      {
        message: "Error al obtener quiz de kana",
        success: false,
      },
      { status: 500 },
    );
  }

  const upstream = await fetch(
    `${apiConfig.contentApiBase}/content/kanas/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(normalizeKana(data as RawKana), {
    status: upstream.status,
  });
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

  const upstream = await fetch(`${apiConfig.studyApiBase}/kana/quiz/${id}`, {
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
  });

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
