"use client";

import { BookOpen, BookText, CheckCircle2, Headphones, Mic, PenTool, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import {
  getPrimaryMeaning,
  getPrimaryReading,
} from "@/features/kanji/utils/kanjiText";
import type { ReviewItem, ReviewKanji } from "../types";

interface ReviewListProps {
  items: ReviewItem[];
  loading?: boolean;
  error?: string | null;
  recommendedItemId?: string;
  onStart?: (id: string) => void;
}

type ReviewMeta = {
  label: string;
  action: string;
  icon: LucideIcon;
  badgeClassName: string;
  iconClassName: string;
  buttonClassName: string;
  recommendedClassName: string;
};

const reviewMeta: Record<ReviewItem["type"], ReviewMeta> = {
  kanji: {
    label: "Escritura",
    action: "Escribir",
    icon: PenTool,
    badgeClassName: "bg-accent/10 text-accent border-accent/15",
    iconClassName: "bg-gradient-to-br from-accent to-accent-hover",
    buttonClassName: "bg-accent hover:bg-accent-hover",
    recommendedClassName: "ring-accent/20 bg-accent/[0.045]",
  },
  grammar: {
    label: "Gramática",
    action: "Repasar",
    icon: BookText,
    badgeClassName: "bg-[#6B5B95]/10 text-[#6B5B95] border-[#6B5B95]/15 dark:text-[#A99AE0]",
    iconClassName: "bg-gradient-to-br from-[#6B5B95] to-[#8B7BB5]",
    buttonClassName: "bg-[#6B5B95] hover:bg-[#5A4A84]",
    recommendedClassName: "ring-[#6B5B95]/20 bg-[#6B5B95]/[0.045]",
  },
  listening: {
    label: "Escuchar",
    action: "Escuchar",
    icon: Headphones,
    badgeClassName: "bg-[#C4863B]/10 text-[#C4863B] border-[#C4863B]/15 dark:text-[#DDB06C]",
    iconClassName: "bg-gradient-to-br from-[#C4863B] to-[#D4A65B]",
    buttonClassName: "bg-[#C4863B] hover:bg-[#A8722F]",
    recommendedClassName: "ring-[#C4863B]/20 bg-[#C4863B]/[0.05]",
  },
  speaking: {
    label: "Hablar",
    action: "Hablar",
    icon: Mic,
    badgeClassName: "bg-[#3B8A7A]/10 text-[#3B8A7A] border-[#3B8A7A]/15 dark:text-[#78C7B9]",
    iconClassName: "bg-gradient-to-br from-[#3B8A7A] to-[#5BAA9A]",
    buttonClassName: "bg-[#3B8A7A] hover:bg-[#2D7466]",
    recommendedClassName: "ring-[#3B8A7A]/20 bg-[#3B8A7A]/[0.05]",
  },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const joinClassNames = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

function getReviewTitle(item: ReviewItem) {
  if (item.type === "kanji") {
    const reading = getPrimaryReading(item.kanji.readings) ?? "--";
    const meaning = getPrimaryMeaning(item.kanji.meanings) ?? "Sin significado";
    return `${item.kanji.symbol} (${reading}) — ${meaning}`;
  }

  return item.title;
}

function getReviewDescription(item: ReviewItem) {
  if (item.type === "kanji") return "Practica el trazado y refuerza memoria visual.";
  return item.description;
}

function getReviewDetail(item: ReviewItem) {
  if (item.type === "kanji") return item.kanji.symbol;
  if (item.type === "grammar") return item.examples;
  if (item.type === "listening") return item.kana;
  return `「${item.phrase}」`;
}

function ReviewCard({
  item,
  recommended,
  onStart,
}: {
  item: ReviewItem;
  recommended: boolean;
  onStart?: (id: string) => void;
}) {
  const meta = reviewMeta[item.type];
  const Icon = meta.icon;
  const detail = getReviewDetail(item);

  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -2, boxShadow: "0 12px 28px -16px rgba(17,24,39,0.28)" }}
      className={joinClassNames(
        "rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm transition-colors",
        recommended && "ring-1",
        recommended && meta.recommendedClassName,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <div className="flex items-center gap-3 sm:contents">
          <div
            className={joinClassNames(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md sm:h-14 sm:w-14",
              meta.iconClassName,
            )}
          >
            {item.type === "kanji" ? (
              <span className="select-none text-2xl font-extrabold text-content-inverted">
                {(item as ReviewKanji).kanji.symbol}
              </span>
            ) : (
              <Icon className="h-5 w-5 text-content-inverted" />
            )}
          </div>

          <div className="min-w-0 sm:hidden">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {recommended && <RecommendedBadge />}
              <TypeBadge type={item.type} />
            </div>
            <h3 className="truncate text-base font-extrabold text-content-primary">
              {getReviewTitle(item)}
            </h3>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-1 hidden flex-wrap items-center gap-2 sm:flex">
            {recommended && <RecommendedBadge />}
            <TypeBadge type={item.type} />
            <span className="text-xs font-medium text-content-muted">
              Último repaso: {item.lastPracticed}
            </span>
          </div>
          <h3 className="hidden truncate text-base font-extrabold text-content-primary sm:block">
            {getReviewTitle(item)}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-content-secondary sm:text-sm">
            {getReviewDescription(item)}
          </p>
          {detail && (
            <p className="mt-1 truncate font-mono text-xs font-bold text-content-tertiary">
              {detail}
            </p>
          )}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onStart?.(item.id)}
          className={joinClassNames(
            "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-content-inverted shadow-md transition-all hover:shadow-lg sm:w-auto",
            meta.buttonClassName,
          )}
        >
          <Icon className="h-4 w-4" />
          {meta.action}
        </motion.button>
      </div>
    </motion.article>
  );
}

