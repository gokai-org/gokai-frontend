'use client';

import { LibraryItem } from '@/types/library';
import { Thumbnail } from './Thumbnail';
import { LevelBadge } from './LevelBadge';
import { MetaInfo } from './MetaInfo';
import { ProgressBar } from './ProgressBar';

export interface ContentItemProps {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  level: string;
  progress?: number;
  duration?: string;
  itemCount?: number;
  category?: string;
  isMock?: boolean;
}

interface LibraryCardProps {
  item: LibraryItem | ContentItemProps;
  onClick?: () => void;
}

export function LibraryCard({ item, onClick }: LibraryCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#993331] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative">
        <Thumbnail content={item.thumbnail} size="large" />
      </div>

      <div className="p-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#993331] transition-colors">
            {item.title}
          </h3>
          {item.level && <LevelBadge level={item.level as any} />}
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
          {item.description}
        </p>

        <MetaInfo duration={item.duration} itemCount={item.itemCount} />

        <div className="mt-auto pt-2 min-h-[22px]">
          {item.progress !== undefined && (
            <ProgressBar progress={item.progress} />
          )}
        </div>
      </div>
    </div>
  );
}
