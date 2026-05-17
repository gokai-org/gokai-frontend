"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, CheckCircle2, ExternalLink, Headphones, Mic, Pencil } from "lucide-react";
import { classifyJapaneseCharacter } from "@/features/chatbot/utils/writingCharacters";
import {
  getWritingPalette,
  resolveWritingAccentColor,
} from "@/features/chatbot/utils/writingPalette";
import { listKanaCatalog } from "@/features/kana/api/kanaApi";
import {
  buildKanaCatalogState,
  getKanaSymbolGuideInfo,
  type KanaCatalogState,
} from "@/features/kana/utils/kanaSymbolGuide";
import LessonCTA from "@/features/lessons/components/LessonCTA";
import {
  LESSON_SECTION_TRANSITION,
  LESSON_SECTION_VARIANTS,
  getAnimatedTabDirection,
  type AnimatedLessonTab,
} from "@/features/lessons/components/AnimatedLessonTabs";
import WritingEvaluationGuide from "@/features/lessons/components/WritingEvaluationGuide";
import { QuizAudioPlayer } from "@/shared/ui";
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

type VocabularyWordGuideProps = {
  question: VocabularyWordLesson;
  subthemeMeaning: string;
  onStartQuiz: (type: VocabularyAnswerType) => void;
  onNavigateToLibrary?: () => void;
};

type ActiveSymbolPopover = {
  id: string;
  sticky: boolean;
};

type ScopedActiveSymbolPopover = ActiveSymbolPopover & {
  scopeKey: string;
};

