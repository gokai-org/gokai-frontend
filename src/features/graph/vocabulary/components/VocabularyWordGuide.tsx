"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, CheckCircle2, ExternalLink, Headphones, Mic, Pencil } from "lucide-react";
import { HIRAGANA_DATA } from "@/features/graph/writing/hiragana/mock/data";
import { KATAKANA_DATA } from "@/features/graph/writing/katakana/mock/data";
import { listKanaCatalog } from "@/features/kana/api/kanaApi";
import type { Kana } from "@/features/kana/types";
import LessonCTA from "@/features/lessons/components/LessonCTA";
import {
  LESSON_SECTION_TRANSITION,
  LESSON_SECTION_VARIANTS,
  getAnimatedTabDirection,
  type AnimatedLessonTab,
} from "@/features/lessons/components/AnimatedLessonTabs";
import WritingEvaluationGuide from "@/features/lessons/components/WritingEvaluationGuide";
import type {
  VocabularyAnswerType,
  VocabularyWordLesson,
} from "../types";
import {
  VOCABULARY_QUIZ_TYPE_LABELS,
  getQuizTypeProgress,
  getWordQuizProgressPercent,
} from "../lib/vocabularyQuizProgress";

type VocabularyGuideTab = "meaning" | "listening" | "speaking" | "writing";
type KanaLearningScript = "hiragana" | "katakana";

type KanaLearningInfo = {
  symbol: string;
  script: KanaLearningScript;
  boardNumber: number;
  label: string;
  libraryHref: string;
  description: string;
};

type SymbolGuideInfo = {
  title: string;
  description: string;
  libraryHref?: string;
  actionLabel?: string;
};

type KanaCatalogState = {
  hiraganaBySymbol: Map<string, KanaLearningInfo>;
  katakanaBySymbol: Map<string, KanaLearningInfo>;
};

type VocabularyWordGuideProps = {
  question: VocabularyWordLesson;
  subthemeMeaning: string;
  onStartQuiz: (type: VocabularyAnswerType) => void;
};

const VOCABULARY_TABS: AnimatedLessonTab<VocabularyGuideTab>[] = [
  { id: "meaning", label: "Significado", icon: <BookOpen size={12} /> },
  { id: "listening", label: "Audio", icon: <Headphones size={12} /> },
  { id: "speaking", label: "Habla", icon: <Mic size={12} /> },
  { id: "writing", label: "Escritura", icon: <Pencil size={12} /> },
];

const VOCABULARY_CRITERIA = {
  meaning: [
    {
      title: "Reconocer la idea",
      description: "",
      cue: "Primero identifica el significado principal sin traducir palabra por palabra en tu cabeza.",
    },
    {
      title: "Distinguir distractores",
      description: "",
      cue: "Compara opciones parecidas y busca la que encaje con el kanji, la lectura y el contexto del subtema.",
    },
    {
      title: "Responder con seguridad",
      description: "",
      cue: "El objetivo no es adivinar rápido, sino formar una asociación estable entre forma y significado.",
    },
  ],
  listening: [
    {
      title: "Escuchar la palabra completa",
      description: "",
      cue: "Atiende al ritmo de la palabra antes de mirar las opciones; en japonés, la duración del sonido importa.",
    },
    {
      title: "Separar sonidos cercanos",
      description: "",
      cue: "Diferencia vocales largas, consonantes dobles y sílabas que suelen confundirse al inicio.",
    },
    {
      title: "Conectar sonido y escritura",
      description: "",
      cue: "Después de escuchar, elige la forma escrita que corresponde al sonido, no la que se ve más familiar.",
    },
  ],
  speaking: [
    {
      title: "Pronunciar claro",
      description: "",
      cue: "Di la palabra en voz alta con sílabas limpias y sin arrastrar sonidos que no existen en japonés.",
    },
    {
      title: "Cuidar el ritmo",
      description: "",
      cue: "Mantén cada mora con peso parecido; eso ayuda a que la palabra suene natural.",
    },
    {
      title: "Autoevaluar con honestidad",
      description: "",
      cue: "Marca el resultado según tu precisión real: repasar, casi o listo. Esa señal guía tu progreso.",
    },
  ],
  writing: [
    {
      title: "Construir la lectura",
      description: "",
      cue: "Forma la palabra desde sus kana, cuidando el orden y las sílabas pequeñas si aparecen.",
    },
    {
      title: "Evitar memoria visual débil",
      description: "",
      cue: "No copies solo la forma: confirma mentalmente qué sonido representa cada pieza antes de tocarla.",
    },
    {
      title: "Comprobar precisión",
      description: "",
      cue: "La respuesta debe coincidir con la lectura completa; un kana omitido cambia la palabra.",
    },
  ],
} as const;

