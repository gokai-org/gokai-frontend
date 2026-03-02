import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Kanji } from "@/features/kanji/types";
import { readingsToArray, meaningsToArray } from "@/features/kanji/utils/kanjiText";
import { getPrimaryMeaning } from "@/features/kanji/utils/kanjiText";
import { WritingPracticeModal } from "./WritingPracticeModal";
import { KanjiStrokePlayer } from "./KanjiStrokePlayer";

interface KanjiDetailModalProps {
  kanji: Kanji | null;
  onClose: () => void;
}

export function KanjiDetailModal({ kanji, onClose }: KanjiDetailModalProps) {
  const [showWritingPractice, setShowWritingPractice] = useState(false);
  const [activeStroke, setActiveStroke] = useState(-1);

  if (!kanji) return null;

  const readings = readingsToArray(kanji.readings);
  const meanings = meaningsToArray(kanji.meanings);
  const primaryMeaning = getPrimaryMeaning(kanji.meanings);
  const hasStrokes = kanji.strokes && kanji.strokes.length > 0 && kanji.viewBox;

  if (showWritingPractice) {
    return (
      <WritingPracticeModal
        kanji={kanji}
        onClose={() => setShowWritingPractice(false)}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* ─── Hero: Kanji symbol ─── */}
          <div className="relative bg-gradient-to-b from-[#993331]/5 to-transparent px-6 pt-6 pb-5">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-400 shadow-sm ring-1 ring-black/5 transition hover:bg-white hover:text-neutral-700"
              aria-label="Cerrar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center">
              {/* Kanji con stroke player o símbolo estático */}
              <div className="relative flex items-center justify-center">
                {hasStrokes ? (
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setActiveStroke((s) =>
                        s >= kanji.strokes!.length - 1 ? -1 : s + 1
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
                      size={160}
                    />
                  </div>
                ) : (
                  <span className="text-[120px] leading-none font-bold text-neutral-900 select-none">
                    {kanji.symbol}
                  </span>
                )}
              </div>

              {/* Primary meaning + points */}
              <div className="mt-3 flex flex-col items-center gap-2">
                {primaryMeaning && (
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900 capitalize">
                    {primaryMeaning}
                  </h2>
                )}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#993331]/10 px-3 py-1">
                  <svg className="h-3.5 w-3.5 text-[#993331]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-xs font-bold text-[#993331]">
                    {kanji.pointsToUnlock} puntos
                  </span>
                </div>
              </div>

              {/* Stroke hint */}
              {hasStrokes && (
                <p className="mt-2 text-[11px] font-medium text-neutral-400">
                  Toca el kanji para ver los trazos ({kanji.strokes!.length} trazos)
                </p>
              )}
            </div>
          </div>

          {/* ─── Sections ─── */}
          <div className="px-6 pb-6 space-y-5">
            {/* Lecturas */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
                  <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6.253v11.494M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-neutral-700">
                  Lecturas
                </h3>
                <span className="text-xs font-medium text-neutral-400">
                  {readings.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {readings.length > 0 ? (
                  readings.map((reading, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-1.5 text-sm font-semibold text-blue-700"
                    >
                      {reading}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-neutral-400 italic">Sin lecturas disponibles</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-neutral-100" />

            {/* Significados */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50">
                  <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-neutral-700">
                  Significados
                </h3>
                <span className="text-xs font-medium text-neutral-400">
                  {meanings.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {meanings.length > 0 ? (
                  meanings.map((meaning, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-1.5 text-sm font-semibold text-emerald-700 capitalize"
                    >
                      {meaning}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-neutral-400 italic">Sin significados disponibles</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-neutral-100" />

            {/* Practicar */}
            <motion.button
              onClick={() => setShowWritingPractice(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#993331] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#993331]/20 transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-[#993331]/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Practicar trazado
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
