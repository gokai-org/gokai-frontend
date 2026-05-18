"use client";

import { RecentCard } from "@/features/library/components/RecentCard";
import { recentToCardProps } from "@/features/library/utils/libraryMappers";
import type { BackendRecentItem } from "@/features/library/types";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import { PrimaryActionButton } from "@/shared/ui/PrimaryActionButton";
import { SkeletonRecentCard } from "@/shared/ui/Skeleton";

interface LibraryRecentPanelProps {
  recentItems: BackendRecentItem[];
  kanjis: Kanji[];
  hiraganas: Kana[];
  katakanas: Kana[];
  loading?: boolean;
  onOpenRecent: () => void;
  onKanjiClick: (kanji: Kanji) => void;
  onKanaClick: (kana: Kana) => void;
  onGrammarClick: (lessonId: string) => void;
  onWordClick: (wordId: string) => void;
}

export function LibraryRecentPanel({
  recentItems,
  kanjis,
  hiraganas,
  katakanas,
  loading = false,
  onOpenRecent,
  onKanjiClick,
  onKanaClick,
  onGrammarClick,
  onWordClick,
}: LibraryRecentPanelProps) {
  return (
    <aside className="order-1 xl:order-2 xl:sticky xl:top-6 xl:self-start">
      <div className="rounded-3xl border border-border-subtle bg-surface-primary p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6 text-accent"
            >
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-content-primary">
                  Reciente
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-content-tertiary">
                  Continúa con el contenido que has explorado recientemente.
                </p>
              </div>

              {recentItems.length > 0 && (
                <span className="shrink-0 rounded-full bg-accent/8 px-3 py-1 text-xs font-semibold text-accent">
                  {recentItems.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonRecentCard key={index} />
              ))}
            </div>

            <div className="mt-5 h-11 w-full animate-pulse rounded-2xl bg-surface-tertiary" />
          </>
        ) : recentItems.length > 0 ? (
          <>
            <div className="space-y-3">
              {recentItems.slice(0, 4).map((item, i) => (
                <RecentCard
                  key={item.id}
                  item={recentToCardProps(item, kanjis, hiraganas, katakanas)}
                  index={i}
                  onClick={() => {
                    if (item.type === "kanji") {
                      const kanji = kanjis.find((k) => k.id === item.id);
                      if (kanji) onKanjiClick(kanji);
                      return;
                    }

                    if (item.type === "hiragana") {
                      const kana = hiraganas.find((entry) => entry.id === item.id);
                      if (kana) onKanaClick(kana);
                      return;
                    }

                    if (item.type === "katakana") {
                      const kana = katakanas.find((entry) => entry.id === item.id);
                      if (kana) onKanaClick(kana);
                      return;
                    }

                    if (item.type === "grammar" || item.type === "grammar_lesson") {
                      onGrammarClick(item.id);
                      return;
                    }

                    if (item.type === "word") {
                      onWordClick(item.id);
                    }
                  }}
                />
              ))}
            </div>

            <div className="mt-5">
              <PrimaryActionButton onClick={onOpenRecent} fullWidth>
                Ver todo
              </PrimaryActionButton>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-default bg-surface-secondary p-5 text-center">
            <h4 className="mb-1 text-sm font-bold text-content-primary">
              Aún no hay actividad
            </h4>
            <p className="text-sm leading-relaxed text-content-tertiary">
              El contenido que abras en librería aparecerá aquí para retomarlo
              más rápido.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