function buildAudioSrc(audio?: string) {
  if (!audio) return null;
  if (audio.startsWith("data:")) return audio;
  return `data:audio/wav;base64,${audio}`;
}

function getWordTitle(question: VocabularyWordLesson) {
  return question.kanji || question.hiragana || "語";
}

function getReading(question: VocabularyWordLesson) {
  return question.hiragana || "Lectura pendiente";
}

function getPrimaryMeaning(question: VocabularyWordLesson) {
  return question.meanings?.[0] || "Sin significado disponible";
}

function getWritingUnits(question: VocabularyWordLesson) {
  return Array.from(question.hiragana || "");
}

const SMALL_KANA_BASE: Record<string, string> = {
  "ぁ": "あ",
  "ぃ": "い",
  "ぅ": "う",
  "ぇ": "え",
  "ぉ": "お",
  "っ": "つ",
  "ゃ": "や",
  "ゅ": "ゆ",
  "ょ": "よ",
  "ゎ": "わ",
  "ァ": "ア",
  "ィ": "イ",
  "ゥ": "ウ",
  "ェ": "エ",
  "ォ": "オ",
  "ッ": "ツ",
  "ャ": "ヤ",
  "ュ": "ユ",
  "ョ": "ヨ",
  "ヮ": "ワ",
};

const HIRAGANA_BOARD_NUMBER = new Map(
  HIRAGANA_DATA.map((kana, index) => [kana.symbol, index + 1]),
);
const KATAKANA_BOARD_NUMBER = new Map(
  KATAKANA_DATA.map((kana, index) => [kana.symbol, index + 1]),
);

const VOICED_KANA_BASE: Record<string, string> = {
  "が": "か",
  "ぎ": "き",
  "ぐ": "く",
  "げ": "け",
  "ご": "こ",
  "ざ": "さ",
  "じ": "し",
  "ず": "す",
  "ぜ": "せ",
  "ぞ": "そ",
  "だ": "た",
  "ぢ": "ち",
  "づ": "つ",
  "で": "て",
  "ど": "と",
  "ば": "は",
  "び": "ひ",
  "ぶ": "ふ",
  "べ": "へ",
  "ぼ": "ほ",
  "ぱ": "は",
  "ぴ": "ひ",
  "ぷ": "ふ",
  "ぺ": "へ",
  "ぽ": "ほ",
  "ガ": "カ",
  "ギ": "キ",
  "グ": "ク",
  "ゲ": "ケ",
  "ゴ": "コ",
  "ザ": "サ",
  "ジ": "シ",
  "ズ": "ス",
  "ゼ": "セ",
  "ゾ": "ソ",
  "ダ": "タ",
  "ヂ": "チ",
  "ヅ": "ツ",
  "デ": "テ",
  "ド": "ト",
  "バ": "ハ",
  "ビ": "ヒ",
  "ブ": "フ",
  "ベ": "ヘ",
  "ボ": "ホ",
  "パ": "ハ",
  "ピ": "ヒ",
  "プ": "フ",
  "ペ": "ヘ",
  "ポ": "ホ",
};

