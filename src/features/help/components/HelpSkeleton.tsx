"use client";

export function HelpSkeleton() {
  return (
    <div className="space-y-8 pb-12">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-accent to-accent-hover p-6 shadow-lg sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-4">
            <div className="h-3 w-40 animate-pulse rounded bg-surface-primary/20" />
            <div className="h-10 w-72 animate-pulse rounded bg-surface-primary/20" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-surface-primary/15" />
            <div className="mt-6 h-12 w-full max-w-xl animate-pulse rounded-2xl bg-surface-primary/15" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="h-24 w-24 animate-pulse rounded-2xl bg-surface-primary/15" />
            <div className="h-24 w-24 animate-pulse rounded-2xl bg-surface-primary/15" />
            <div className="h-24 w-24 animate-pulse rounded-2xl bg-surface-primary/15" />
          </div>
        </div>
      </div>

      <div className="h-12 w-80 animate-pulse rounded-full bg-surface-tertiary" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border-subtle bg-surface-primary p-6 shadow-sm"
          >
            <div className="mb-4 h-12 w-12 animate-pulse rounded-2xl bg-surface-tertiary" />
            <div className="mb-2 h-4 w-40 animate-pulse rounded bg-surface-tertiary" />
            <div className="h-3 w-full animate-pulse rounded bg-surface-tertiary" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-surface-tertiary" />
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border-subtle bg-surface-primary p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-surface-tertiary" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-60 animate-pulse rounded bg-surface-tertiary" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-tertiary" />
          </div>
          <div className="h-12 w-48 animate-pulse rounded-full bg-surface-tertiary" />
        </div>
      </div>
    </div>
  );
}