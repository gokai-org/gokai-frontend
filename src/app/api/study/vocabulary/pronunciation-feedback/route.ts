import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/shared/config";
import { requireKanaContentAccess } from "@/app/api/_utils/kanaContentAccess";

export const dynamic = "force-dynamic";

const STUDY_TIMEOUT_MS = 15000;
const PRONUNCIATION_TIMEOUT_MS = 15000;
const PRONUNCIATION_SERVICE_PREFIX = "/pronunciation-evaluation";
const PRONUNCIATION_ENDPOINT_PATH = `${PRONUNCIATION_SERVICE_PREFIX}/get-pronunciation-feedback`;
const DERIVED_PRONUNCIATION_PORTS = ["8088", "8001", "8000"] as const;

const HIRAGANA_TO_ROMAJI: Record<string, string> = {
  "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
  "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
  "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
  "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
  "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
  "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
  "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
  "や": "ya", "ゆ": "yu", "よ": "yo",
  "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
  "わ": "wa", "を": "wo",
  "ん": "n",
  "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
  "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
  "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
  "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
  "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
  "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
  "しゃ": "sha", "しゅ": "shu", "しょ": "sho",
  "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
  "にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
  "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
  "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
  "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
  "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
  "じゃ": "ja", "じゅ": "ju", "じょ": "jo",
  "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
  "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo",
};

type WordContentResponse = {
  hiragana?: string | null;
};

function buildStudyUrl(path: string) {
  return `${apiConfig.studyApiBase.replace(/\/$/, "")}${path}`;
}

function buildContentUrl(path: string) {
  return `${apiConfig.contentApiBase.replace(/\/$/, "")}${path}`;
}

function buildPronunciationUrl(baseUrl: string) {
  const url = new URL(baseUrl.trim());
  const basePath = normalizeUrlPath(url.pathname);

  if (!basePath) {
    url.pathname = PRONUNCIATION_ENDPOINT_PATH;
  } else if (
    basePath === PRONUNCIATION_ENDPOINT_PATH ||
    basePath.endsWith(PRONUNCIATION_ENDPOINT_PATH)
  ) {
    url.pathname = basePath;
  } else if (
    basePath === PRONUNCIATION_SERVICE_PREFIX ||
    basePath.endsWith(PRONUNCIATION_SERVICE_PREFIX)
  ) {
    url.pathname = `${basePath}/get-pronunciation-feedback`.replace(/\/+/g, "/");
  } else {
    url.pathname = `${basePath}${PRONUNCIATION_ENDPOINT_PATH}`.replace(/\/+/g, "/");
  }

  url.search = "";
  url.hash = "";

  return url.toString();
}