type SymbolPopoverPosition = {
  top: number;
  left: number;
  arrowLeft: number;
  placement: "top" | "bottom";
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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
      title: "Escuchar el feedback",
      description: "",
      cue: "Graba un intento corto y usa el puntaje con sus tips para corregir el siguiente audio.",
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

function KanaLearningChip({
  chipId,
  symbol,
  kanaCatalog,
  activePopover,
  onActivePopoverChange,
  canHoverPopover,
  onNavigateToLibrary,
}: {
  chipId: string;
  symbol: string;
  kanaCatalog: KanaCatalogState | null;
  activePopover: ActiveSymbolPopover | null;
  onActivePopoverChange: Dispatch<SetStateAction<ActiveSymbolPopover | null>>;
  canHoverPopover: boolean;
  onNavigateToLibrary?: () => void;
}) {
  const info = getKanaSymbolGuideInfo(symbol, kanaCatalog);
  const scriptType = classifyJapaneseCharacter(symbol);
  const palette = getWritingPalette(
    scriptType ? resolveWritingAccentColor(scriptType) : undefined,
  );
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [position, setPosition] = useState<SymbolPopoverPosition | null>(null);
  const isActive = activePopover?.id === chipId;

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openHoverPopover = useCallback(() => {
    clearCloseTimer();
    onActivePopoverChange({ id: chipId, sticky: false });
  }, [chipId, clearCloseTimer, onActivePopoverChange]);

  const scheduleHoverClose = useCallback(() => {
    if (!isActive || activePopover?.sticky) {
      return;
    }

    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      onActivePopoverChange((current) => {
        if (!current || current.id !== chipId || current.sticky) {
          return current;
        }

        return null;
      });
      closeTimerRef.current = null;
    }, 90);
  }, [activePopover?.sticky, chipId, clearCloseTimer, isActive, onActivePopoverChange]);

  const toggleStickyPopover = useCallback(() => {
    clearCloseTimer();
    onActivePopoverChange(
      isActive && activePopover?.sticky
        ? null
        : { id: chipId, sticky: true },
    );
  }, [activePopover?.sticky, chipId, clearCloseTimer, isActive, onActivePopoverChange]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (!isActive) {
      clearCloseTimer();
    }
  }, [clearCloseTimer, isActive]);

  useLayoutEffect(() => {
    if (!isActive) {
      return;
    }

    const updatePosition = () => {
      const anchor = buttonRef.current;
      const popover = popoverRef.current;

      if (!anchor || !popover) {
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 12;
      const gap = 10;
      const fitsAbove = anchorRect.top >= popoverRect.height + gap + padding;
      const fitsBelow =
        viewportHeight - anchorRect.bottom >= popoverRect.height + gap + padding;
      const placement: "top" | "bottom" = fitsAbove || !fitsBelow ? "top" : "bottom";
      const desiredLeft =
        anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;
      const left = clamp(
        desiredLeft,
        padding,
        Math.max(padding, viewportWidth - popoverRect.width - padding),
      );
      const desiredTop =
        placement === "top"
          ? anchorRect.top - popoverRect.height - gap
          : anchorRect.bottom + gap;
      const top = clamp(
        desiredTop,
        padding,
        Math.max(padding, viewportHeight - popoverRect.height - padding),
      );
      const arrowLeft = clamp(
        anchorRect.left + anchorRect.width / 2 - left,
        18,
        Math.max(18, popoverRect.width - 18),
      );

      setPosition({ top, left, arrowLeft, placement });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isActive]);

  return (
    <div
      data-vocabulary-symbol-popover-root="true"
      className="relative inline-flex"
    >
      <button
        ref={buttonRef}
        type="button"
        className="flex h-11 min-w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-primary/90 px-3 text-lg font-black text-content-primary transition hover:-translate-y-0.5 hover:border-[color:var(--symbol-chip-border)] hover:bg-[color:var(--symbol-chip-soft)] hover:text-[color:var(--symbol-chip-accent)] focus:outline-none focus-visible:border-[color:var(--symbol-chip-border-strong)] focus-visible:bg-[color:var(--symbol-chip-soft)] focus-visible:text-[color:var(--symbol-chip-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--symbol-chip-ring)] jp-text"
        style={{
          ["--symbol-chip-accent" as string]: palette.accent,
          ["--symbol-chip-soft" as string]: palette.soft,
          ["--symbol-chip-border" as string]: palette.borderSoft,
          ["--symbol-chip-border-strong" as string]: palette.borderStrong,
          ["--symbol-chip-ring" as string]: palette.ring,
        }}
        aria-label={info.title}
        aria-expanded={isActive}
        onPointerEnter={(event) => {
          if (canHoverPopover && event.pointerType === "mouse") {
            openHoverPopover();
          }
        }}
        onPointerLeave={(event) => {
          if (canHoverPopover && event.pointerType === "mouse") {
            scheduleHoverClose();
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || !canHoverPopover) {
            event.preventDefault();
            toggleStickyPopover();
          }
        }}
        onFocus={() => {
          clearCloseTimer();
          onActivePopoverChange({ id: chipId, sticky: true });
        }}
      >
        {symbol}
      </button>
      {isActive && typeof document !== "undefined"
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-[90]">
              <motion.div
                ref={popoverRef}
                data-vocabulary-symbol-popover-root="true"
                initial={{ opacity: 0, y: position?.placement === "bottom" ? -6 : 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: position?.placement === "bottom" ? -4 : 4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto fixed w-[min(18rem,calc(100vw-1.5rem))]"
                style={{
                  top: position?.top ?? -9999,
                  left: position?.left ?? -9999,
                }}
                onMouseEnter={clearCloseTimer}
                onMouseLeave={() => {
                  if (canHoverPopover) {
                    scheduleHoverClose();
                  }
                }}
              >
                <div className="relative overflow-visible">
                  <div
                    className="overflow-hidden rounded-2xl border bg-white shadow-xl ring-1 ring-black/5 dark:bg-[#121316] dark:ring-white/8"
                    style={{ borderColor: palette.borderSoft }}
                  >
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl font-black jp-text"
                        style={{
                          color: palette.accent,
                          backgroundColor: palette.softStrong,
                        }}
                      >
                        {symbol}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-[10px] font-black uppercase tracking-[0.18em]"
                          style={{ color: palette.symbolMuted }}
                        >
                          Guía del símbolo
                        </p>
                        <p className="mt-0.5 text-sm font-black text-slate-950 dark:text-neutral-50">
                          {info.title}
                        </p>
                      </div>
                    </div>
                    <div
                      className="border-t px-3 py-2.5"
                      style={{
                        borderColor: palette.borderSoft,
                        backgroundColor: palette.soft,
                      }}
                    >
                      <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-neutral-300">
                        {info.description}
                      </p>
                      {info.libraryHref ? (
                        <Link
                          href={info.libraryHref}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-black transition"
                          style={{ color: palette.accent }}
                          onClick={() => {
                            onNavigateToLibrary?.();
                          }}
                        >
                          {info.actionLabel ?? "Ver tabla fonética"}
                          <ExternalLink size={12} strokeWidth={2.5} />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  {position ? (
                    <div
                      className={`absolute h-3 w-3 rotate-45 bg-white dark:bg-[#121316] ${
                        position.placement === "top"
                          ? "-bottom-1.5 border-b border-r"
                          : "-top-1.5 border-l border-t"
                      }`}
                      style={{
                        left: position.arrowLeft - 6,
                        borderColor: palette.borderSoft,
                      }}
                    />
                  ) : null}
                </div>
              </motion.div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export default function VocabularyWordGuide({
  question,
  subthemeMeaning,
  onStartQuiz,
  onNavigateToLibrary,
}: VocabularyWordGuideProps) {
  const [activeTab, setActiveTab] = useState<VocabularyGuideTab>("meaning");
  const [direction, setDirection] = useState(1);
  const [kanaCatalog, setKanaCatalog] = useState<KanaCatalogState | null>(null);
  const [activePopoverState, setActivePopoverState] =
    useState<ScopedActiveSymbolPopover | null>(null);
  const [canHoverPopover, setCanHoverPopover] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false,
  );
  const activePopoverScopeKey = `${activeTab}:${question.wordId}`;
  const activePopover =
    activePopoverState?.scopeKey === activePopoverScopeKey
      ? activePopoverState
      : null;
  const setActivePopover = useCallback<Dispatch<SetStateAction<ActiveSymbolPopover | null>>>(
    (value) => {
      setActivePopoverState((currentState) => {
        const currentPopover =
          currentState?.scopeKey === activePopoverScopeKey
            ? currentState
            : null;
        const nextPopover =
          typeof value === "function"
            ? value(currentPopover)
            : value;

        return nextPopover
          ? {
              ...nextPopover,
              scopeKey: activePopoverScopeKey,
            }
          : null;
      });
    },
    [activePopoverScopeKey],
  );

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      const nextCanHover = media.matches;
      setCanHoverPopover(nextCanHover);
      if (!nextCanHover) {
        return;
      }

      setActivePopover((current) =>
        current?.sticky ? { ...current, sticky: false } : current,
      );
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [setActivePopover]);

  useEffect(() => {
    if (!activePopover) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-vocabulary-symbol-popover-root='true']")
      ) {
        return;
      }

      setActivePopover(null);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.buttons > 0) {
        setActivePopover(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePopover(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePopover, setActivePopover]);

  useEffect(() => {
    let cancelled = false;

    const loadKanaCatalog = async () => {
      try {
        const catalog = await listKanaCatalog();
        if (cancelled) {
          return;
        }

        setKanaCatalog(buildKanaCatalogState(catalog));
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
            "Graba un intento breve, revisa el feedback y vuelve a pronunciar la palabra ajustando solo un detalle cada vez.",
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
      <div
        data-help-target="lesson-section-tabs"
        className="grid grid-cols-4 gap-1.5 rounded-2xl border border-border-subtle bg-surface-primary p-1.5"
      >
        {VOCABULARY_TABS.map((tab) => {
          const progress = getQuizTypeProgress(question, tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              data-help-target={`lesson-section-tab-${tab.id}`}
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
            <div data-help-target="lesson-section-content" className="space-y-3 sm:space-y-4">
              {activeTab === "meaning" && (
                <div
                  data-help-target="vocabulary-lesson-exercise-meaning"
                  className="rounded-3xl border border-border-subtle bg-surface-primary p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-5"
                >
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
                <div
                  data-help-target="vocabulary-lesson-exercise-listening"
                  className="rounded-3xl border border-border-subtle bg-surface-primary p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-5"
                >
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
                    <QuizAudioPlayer
                      key={`${question.wordId}-${audioSrc}`}
                      audioUrl={audioSrc}
                    />
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
                <div
                  data-help-target="vocabulary-lesson-exercise-speaking"
                  className="rounded-3xl border border-border-subtle bg-surface-primary p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-5"
                >
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
                <div
                  data-help-target="vocabulary-lesson-exercise-writing"
                  className="rounded-3xl border border-border-subtle bg-surface-primary p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-5"
                >
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
                          chipId={`${question.wordId}-${index}-${unit}`}
                          symbol={unit}
                          kanaCatalog={kanaCatalog}
                          activePopover={activePopover}
                          onActivePopoverChange={setActivePopover}
                          canHoverPopover={canHoverPopover}
                          onNavigateToLibrary={onNavigateToLibrary}
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

      <div data-help-target="lesson-quiz-actions">
        <LessonCTA label={ctaLabel} onClick={() => onStartQuiz(activeTab)} />
      </div>
    </div>
  );
}