function TypeBadge({ type }: { type: ReviewItem["type"] }) {
  const meta = reviewMeta[type];
  const Icon = meta.icon;

  return (
    <span
      className={joinClassNames(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-extrabold",
        meta.badgeClassName,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function RecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/15 bg-accent/10 px-2 py-0.5 text-xs font-extrabold text-accent">
      <Sparkles className="h-3.5 w-3.5" />
      Recomendado
    </span>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm"
        >
          <div className="flex animate-pulse items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-surface-tertiary" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 rounded bg-surface-tertiary" />
              <div className="h-3 w-2/3 rounded bg-surface-tertiary" />
            </div>
            <div className="hidden h-10 w-24 rounded-full bg-surface-tertiary sm:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewList({
  items,
  loading = false,
  error,
  recommendedItemId,
  onStart,
}: ReviewListProps) {
  if (loading) return <ReviewListSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/30">
        <p className="font-bold text-red-600">{error}</p>
        <p className="mt-1 text-sm text-red-500">Intenta recargar la página.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-primary p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-tertiary">
          <CheckCircle2 className="h-7 w-7 text-accent" />
        </div>
        <p className="text-lg font-extrabold text-content-primary">
          No hay repasos pendientes
        </p>
        <p className="mt-1 text-sm text-content-tertiary">
          Kazu está completo por ahora. Sigue estudiando para desbloquear más.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-content-tertiary">
            Ruta guiada
          </p>
          <h2 className="text-lg font-extrabold tracking-tight text-content-primary">
            Repasos existentes
          </h2>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border-subtle bg-surface-primary px-3 py-1.5 text-xs font-bold text-content-tertiary sm:flex">
          <BookOpen className="h-3.5 w-3.5" />
          {items.length} pendientes
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {items.map((item, index) => (
          <ReviewCard
            key={item.id}
            item={item}
            recommended={item.id === recommendedItemId || (!recommendedItemId && index === 0)}
            onStart={onStart}
          />
        ))}
      </motion.div>
    </section>
  );
}
