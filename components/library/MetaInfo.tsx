interface MetaInfoProps {
  duration?: string;
  itemCount?: number;
}

export function MetaInfo({ duration, itemCount }: MetaInfoProps) {
  if (!duration && !itemCount) return null;

  return (
    <div className="flex items-center justify-between text-xs text-gray-500">
      {duration && (
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{duration}</span>
        </div>
      )}
      
      {itemCount && (
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{itemCount} items</span>
        </div>
      )}
    </div>
  );
}
