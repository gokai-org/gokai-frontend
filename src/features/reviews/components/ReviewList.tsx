"use client";

import { useState } from "react";

import { BookOpen, BookText, CheckCircle2, Heart, Languages, PenTool, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { useFavorites } from "@/features/library/hooks/useFavorites";
import type { FavoriteType } from "@/features/library/types";

import type { ReviewItem } from "../types";

interface ReviewListProps {
  items: ReviewItem[];
  loading?: boolean;
  error?: string | null;
  recommendedItemId?: string;
  startingItemId?: string | null;
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
  insightClassName: string;
  insightAccentClassName: string;
};

const reviewMeta: Record<ReviewItem["type"], ReviewMeta> = {
  kanji: {
    label: "Kanji",
    action: "Repasar",
    icon: PenTool,
    badgeClassName: "bg-accent/10 text-accent border-accent/15",
    iconClassName: "bg-gradient-to-br from-accent to-accent-hover",
    buttonClassName: "bg-accent hover:bg-accent-hover",
    recommendedClassName: "ring-accent/20 bg-accent/[0.045]",
    insightClassName: "border-accent/15 bg-accent/[0.06]",
    insightAccentClassName: "bg-accent/15 text-accent",
  },
  grammar: {
    label: "Gramática",
    action: "Repasar",
    icon: BookText,
    badgeClassName: "bg-[#6B5B95]/10 text-[#6B5B95] border-[#6B5B95]/15 dark:text-[#A99AE0]",
    iconClassName: "bg-gradient-to-br from-[#6B5B95] to-[#8B7BB5]",
    buttonClassName: "bg-[#6B5B95] hover:bg-[#5A4A84]",
    recommendedClassName: "ring-[#6B5B95]/20 bg-[#6B5B95]/[0.045]",
    insightClassName: "border-[#6B5B95]/15 bg-[#6B5B95]/[0.06]",
    insightAccentClassName: "bg-[#6B5B95]/15 text-[#6B5B95] dark:text-[#C0B6EA]",
  },
  vocabulary: {
    label: "Vocabulario",
    action: "Repasar",
    icon: Languages,
    badgeClassName: "bg-[#C4863B]/10 text-[#C4863B] border-[#C4863B]/15 dark:text-[#DDB06C]",
    iconClassName: "bg-gradient-to-br from-[#C4863B] to-[#D4A65B]",
    buttonClassName: "bg-[#C4863B] hover:bg-[#A8722F]",
    recommendedClassName: "ring-[#C4863B]/20 bg-[#C4863B]/[0.05]",
    insightClassName: "border-[#C4863B]/15 bg-[#C4863B]/[0.07]",
    insightAccentClassName: "bg-[#C4863B]/15 text-[#C4863B] dark:text-[#E8C27E]",
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

function getFavoriteType(item: ReviewItem): FavoriteType {
  switch (item.lessonType) {
    case "kanji":
      return "kanji";
    case "grammar":
      return "grammar";
    default:
      return "word";
  }
}

function FavoriteToggleButton({
  isFavorite,
  favoritePending,
  onToggleFavorite,
}: {
  isFavorite: boolean;
  favoritePending: boolean;
  onToggleFavorite?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      disabled={favoritePending}
      onClick={onToggleFavorite}
      className={joinClassNames(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
        isFavorite
          ? "border-accent/20 bg-accent/10 text-accent"
          : "border-border-subtle bg-surface-secondary text-content-tertiary hover:bg-surface-tertiary",
        favoritePending && "cursor-wait opacity-70",
      )}
    >
      <Heart className={joinClassNames("h-4 w-4", isFavorite && "fill-current")} />
    </button>
  );
}

function ReviewCard({
  item,
  recommended,
  starting,
  isFavorite,
  favoritePending,
  onStart,
  onToggleFavorite,
}: {
  item: ReviewItem;
  recommended: boolean;
  starting: boolean;
  isFavorite: boolean;
  favoritePending: boolean;
  onStart?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}) {
  const meta = reviewMeta[item.type];
  const Icon = meta.icon;
  const strategyHeadline = item.strategyLabel;

  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -2, boxShadow: "0 12px 28px -16px rgba(17,24,39,0.28)" }}
      className={joinClassNames(
        "relative min-h-[198px] rounded-[26px] border border-border-subtle bg-surface-primary p-4 shadow-sm transition-colors sm:p-5",
        recommended && "ring-1",
        recommended && meta.recommendedClassName,
      )}
    >
      <div className="absolute right-5 top-5 hidden lg:block">
        <FavoriteToggleButton
          isFavorite={isFavorite}
          favoritePending={favoritePending}
          onToggleFavorite={() => onToggleFavorite?.(item.id)}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
        <div className="flex min-w-0 flex-1 gap-3.5">
          <div
            className={joinClassNames(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md sm:h-14 sm:w-14",
              meta.iconClassName,
            )}
          >
            <Icon className="h-5 w-5 text-content-inverted" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col lg:pr-16">
            <div className="flex flex-wrap items-center gap-2">
              {isFavorite && <FavoriteBadge />}
              <TypeBadge type={item.type} />
            </div>

            <h3 className="mt-2 truncate text-base font-extrabold text-content-primary sm:text-lg">
              {item.title}
            </h3>

            <div
              className={joinClassNames(
                "mt-3 rounded-2xl border px-3 py-2.5",
                meta.insightClassName,
              )}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={joinClassNames(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                    meta.insightAccentClassName,
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-content-tertiary">
                    Kazu detectó
                  </p>
                  <p className="mt-1 text-sm font-bold leading-5 text-content-primary">
                    {strategyHeadline}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end lg:w-40 lg:flex-col lg:items-end lg:justify-end">
          <div className="lg:hidden">
            <FavoriteToggleButton
              isFavorite={isFavorite}
              favoritePending={favoritePending}
              onToggleFavorite={() => onToggleFavorite?.(item.id)}
            />
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={starting}
            onClick={() => onStart?.(item.id)}
            className={joinClassNames(
              "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-content-inverted shadow-md transition-all hover:shadow-lg sm:w-auto sm:min-w-[10rem] lg:w-[10rem]",
              meta.buttonClassName,
              starting && "cursor-wait opacity-75",
            )}
          >
            <Icon className={joinClassNames("h-4 w-4", starting && "animate-pulse")} />
            {starting ? "Abriendo" : item.actionLabel || meta.action}
          </motion.button>
        </div>
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

function FavoriteBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/15 bg-accent/10 px-2 py-0.5 text-xs font-extrabold text-accent">
      <Heart className="h-3.5 w-3.5 fill-current" />
      Favorito
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
  startingItemId,
  onStart,
}: ReviewListProps) {
  const { isFavorite, toggleFavorite, loading: favoritesLoading } = useFavorites();
  const [favoritePendingId, setFavoritePendingId] = useState<string | null>(null);

  const handleToggleFavorite = async (item: ReviewItem) => {
    if (favoritesLoading || favoritePendingId === item.id) {
      return;
    }

    setFavoritePendingId(item.id);

    try {
      await toggleFavorite(item.entityId, getFavoriteType(item));
    } finally {
      setFavoritePendingId(null);
    }
  };

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
            Repasos recomendados
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
            starting={startingItemId === item.id}
            isFavorite={isFavorite(item.entityId)}
            favoritePending={favoritePendingId === item.id}
            onStart={onStart}
            onToggleFavorite={() => {
              void handleToggleFavorite(item);
            }}
          />
        ))}
      </motion.div>
    </section>
  );
}
