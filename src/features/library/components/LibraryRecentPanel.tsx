"use client";

import { RecentCard } from "@/features/library/components/RecentCard";
import { recentToCardProps } from "@/features/library/utils/libraryMappers";
import type { BackendRecentItem } from "@/features/library/types";
import type { Kanji } from "@/features/kanji/types";
import { PrimaryActionButton } from "@/shared/ui/PrimaryActionButton";
import { SkeletonRecentCard } from "@/shared/ui/Skeleton";

interface LibraryRecentPanelProps {
  recentItems: BackendRecentItem[];
  kanjis: Kanji[];
  loading?: boolean;
  onOpenRecent: () => void;
  onKanjiClick: (kanji: Kanji) => void;
}

export function LibraryRecentPanel({
  recentItems,
  kanjis,
  loading = false,
  onOpenRecent,
  onKanjiClick,
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
                  item={recentToCardProps(item, kanjis)}
                  index={i}
                  onClick={() => {
                    if (item.type === "kanji") {
                      const kanji = kanjis.find((k) => k.id === item.id);
                      if (kanji) onKanjiClick(kanji);
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
              Los kanjis, hiraganas y katakanas que abras aparecerán aquí para
              retomarlos más rápido.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
