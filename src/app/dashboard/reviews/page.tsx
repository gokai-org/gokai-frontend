"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { listKanjis } from "@/features/kanji/api/kanjiApi";
import type { Kanji } from "@/features/kanji/types";
import { WritingPracticeModal } from "@/features/kanji/components/WritingPracticeModal";

import {
  ReviewStatsOverview,
  ReviewItemList,
} from "@/features/reviews";
import type { ReviewItem } from "@/features/reviews";

/* ── Animation variants ────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

/* ── Mock items for grammar / listening / speaking ────── */

const MOCK_GRAMMAR: ReviewItem = {
  id: "grammar-1",
  type: "grammar",
  lastPracticed: "6h",
  title: "です / ます (Forma formal)",
  description:
    "Terminaciones formales usadas en japonés cortés para oraciones afirmativas.",
  examples: "これは水です。/ パンを食べます。",
};

const MOCK_LISTENING: ReviewItem = {
  id: "listening-1",
  type: "listening",
  lastPracticed: "12h",
  title: "Ingredientes (材料)",
  description:
    "Escucha y reconoce vocabulario relacionado con ingredientes de cocina.",
  kana: "ざいりょう",
};

const MOCK_SPEAKING: ReviewItem = {
  id: "speaking-1",
  type: "speaking",
  lastPracticed: "24h",
  title: "〜が好きです (Me gusta)",
  description:
    "Practica la pronunciación de la estructura para expresar gustos.",
  phrase: "ラーメンが好きです。",
};

/* ── Page ─────────────────────────────────────────────── */

export default function Page() {
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceKanji, setPracticeKanji] = useState<Kanji | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listKanjis()
      .then((data) => {
        if (!cancelled) setKanjis(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Error al cargar kanji");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Build exactly 4 review items */
  const reviewItems = useMemo<ReviewItem[]>(() => {
    const items: ReviewItem[] = [];

    if (kanjis.length > 0) {
      items.push({
        id: kanjis[0].id,
        type: "kanji",
        lastPracticed: "2h",
        kanji: kanjis[0],
      });
    }

    items.push(MOCK_GRAMMAR, MOCK_LISTENING, MOCK_SPEAKING);
    return items;
  }, [kanjis]);

  const pendingCount = reviewItems.length;

  const handleStartReview = useCallback(
    (itemId: string) => {
      const found = kanjis.find((k) => k.id === itemId);
      if (found) setPracticeKanji(found);
    },
    [kanjis]
  );

  return (
    <DashboardShell
      header={
        <DashboardHeader
          icon={
            <RefreshCw className="w-7 h-7 text-white" strokeWidth={2.5} />
          }
          title="Repaso"
          japaneseText="復習"
          subtitle="Refuerza lo que has aprendido con repasos inteligentes"
          rightContent={
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {pendingCount} lecciones pendientes
              </span>
              <div className="w-2 h-2 rounded-full bg-[#993331] animate-pulse" />
            </div>
          }
        />
      }
    >
      {/* ── Writing practice modal ────────────────────── */}
      {practiceKanji && (
        <WritingPracticeModal
          kanji={practiceKanji}
          onClose={() => setPracticeKanji(null)}
        />
      )}

      {/* ── Banner ────────────────────────────────────── */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 bg-gradient-to-r from-[#993331] to-[#7a2927] rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-white/80 text-sm font-medium mb-1"
            >
              Sesión de repaso
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
            >
              ¡Hora de repasar!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-white/80 mt-2 text-sm max-w-md"
            >
              復習の時間です。少しずつ進めましょう！
              <br />
              <span className="text-white/60 text-xs">
                Es momento de repasar. ¡Vamos paso a paso!
              </span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="text-center">
              <p className="text-4xl font-extrabold">{pendingCount}</p>
              <p className="text-xs text-white/70 font-medium mt-1">
                Pendientes
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Stats cards ───────────────────────────────── */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <ReviewStatsOverview />
      </motion.div>

      {/* ── Review list (4 items — 1 per type) ────────── */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <SectionHeader
          className="mb-5"
          title={
            <>
              Repasos <span className="text-[#993331]">Pendientes</span>
            </>
          }
          titleClassName="text-2xl font-extrabold tracking-tight text-gray-900"
          subtitle="Una lección de cada tipo lista para reforzar"
        />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="flex items-center gap-5">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="w-24 h-10 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
          >
            <p className="text-red-600 font-bold">{error}</p>
            <p className="text-red-500 text-sm mt-1">
              Intenta recargar la página
            </p>
          </motion.div>
        ) : (
          <ReviewItemList items={reviewItems} onStart={handleStartReview} />
        )}
      </motion.div>

      <motion.div
        custom={3}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center"
      >
        <div className="inline-block bg-[#993331]/10 px-8 py-4 rounded-full mb-4">
          <p className="text-xl font-bold text-[#993331]">
            毎日の復習が力になります
          </p>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          El repaso diario se convierte en fortaleza. ¡Sigue practicando!
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="bg-gradient-to-r from-[#993331] to-[#7a2927] text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all shadow-md"
        >
          Comenzar sesión de repaso
        </motion.button>
      </motion.div>
    </DashboardShell>
  );
}