function normalizeUrlPath(path: string) {
  const trimmed = path.trim().replace(/\/+$/, "");

  if (!trimmed || trimmed === "/") {
    return "";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function addDerivedPronunciationCandidates(
  bases: Set<string>,
  sourceUrl: URL,
) {
  for (const port of DERIVED_PRONUNCIATION_PORTS) {
    const candidate = new URL(sourceUrl.toString());
    candidate.port = port;
    candidate.pathname = "";
    candidate.search = "";
    candidate.hash = "";
    bases.add(candidate.toString().replace(/\/$/, ""));

    if (candidate.protocol === "https:") {
      const httpCandidate = new URL(candidate.toString());
      httpCandidate.protocol = "http:";
      bases.add(httpCandidate.toString().replace(/\/$/, ""));
    }
  }
}

function getPronunciationBaseCandidates() {
  const bases = new Set<string>();

  if (process.env.GOKAI_PRONUNCIATION_API_BASE?.trim()) {
    bases.add(process.env.GOKAI_PRONUNCIATION_API_BASE.trim());
  }

  try {
    const studyUrl = new URL(apiConfig.studyApiBase);
    addDerivedPronunciationCandidates(bases, studyUrl);
  } catch {
    // Ignore invalid base URLs and continue with local candidates.
  }

  if (process.env.NODE_ENV !== "production") {
    bases.add("http://127.0.0.1:8001");
    bases.add("http://localhost:8001");
    bases.add("http://127.0.0.1:8000");
    bases.add("http://localhost:8000");
  }

  return Array.from(bases);
}

function hiraganaToRomaji(input: string) {
  const characters = Array.from(input);
  let result = "";

  for (let index = 0; index < characters.length; index += 1) {
    if (index + 1 < characters.length) {
      const combined = `${characters[index]}${characters[index + 1]}`;
      const combinedRomaji = HIRAGANA_TO_ROMAJI[combined];

      if (combinedRomaji) {
        result += combinedRomaji;
        index += 1;
        continue;
      }
    }

    const current = characters[index];

    if (current === "っ" && index + 1 < characters.length) {
      const nextRomaji = HIRAGANA_TO_ROMAJI[characters[index + 1]];

      if (nextRomaji) {
        result += nextRomaji[0] ?? "";
      }

      continue;
    }

    result += HIRAGANA_TO_ROMAJI[current] ?? current;
  }

  return result;
}

function shouldFallbackToDirectPronunciation(status: number) {
  return status === 502 || status === 503 || status === 504;
}

async function getExpectedSpeech(
  token: string,
  wordId: string,
  formHiraganaForLookup?: string | null,
) {
  const providedHiragana = typeof formHiraganaForLookup === "string"
    ? formHiraganaForLookup.trim()
    : "";

  if (providedHiragana) {
    return hiraganaToRomaji(providedHiragana);
  }

  const upstream = await fetch(buildContentUrl(`/content/words/${wordId}`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = (await readUpstreamBody(upstream)) as WordContentResponse & {
    error?: string;
  };

  if (!upstream.ok) {
    throw new Error(data.error || "No se pudo obtener la palabra para pronunciación");
  }

  const hiragana = typeof data.hiragana === "string" ? data.hiragana.trim() : "";

  if (!hiragana) {
    throw new Error("La palabra no tiene hiragana");
  }

  return hiraganaToRomaji(hiragana);
}

async function tryDirectPronunciationService(audioFile: File, expectedSpeech: string) {
  let lastError: unknown = null;

  const baseCandidates = getPronunciationBaseCandidates();
  if (baseCandidates.length === 0) {
    throw new Error("No hay bases configuradas para el servicio de pronunciación");
  }

  for (const baseUrl of baseCandidates) {
    const formData = new FormData();
    formData.append("audio_file", audioFile, audioFile.name || "pronunciation.wav");
    formData.append("expected_speech", expectedSpeech);

    try {
      const endpointUrl = buildPronunciationUrl(baseUrl);
      const upstream = await fetch(endpointUrl, {
        method: "POST",
        body: formData,
        cache: "no-store",
        signal: AbortSignal.timeout(PRONUNCIATION_TIMEOUT_MS),
      });

      const data = await readUpstreamBody(upstream);

      if (!upstream.ok) {
        lastError = new Error(
          typeof data === "object" && data && "error" in data && typeof data.error === "string"
            ? data.error
            : `El servicio de pronunciación devolvió ${upstream.status}`,
        );
        continue;
      }

      return {
        endpointUrl,
        data,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("No se pudo llamar al servicio directo de pronunciación");
}

async function readUpstreamBody(upstream: Response) {
  const contentType = upstream.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return upstream.json().catch(() => ({}));
  }

  const text = await upstream.text().catch(() => "");
  return text ? { error: text } : {};
}

export async function POST(req: NextRequest) {
  const access = await requireKanaContentAccess(req);

  if (access.response) {
    return access.response;
  }

  const { token } = access;
  const formData = await req.formData().catch(() => null);
  const wordId = formData?.get("wordId");
  const hiragana = formData?.get("hiragana");
  const audioFile = formData?.get("audio_file") ?? formData?.get("audio");

  if (typeof wordId !== "string" || !wordId.trim()) {
    return NextResponse.json({ error: "wordId es requerido" }, { status: 400 });
  }

  if (!(audioFile instanceof File)) {
    return NextResponse.json({ error: "audio_file es requerido" }, { status: 400 });
  }

  const upstreamForm = new FormData();
  upstreamForm.append("wordId", wordId.trim());
  upstreamForm.append("audio_file", audioFile, audioFile.name || "pronunciation.wav");

  const upstreamPath = "/vocabulary/pronunciation-feedback";
  const upstreamUrl = buildStudyUrl(upstreamPath);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: upstreamForm,
      cache: "no-store",
      signal: AbortSignal.timeout(STUDY_TIMEOUT_MS),
    });

    const data = await readUpstreamBody(upstream);

    if (shouldFallbackToDirectPronunciation(upstream.status)) {
      const expectedSpeech = await getExpectedSpeech(
        token,
        wordId.trim(),
        typeof hiragana === "string" ? hiragana : null,
      );
      const directResponse = await tryDirectPronunciationService(audioFile, expectedSpeech);
      const directEndpointUrl = new URL(directResponse.endpointUrl);

      return NextResponse.json(directResponse.data, {
        status: 200,
        headers: {
          "x-gokai-upstream": directEndpointUrl.host,
          "x-gokai-upstream-path": directEndpointUrl.pathname,
          "x-gokai-upstream-fallback": "direct-pronunciation",
        },
      });
    }

    return NextResponse.json(data, {
      status: upstream.status,
      headers: {
        "x-gokai-upstream": new URL(upstreamUrl).host,
        "x-gokai-upstream-path": upstreamPath,
      },
    });
  } catch (error) {
    try {
      const expectedSpeech = await getExpectedSpeech(
        token,
        wordId.trim(),
        typeof hiragana === "string" ? hiragana : null,
      );
      const directResponse = await tryDirectPronunciationService(audioFile, expectedSpeech);
      const directEndpointUrl = new URL(directResponse.endpointUrl);

      return NextResponse.json(directResponse.data, {
        status: 200,
        headers: {
          "x-gokai-upstream": directEndpointUrl.host,
          "x-gokai-upstream-path": directEndpointUrl.pathname,
          "x-gokai-upstream-fallback": "direct-pronunciation",
        },
      });
    } catch (fallbackError) {
      console.error("POST /api/study/vocabulary/pronunciation-feedback error:", error);
      console.error(
        "POST /api/study/vocabulary/pronunciation-feedback fallback error:",
        fallbackError,
      );
      return NextResponse.json(
        { error: "Error interno al evaluar pronunciación de vocabulario" },
        { status: 500 },
      );
    }
  }
}