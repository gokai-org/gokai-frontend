"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Headphones, Mic, Pencil } from "lucide-react";
import LessonCTA from "@/features/lessons/components/LessonCTA";
import {
  AnimatedLessonTabs,
  LESSON_SECTION_TRANSITION,
  LESSON_SECTION_VARIANTS,
  getAnimatedTabDirection,
  type AnimatedLessonTab,
} from "@/features/lessons/components/AnimatedLessonTabs";
import WritingEvaluationGuide from "@/features/lessons/components/WritingEvaluationGuide";
import type { VocabularyWordLesson } from "../types";

type VocabularyGuideTab = "meaning" | "listening" | "speaking" | "writing";

type VocabularyWordGuideProps = {
  question: VocabularyWordLesson;
  subthemeMeaning: string;
  onStartQuiz: () => void;
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

export default function VocabularyWordGuide({
  question,
  subthemeMeaning,
  onStartQuiz,
}: VocabularyWordGuideProps) {
  const [activeTab, setActiveTab] = useState<VocabularyGuideTab>("meaning");
  const [direction, setDirection] = useState(1);

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

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <AnimatedLessonTabs
        tabs={VOCABULARY_TABS}
        activeTab={activeTab}
        onChange={switchTab}
        layoutId="vocabulary-word-guide-tab-bg"
      />

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
                        <div
                          key={`${unit}-${index}`}
                          className="flex h-11 min-w-11 items-center justify-center rounded-2xl border border-accent/18 bg-accent/8 px-3 text-lg font-black text-accent"
                        >
                          {unit}
                        </div>
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

      <LessonCTA label="Realizar quiz" onClick={onStartQuiz} />
    </div>
  );
}