const SPECIAL_SYMBOL_GUIDES: Record<string, SymbolGuideInfo> = {
  "ー": {
    title: "Marca de vocal larga",
    description: "Este símbolo se llama choonpu. En katakana y palabras extendidas alarga el sonido de la vocal anterior.",
  },
  "・": {
    title: "Punto medio japonés",
    description: "Este signo se llama nakaguro. Se usa para separar palabras, nombres extranjeros o elementos dentro de una misma expresión.",
  },
  "々": {
    title: "Marca de repetición",
    description: "Este signo repite el kanji anterior. No es un kana independiente; indica que el carácter previo se lee otra vez.",
  },
  "ゝ": {
    title: "Repetición de hiragana",
    description: "Esta marca repite el hiragana anterior sin dakuten. Es un signo ortográfico, no una casilla propia de la tabla fonética.",
  },
  "ゞ": {
    title: "Repetición con dakuten",
    description: "Esta marca repite el hiragana anterior aplicando sonorización. Se usa en escritura tradicional y nombres concretos.",
  },
  "ヽ": {
    title: "Repetición de katakana",
    description: "Esta marca repite el katakana anterior sin dakuten. Es un signo ortográfico especial, no un kana nuevo.",
  },
  "ヾ": {
    title: "Repetición de katakana con dakuten",
    description: "Esta marca repite el katakana anterior con sonorización. Aparece sobre todo en usos tradicionales o estilizados.",
  },
  "ヶ": {
    title: "Katakana pequeño ケ",
    description: "Este símbolo suele leerse como partícula abreviada en topónimos, contadores o expresiones fijas. No se aprende como una casilla fonética independiente.",
  },
  "ヵ": {
    title: "Katakana pequeño カ",
    description: "Se usa en abreviaciones y contadores. Funciona como variante tipográfica, no como un kana nuevo dentro de la tabla fonética.",
  },
  "〜": {
    title: "Guion de extensión",
    description: "Este signo alarga o suaviza el tono en escritura informal. No pertenece a la tabla fonética como kana independiente.",
  },
  "～": {
    title: "Guion de extensión",
    description: "Este signo alarga o suaviza el tono en escritura informal. No pertenece a la tabla fonética como kana independiente.",
  },
};

function buildFallbackKanaInfo(
  symbol: string,
  script: KanaLearningScript,
  boardNumber: number,
  lookupSymbol?: string,
  note?: string,
): KanaLearningInfo {
  const label = `${script === "hiragana" ? "Hiragana" : "Katakana"} ${String(boardNumber).padStart(2, "0")}`;
  return {
    symbol,
    script,
    boardNumber,
    label,
    libraryHref: `/dashboard/library?category=${script}&symbol=${encodeURIComponent(lookupSymbol ?? symbol)}`,
    description: note
      ? `${note} Se referencia junto a ${label}.`
      : `Se aprende en ${label} dentro de la tabla fonética.`,
  };
}

function buildCatalogInfoMap(kanaList: Kana[], script: KanaLearningScript) {
  return new Map(
    kanaList.map((kana, index) => [
      kana.symbol,
      buildFallbackKanaInfo(
        kana.symbol,
        script,
        index + 1,
        kana.symbol,
        `Este kana tiene su propia posición en la tabla fonética${kana.romaji ? ` (${kana.romaji}).` : "."}`,
      ),
    ]),
  );
}

function getFallbackKanaLearningInfo(symbol: string): KanaLearningInfo | null {
  const baseSymbol = SMALL_KANA_BASE[symbol] ?? VOICED_KANA_BASE[symbol] ?? symbol;
  const hiraganaBoardNumber = HIRAGANA_BOARD_NUMBER.get(baseSymbol);
  if (hiraganaBoardNumber) {
    const note = symbol !== baseSymbol
      ? SMALL_KANA_BASE[symbol]
        ? `${symbol} es un kana pequeño derivado de ${baseSymbol}.`
        : `${symbol} es una variante sonorizada relacionada con ${baseSymbol}.`
      : undefined;

    return buildFallbackKanaInfo(symbol, "hiragana", hiraganaBoardNumber, baseSymbol, note);
  }

  const katakanaBoardNumber = KATAKANA_BOARD_NUMBER.get(baseSymbol);
  if (katakanaBoardNumber) {
    const note = symbol !== baseSymbol
      ? SMALL_KANA_BASE[symbol]
        ? `${symbol} es un kana pequeño derivado de ${baseSymbol}.`
        : `${symbol} es una variante sonorizada relacionada con ${baseSymbol}.`
      : undefined;

    return buildFallbackKanaInfo(symbol, "katakana", katakanaBoardNumber, baseSymbol, note);
  }

  return null;
}

