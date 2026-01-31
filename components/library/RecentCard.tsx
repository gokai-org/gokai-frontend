'use client';

import { LibraryItem } from '@/types/library';
import { Thumbnail } from './Thumbnail';
import { ProgressBar } from './ProgressBar';

interface RecentCardProps {
  item: LibraryItem;
  onClick?: () => void;
}

export function RecentCard({ item, onClick }: RecentCardProps) {
  return (
    <div
      onClick={onClick}
      className="group flex gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-[#993331] hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      <Thumbnail content={item.thumbnail} size="small" className="shrink-0" />

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-[#993331] transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
          {item.description}
        </p>
        
        {item.progress !== undefined && <ProgressBar progress={item.progress} />}
      </div>
    </div>
  );
}
