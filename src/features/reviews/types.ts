import type { Kanji } from "@/features/kanji/types";

/* ── Base fields shared by all review items ───────────── */

interface ReviewBase {
  id: string;
  lastPracticed: string;
}

/* ── Kanji review ─────────────────────────────────────── */

export interface ReviewKanji extends ReviewBase {
  type: "kanji";
  kanji: Kanji;
}

/* ── Grammar review ───────────────────────────────────── */

export interface ReviewGrammar extends ReviewBase {
  type: "grammar";
  title: string;
  description: string;
  examples: string;
}

/* ── Listening review ─────────────────────────────────── */

export interface ReviewListening extends ReviewBase {
  type: "listening";
  title: string;
  description: string;
  /** Japanese kana/kanji label */
  kana: string;
}

/* ── Speaking review ──────────────────────────────────── */

export interface ReviewSpeaking extends ReviewBase {
  type: "speaking";
  title: string;
  description: string;
  /** Example phrase to practice */
  phrase: string;
}

/* ── Union type ───────────────────────────────────────── */

export type ReviewItem =
  | ReviewKanji
  | ReviewGrammar
  | ReviewListening
  | ReviewSpeaking;

/* ── Stats ────────────────────────────────────────────── */

export interface ReviewStats {
  totalReviews: number;
  averageAccuracy: number;
  currentStreak: number;
  kanjiMastered: number;
}
