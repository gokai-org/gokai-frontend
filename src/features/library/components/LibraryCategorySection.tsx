"use client";

import { SkeletonCard } from "@/shared/ui/Skeleton";

interface LibraryCategorySectionProps {
  title: string;
  countLabel: string;
  loading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  children?: React.ReactNode;
}

export function LibraryCategorySection({
  title,
  countLabel,
  loading = false,
  emptyTitle,
  emptyDescription,
  children,
}: LibraryCategorySectionProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-600">{countLabel}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : children ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            {emptyTitle}
          </h3>
          <p className="max-w-md text-center text-gray-600">
            {emptyDescription}
          </p>
        </div>
      )}
    </div>
  );
}