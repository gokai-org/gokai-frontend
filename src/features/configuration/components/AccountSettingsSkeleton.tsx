import { SkeletonBox, SkeletonLine } from "@/shared/ui/Skeleton";

export function AccountSettingsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* ── Profile hero skeleton ─────────────────────────── */}
      <div className="rounded-2xl border border-border-default bg-surface-elevated overflow-hidden shadow-sm">
        {/* Banner + avatar */}
        <div className="relative h-28 bg-surface-tertiary">
          <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-full bg-skeleton-base border-4 border-surface-elevated shadow-md" />
        </div>

        {/* Info row */}
        <div className="pt-14 pb-6 px-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <SkeletonLine width="w-40" height="h-5" />
            <SkeletonLine width="w-56" height="h-3.5" />
            <SkeletonLine width="w-36" height="h-3" />
          </div>
          <SkeletonBox className="h-9 w-28 rounded-lg" />
        </div>

        {/* Fields grid */}
        <div className="px-6 pb-6 border-t border-border-subtle pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonLine width="w-20" height="h-3" />
              <SkeletonBox className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Subscription skeleton ─────────────────────────── */}
      <div className="rounded-2xl border border-border-default bg-surface-elevated overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="space-y-2">
              <SkeletonLine width="w-28" height="h-3" />
              <SkeletonLine width="w-40" height="h-5" />
              <SkeletonLine width="w-64" height="h-3.5" />
            </div>
            <SkeletonBox className="h-8 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 bg-surface-secondary rounded-xl p-4 border border-border-subtle">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonLine width="w-20" height="h-3" />
                <SkeletonLine width="w-28" height="h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Security skeleton ─────────────────────────────── */}
      <div className="rounded-2xl border border-border-default bg-surface-elevated overflow-hidden shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-xl border border-border-subtle">
            <div className="space-y-1.5">
              <SkeletonLine width="w-24" height="h-4" />
              <SkeletonLine width="w-52" height="h-3" />
            </div>
            <SkeletonBox className="h-9 w-20 rounded-lg" />
          </div>
          <SkeletonBox className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
