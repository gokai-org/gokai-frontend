"use client";

import { SkeletonBox } from "@/shared/ui/Skeleton";

export default function GrammarListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-border-primary/40 bg-surface-elevated p-4 sm:p-5"
        >
          <SkeletonBox className="h-11 w-11 shrink-0" rounded="rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-3/4" rounded="rounded" />
            <SkeletonBox className="h-3 w-1/4" rounded="rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
