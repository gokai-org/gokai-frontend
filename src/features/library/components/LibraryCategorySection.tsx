"use client";

import { LibraryCardsSkeletonGrid } from "@/shared/ui/Skeleton";

interface LibraryCategorySectionProps {
  title: string;
  countLabel: string;
  loading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  children?: React.ReactNode;
  skeletonCards?: number;
  skeletonGridClassName?: string;
  skeletonCardClassName?: string;
  skeletonVariant?: "default" | "script" | "vocabulary" | "word" | "grammar";
}

export function LibraryCategorySection({
  title,
  countLabel,
  loading = false,
  emptyTitle,
  emptyDescription,
  children,
  skeletonCards = 12,
  skeletonGridClassName,
  skeletonCardClassName,
  skeletonVariant = "default",
}: LibraryCategorySectionProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-content-primary">{title}</h2>
        <span className="text-sm text-content-secondary">{countLabel}</span>
      </div>

      {loading ? (
        <LibraryCardsSkeletonGrid
          cards={skeletonCards}
          className={skeletonGridClassName}
          cardClassName={skeletonCardClassName}
          variant={skeletonVariant}
        />
      ) : children ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <h3 className="mb-2 text-xl font-bold text-content-primary">
            {emptyTitle}
          </h3>
          <p className="max-w-md text-center text-content-secondary">
            {emptyDescription}
          </p>
        </div>
      )}
    </div>
  );
}
