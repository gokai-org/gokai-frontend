import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Kana } from "@/features/kana/types";
import { KanaWritingPracticeModal } from "./KanaWritingPracticeModal";
import { KanaStrokePlayer } from "./KanaStrokePlayer";

/* ── Framer-motion variants ── */
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

/* ── Main component ── */

interface KanaDetailModalProps {
  kana: Kana | null;
  onClose: () => void;
}

export function KanaDetailModal({ kana, onClose }: KanaDetailModalProps) {
  const [showWritingPractice, setShowWritingPractice] = useState(false);
  const [activeStroke, setActiveStroke] = useState(-1);

  if (!kana) return null;

  const hasStrokes = kana.strokes && kana.strokes.length > 0 && kana.viewBox;
  const kanaTypeLabel = kana.kanaType === "hiragana" ? "Hiragana" : "Katakana";

  if (showWritingPractice) {
    return (
      <KanaWritingPracticeModal
        kana={kana}
        onClose={() => setShowWritingPractice(false)}
      />
    );
  }

  return (
    <AnimatePresence>
      {/* ── Overlay ── */}
      <motion.div
        key="kana-detail-overlay"
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
            "bg-neutral-50/80 w-full shadow-2xl ring-1 ring-black/5 flex flex-col",
            "max-w-lg rounded-3xl max-h-[92dvh]",
            "max-sm:max-w-none max-sm:mx-auto max-sm:w-[calc(100vw-2rem)]",
            "max-sm:max-h-[90dvh] max-sm:rounded-3xl",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Gradient header ── */}
          <div className="shrink-0 rounded-t-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#993331] to-[#BA5149] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                    <span className="text-2xl font-bold text-white select-none">
                      {kana.symbol}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">
                      Detalle del {kanaTypeLabel}
                    </h2>
                    <p className="text-xs text-white/70 font-medium">
                      {kana.symbol}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Points badge */}
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {kana.pointsToUnlock}
                  </span>

                  {/* Type badge */}
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase">
                    {kanaTypeLabel}
                  </span>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
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

          {/* ── Scrollable body ── */}
          <div className="flex-1 min-h-0 overflow-y-auto kanji-detail-scroll">
            {/* Hero: Kana interactive area */}
            <div className="flex flex-col items-center px-5 pt-5 pb-3">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="relative rounded-2xl bg-white ring-1 ring-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex flex-col items-center w-full"
              >
                <div className="relative flex items-center justify-center">
                  {hasStrokes ? (
                    <div
                      className="cursor-pointer group"
                      onClick={() =>
                        setActiveStroke((s) =>
                          s >= kana.strokes!.length - 1 ? -1 : s + 1,
                        )
                      }
                      title="Clic para ver trazos"
                    >
                      <KanaStrokePlayer
                        viewBox={kana.viewBox!}
                        strokes={kana.strokes!}
                        activeStrokeIndex={activeStroke}
                        showNumbers={activeStroke >= 0}
                        numberMode="uptoActive"
                        size={150}
                      />
                    </div>
                  ) : (
                    <span className="text-[110px] leading-none font-bold text-neutral-900 select-none py-2">
                      {kana.symbol}
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
                    className="mt-2 text-[11px] font-medium text-neutral-400 flex items-center gap-1.5"
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
                    Toca para ver trazos · {kana.strokes!.length} trazos
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Content sections */}
            <div className="px-5 pb-5 space-y-3">
              {/* Info pill */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-center gap-3 py-1"
              >
                {hasStrokes && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400">
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
                    {kana.strokes!.length} trazos
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {kana.pointsToUnlock} puntos
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5 uppercase">
                  {kanaTypeLabel}
                </span>
              </motion.div>

              {/* CTA: Practice button */}
              {hasStrokes && (
                <motion.button
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setShowWritingPractice(true)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#993331] to-[#BA5149] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#993331]/25 transition hover:shadow-xl hover:shadow-[#993331]/30 focus:outline-none focus:ring-4 focus:ring-[#993331]/20"
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Practicar trazado
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
