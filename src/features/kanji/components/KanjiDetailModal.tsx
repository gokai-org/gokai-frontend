import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Kanji } from "@/features/kanji/types";
import {
  readingsToArray,
  meaningsToArray,
  getPrimaryMeaning,
} from "@/features/kanji/utils/kanjiText";
import { WritingPracticeModal } from "./WritingPracticeModal";
import { KanjiStrokePlayer } from "./KanjiStrokePlayer";
import { KanjiLessonFlowModal } from "./lesson-flow";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 16,
    transition: { duration: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

/* ── Section Card sub-component ── */
function SectionCard({
  icon,
  iconBg,
  title,
  count,
  children,
  index,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  count: number;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl bg-surface-tertiary ring-1 ring-border-subtle shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>
        <h3 className="text-sm font-bold text-content-primary">{title}</h3>
        <span className="ml-auto text-[11px] font-semibold text-content-muted bg-surface-tertiary rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Main component ── */

interface KanjiDetailModalProps {
  kanji: Kanji | null;
  onClose: () => void;
  practiceDisabled?: boolean;
  practiceDisabledReason?: string;
}

export function KanjiDetailModal({
  kanji,
  onClose,
  practiceDisabled = false,
  practiceDisabledReason,
}: KanjiDetailModalProps) {
  const [showWritingPractice, setShowWritingPractice] = useState(false);
  const [showLessonFlow, setShowLessonFlow] = useState(false);
  const [activeStroke, setActiveStroke] = useState(-1);

  if (!kanji) return null;

  const readings = readingsToArray(kanji.readings);
  const meanings = meaningsToArray(kanji.meanings);
  const primaryMeaning = getPrimaryMeaning(kanji.meanings);
  const hasStrokes = kanji.strokes && kanji.strokes.length > 0 && kanji.viewBox;

  if (showLessonFlow && !practiceDisabled) {
    return (
      <KanjiLessonFlowModal
        kanji={kanji}
        onClose={() => setShowLessonFlow(false)}
      />
    );
  }

  if (showWritingPractice && !practiceDisabled) {
    return (
      <WritingPracticeModal
        kanji={kanji}
        onClose={() => setShowWritingPractice(false)}
      />
    );
  }

  return (
    <AnimatePresence>
      {/* ── Overlay ── */}
      <motion.div
        key="detail-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        {/* ── Panel ── */}
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            "bg-surface-elevated w-full shadow-2xl ring-1 ring-border-subtle flex flex-col",
            "max-w-lg rounded-3xl max-h-[92dvh]",
            "max-sm:max-w-none max-sm:mx-auto max-sm:w-[calc(100vw-2rem)]",
            "max-sm:max-h-[90dvh] max-sm:rounded-3xl",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Gradient header (matches WritingPracticeModal) ── */}
          <div className="shrink-0 rounded-t-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-accent to-accent-hover px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-surface-primary/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                    <span className="text-2xl font-bold text-content-inverted select-none">
                      {kanji.symbol}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-content-inverted leading-tight">
                      Detalle del Kanji
                    </h2>
                    {primaryMeaning && (
                      <p className="text-xs text-white/70 font-medium capitalize">
                        {primaryMeaning}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Points badge */}
                  <span className="px-2.5 py-1 bg-surface-primary/20 backdrop-blur-sm text-content-inverted text-[10px] font-bold rounded-full flex items-center gap-1">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {kanji.pointsToUnlock}
                  </span>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl bg-surface-primary/15 hover:bg-surface-primary/25 text-content-inverted flex items-center justify-center transition"
                    aria-label="Cerrar"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Scrollable body with custom scrollbar ── */}
          <div className="flex-1 min-h-0 overflow-y-auto kanji-detail-scroll">
            {/* Hero: Kanji interactive area */}
            <div className="flex flex-col items-center px-5 pt-5 pb-3">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="relative rounded-2xl bg-surface-tertiary ring-1 ring-border-subtle shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex flex-col items-center w-full"
              >
                {/* Kanji stroke player or static symbol */}
                <div className="relative flex items-center justify-center">
                  {hasStrokes ? (
                    <div
                      className="cursor-pointer group"
                      onClick={() =>
                        setActiveStroke((s) =>
                          s >= kanji.strokes!.length - 1 ? -1 : s + 1,
                        )
                      }
                      title="Clic para ver trazos"
                    >
                      <KanjiStrokePlayer
                        viewBox={kanji.viewBox!}
                        strokes={kanji.strokes!}
                        activeStrokeIndex={activeStroke}
                        showNumbers={activeStroke >= 0}
                        numberMode="uptoActive"
                        size={150}
                      />
                    </div>
                  ) : (
                    <span className="text-[110px] leading-none font-bold text-content-primary select-none py-2">
                      {kanji.symbol}
                    </span>
                  )}
                </div>

                {/* Stroke hint */}
                {hasStrokes && (
                  <motion.p
                    custom={1}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="mt-2 text-[11px] font-medium text-content-muted flex items-center gap-1.5"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                    Toca para ver trazos · {kanji.strokes!.length} trazos
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Content sections */}
            <div className="px-5 pb-5 space-y-3">
              {/* Lecturas */}
              <SectionCard
                index={1}
                title="Lecturas"
                count={readings.length}
                iconBg="bg-blue-50 dark:bg-blue-950/30"
                icon={
                  <svg
                    className="h-3.5 w-3.5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.536 8.464a5 5 0 010 7.072M12 6.253v11.494M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728"
                    />
                  </svg>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {readings.length > 0 ? (
                    readings.map((reading, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-b from-blue-50 to-blue-50/40 dark:from-blue-950/50 dark:to-blue-950/30 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-sm shadow-blue-100/50 dark:shadow-none"
                      >
                        {reading}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-content-muted italic">
                      Sin lecturas disponibles
                    </span>
                  )}
                </div>
              </SectionCard>

              {/* Significados */}
              <SectionCard
                index={2}
                title="Significados"
                count={meanings.length}
                iconBg="bg-emerald-50 dark:bg-emerald-950/30"
                icon={
                  <svg
                    className="h-3.5 w-3.5 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {meanings.length > 0 ? (
                    meanings.map((meaning, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-lg border border-emerald-200 dark:border-emerald-800 bg-gradient-to-b from-emerald-50 to-emerald-50/40 dark:from-emerald-950/50 dark:to-emerald-950/30 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 capitalize shadow-sm shadow-emerald-100/50 dark:shadow-none"
                      >
                        {meaning}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-content-muted italic">
                      Sin significados disponibles
                    </span>
                  )}
                </div>
              </SectionCard>

              {/* Info pill (strokes count) */}
              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-center gap-3 py-1"
              >
                {hasStrokes && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-content-muted">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    {kanji.strokes!.length} trazos
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-content-muted">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {kanji.pointsToUnlock} puntos
                </span>
              </motion.div>

              {/* CTA: Lesson flow (primary) */}
              <motion.button
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => {
                  if (practiceDisabled) return;
                  setShowLessonFlow(true);
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={practiceDisabled}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/25 transition hover:shadow-xl hover:shadow-accent/30 focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:from-surface-tertiary disabled:to-surface-tertiary disabled:text-content-muted disabled:shadow-none"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {practiceDisabled ? "Aún bloqueado" : "Iniciar lección"}
              </motion.button>

              {/* Secondary: writing-only practice */}
              {!practiceDisabled && (
                <motion.button
                  custom={5}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setShowWritingPractice(true)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-surface-tertiary px-4 py-2.5 text-xs font-semibold text-content-secondary hover:text-content-primary transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Solo practicar trazado
                </motion.button>
              )}

              {practiceDisabled && practiceDisabledReason && (
                <motion.p
                  custom={5}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-center text-xs leading-5 text-content-secondary"
                >
                  {practiceDisabledReason}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