function getSymbolGuideInfo(
  symbol: string,
  kanaCatalog: KanaCatalogState | null,
): SymbolGuideInfo {
  const exactInfo = kanaCatalog?.hiraganaBySymbol.get(symbol)
    ?? kanaCatalog?.katakanaBySymbol.get(symbol)
    ?? getFallbackKanaLearningInfo(symbol);

  if (exactInfo) {
    return {
      title: `${symbol} · ${exactInfo.label}`,
      description: exactInfo.description,
      libraryHref: exactInfo.libraryHref,
      actionLabel: "Ver tabla fonética",
    };
  }

  const specialInfo = SPECIAL_SYMBOL_GUIDES[symbol];
  if (specialInfo) {
    return specialInfo;
  }

  return {
    title: `${symbol} · Símbolo de apoyo`,
    description: "Este carácter no forma una casilla independiente de hiragana o katakana. Se usa como apoyo ortográfico dentro de la palabra.",
  };
}

function KanaLearningChip({
  symbol,
  kanaCatalog,
}: {
  symbol: string;
  kanaCatalog: KanaCatalogState | null;
}) {
  const info = getSymbolGuideInfo(symbol, kanaCatalog);

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        className="flex h-11 min-w-11 items-center justify-center rounded-2xl border border-accent/18 bg-accent/8 px-3 text-lg font-black text-accent transition hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 jp-text"
        aria-label={info.title}
      >
        {symbol}
      </button>
      <div className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-20 w-56 -translate-x-1/2 translate-y-1 opacity-0 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-[#15161c] dark:ring-white/10">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xl font-black text-accent jp-text">
              {symbol}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Guía del símbolo
              </p>
              <p className="mt-0.5 text-sm font-black text-slate-950 dark:text-slate-50">
                {info.title}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-[#111219]">
            <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
              {info.description}
            </p>
            {info.libraryHref ? (
              <Link
                href={info.libraryHref}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-accent transition hover:text-accent-hover"
              >
                {info.actionLabel ?? "Ver tabla fonética"}
                <ExternalLink size={12} strokeWidth={2.5} />
              </Link>
            ) : null}
          </div>
        </div>
        <div className="mx-auto h-3 w-3 -translate-y-1 rotate-45 border-b border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-[#111219]" />
      </div>
    </div>
  );
}

export default function VocabularyWordGuide({
  question,
  subthemeMeaning,
  onStartQuiz,
}: VocabularyWordGuideProps) {
  const [activeTab, setActiveTab] = useState<VocabularyGuideTab>("meaning");
  const [direction, setDirection] = useState(1);
  const [kanaCatalog, setKanaCatalog] = useState<KanaCatalogState | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadKanaCatalog = async () => {
      try {
        const catalog = await listKanaCatalog();
        if (cancelled) {
          return;
        }

        setKanaCatalog({
          hiraganaBySymbol: buildCatalogInfoMap(catalog.hiragana ?? [], "hiragana"),
          katakanaBySymbol: buildCatalogInfoMap(catalog.katakana ?? [], "katakana"),
        });
      } catch (error) {
        console.error("No se pudo cargar el catalogo de kana para el modal de vocabulario:", error);
      }
    };

    void loadKanaCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const switchTab = useCallback((tab: VocabularyGuideTab) => {
    if (tab === activeTab) return;
    setDirection(getAnimatedTabDirection(VOCABULARY_TABS, activeTab, tab));
    setActiveTab(tab);
  }, [activeTab]);

  const tabCopy = useMemo(() => {
    switch (activeTab) {
      case "meaning":
        return {
          eyebrow: "Comprension",
          title: "Entiende que significa antes de memorizar la respuesta",
          intro:
            "En vocabulario, el significado debe sentirse como una asociacion directa: ves o escuchas la palabra y aparece la idea, no una traduccion trabajosa.",
          emphasis: "Forma, lectura y significado deben apuntar a una misma idea.",
          coachNote:
            "Si dudas entre dos opciones, vuelve a mirar la lectura y pregúntate cuál usarías dentro del tema que estás estudiando.",
        };
      case "listening":
        return {
          eyebrow: "Escucha",
          title: "Entrena el oído antes de mirar la respuesta",
          intro:
            "El japonés premia la atención al detalle: una vocal larga, una pausa pequeña o una sílaba suave pueden cambiar lo que entiendes.",
          emphasis: "Primero sonido, luego reconocimiento escrito.",
          coachNote:
            "Reproduce el audio una vez con los ojos en descanso y otra vez mirando las opciones; notarás más diferencias.",
        };
      case "speaking":
        return {
          eyebrow: "Produccion oral",
          title: "Haz que la palabra salga con ritmo natural",
          intro:
            "Practicar en voz alta vuelve activa la memoria. No basta reconocer la palabra: quieres poder decirla sin fricción.",
          emphasis: "Pronunciacion clara y ritmo estable.",
          coachNote:
            "Di la palabra una vez lenta, una vez normal y una vez dentro de una frase corta imaginaria.",
        };
      case "writing":
        return {
          eyebrow: "Escritura",
          title: "Reconstruye la lectura con precisión",
          intro:
            "La escritura del vocabulario entrena la memoria de lectura. Cada kana confirma que recuerdas cómo suena la palabra completa.",
          emphasis: "Orden, lectura completa y exactitud kana por kana.",
          coachNote:
            "Antes de tocar una ficha, pronuncia la lectura completa en voz baja; eso reduce errores por impulso.",
        };
    }
  }, [activeTab]);

  const audioSrc = useMemo(() => buildAudioSrc(question.audio), [question.audio]);
  const writingUnits = useMemo(() => getWritingUnits(question), [question]);
  const displayWord = useMemo(() => getWordTitle(question), [question]);
  const reading = useMemo(() => getReading(question), [question]);
  const meanings = useMemo(() => question.meanings?.filter(Boolean) ?? [], [question.meanings]);
  const activeQuizProgress = getQuizTypeProgress(question, activeTab);
  const totalProgress = getWordQuizProgressPercent(question);
  const ctaLabel = activeQuizProgress.completed
    ? `Repetir ${VOCABULARY_QUIZ_TYPE_LABELS[activeTab].toLowerCase()}`
    : `Resolver ${VOCABULARY_QUIZ_TYPE_LABELS[activeTab].toLowerCase()} (+25%)`;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-border-subtle bg-surface-primary p-1.5">
        {VOCABULARY_TABS.map((tab) => {
          const progress = getQuizTypeProgress(question, tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1.5 text-[10px] font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 ${
                activeTab === tab.id
                  ? "bg-accent text-content-inverted shadow-sm"
                  : progress.completed
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
              }`}
              aria-label={`${tab.label}: ${progress.completed ? "completado" : "pendiente"}`}
            >
              {progress.completed ? <CheckCircle2 size={13} /> : tab.icon}
              <span className="max-w-full truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-primary px-3 py-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-content-tertiary">
          <span>Progreso del quiz</span>
          <span>{totalProgress}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
            initial={false}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
      </div>

      <div style={{ perspective: 1800 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={LESSON_SECTION_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={LESSON_SECTION_TRANSITION}
            className="origin-center will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="space-y-3 sm:space-y-4">
              {activeTab === "meaning" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-primary p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-content-tertiary">
                    Enseñanza del significado
                  </p>
                  <h4 className="mt-2 text-lg font-black text-content-primary">
                    {displayWord}
                  </h4>
                  <p className="mt-1 text-sm font-semibold text-content-secondary">
                    {reading}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {meanings.length > 0 ? (
                      meanings.map((meaning) => (
                        <span
                          key={meaning}
                          className="rounded-full border border-accent/18 bg-accent/8 px-3 py-1 text-xs font-bold text-accent"
                        >
                          {meaning}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-border-subtle bg-surface-secondary px-3 py-1 text-xs font-bold text-content-secondary">
                        {getPrimaryMeaning(question)}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 rounded-2xl bg-surface-secondary px-3 py-3 text-sm leading-relaxed text-content-secondary">
                    Aquí la meta es asociar {displayWord} con su idea principal dentro de {subthemeMeaning.toLowerCase()}. Antes del quiz, quiero que puedas verla y pensar en {getPrimaryMeaning(question).toLowerCase()} sin traducirla paso por paso.
                  </p>
                </div>
              )}

              {activeTab === "listening" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-primary p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-content-tertiary">
                    Enseñanza del audio
                  </p>
                  <h4 className="mt-2 text-lg font-black text-content-primary">
                    Escucha cómo suena {displayWord}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-content-secondary">
                    Primero identifica el sonido completo y luego vuelve a conectarlo con la lectura {reading}.
                  </p>
                  {audioSrc ? (
                    <audio controls className="mt-4 w-full" src={audioSrc} />
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-border-subtle bg-surface-secondary px-3 py-4 text-center text-sm font-semibold text-content-muted">
                      No hay audio disponible para esta palabra todavía.
                    </div>
                  )}
                  <div className="mt-4 rounded-2xl bg-surface-secondary px-3 py-3 text-sm leading-relaxed text-content-secondary">
                    Cuando reproduzcas el audio, escucha el ritmo de {reading} y compáralo con la forma escrita {displayWord}. La idea es que, en el quiz, reconozcas la palabra por oído sin necesidad de pistas extra.
                  </div>
                </div>
              )}

              {activeTab === "speaking" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-primary p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-content-tertiary">
                    Enseñanza del habla
                  </p>
                  <div className="rounded-2xl bg-surface-secondary px-4 py-4 text-center">
                    <p className="text-3xl font-black text-content-primary">{displayWord}</p>
                    <p className="mt-2 text-base font-semibold text-content-secondary">{reading}</p>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-content-secondary">
                    Practica diciendo la palabra tal como la ves: primero lento, luego natural. Quiero que la lectura {reading} salga con claridad y sin arrastrar sonidos de más.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl bg-surface-secondary px-3 py-3 text-center text-xs font-bold text-content-secondary">
                      1. Léela completa
                    </div>
                    <div className="rounded-2xl bg-surface-secondary px-3 py-3 text-center text-xs font-bold text-content-secondary">
                      2. Repite con ritmo
                    </div>
                    <div className="rounded-2xl bg-surface-secondary px-3 py-3 text-center text-xs font-bold text-content-secondary">
                      3. Dila sin mirar apoyo
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "writing" && (
                <div className="rounded-3xl border border-border-subtle bg-surface-primary p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-content-tertiary">
                    Enseñanza de la escritura
                  </p>
                  <h4 className="mt-2 text-lg font-black text-content-primary">
                    Construcción de {displayWord}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-content-secondary">
                    La lectura objetivo es {reading}. Antes del quiz, memoriza cómo se arma kana por kana.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {writingUnits.length > 0 ? (
                      writingUnits.map((unit, index) => (
                        <KanaLearningChip
                          key={`${unit}-${index}`}
                          symbol={unit}
                          kanaCatalog={kanaCatalog}
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-border-subtle bg-surface-secondary px-3 py-3 text-sm font-semibold text-content-secondary">
                        No hay lectura cargada.
                      </div>
                    )}
                  </div>
                  <p className="mt-4 rounded-2xl bg-surface-secondary px-3 py-3 text-sm leading-relaxed text-content-secondary">
                    Fíjate en el orden de las piezas de {reading}. En el quiz ya no te voy a enseñar la respuesta: solo te pediré reconstruirla.
                  </p>
                </div>
              )}

              <WritingEvaluationGuide
                eyebrow={tabCopy.eyebrow}
                title={tabCopy.title}
                intro={tabCopy.intro}
                emphasis={tabCopy.emphasis}
                criteria={VOCABULARY_CRITERIA[activeTab]}
                coachNote={tabCopy.coachNote}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <LessonCTA label={ctaLabel} onClick={() => onStartQuiz(activeTab)} />
    </div>
  );
}
