interface MetaInfoProps {
  duration?: string;
  itemCount?: number;
}

export function MetaInfo({ duration, itemCount }: MetaInfoProps) {
  if (!duration && !itemCount) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-content-tertiary">
      {duration && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-secondary px-2.5 py-1">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{duration}</span>
        </div>
      )}

      {itemCount !== undefined && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-secondary px-2.5 py-1">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>{itemCount} elementos</span>
        </div>
      )}
    </div>
  );
}
