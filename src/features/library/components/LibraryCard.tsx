"use client";

import { LibraryItem } from "@/features/library/types";
import { Thumbnail } from "./Thumbnail";
import { MetaInfo } from "./MetaInfo";
import { ProgressBar } from "./ProgressBar";

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
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white text-left",
        "shadow-[0_2px_14px_-6px_rgba(0,0,0,0.06)] transition-all duration-300",
        "hover:-translate-y-1 hover:border-[#993331]/15 hover:shadow-[0_16px_32px_-10px_rgba(0,0,0,0.10)]",
        "focus:outline-none focus:ring-2 focus:ring-[#993331]/20",
      ].join(" ")}
    >
      <div className="p-4 pb-0">
        <Thumbnail content={item.thumbnail} size="large" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[16px] font-extrabold leading-snug text-gray-900 transition-colors group-hover:text-[#993331]">
            {item.title}
          </h3>
        </div>

        {item.description ? (
          <p className="mb-3 line-clamp-2 text-[13px] font-medium text-gray-500">
            {item.description}
          </p>
        ) : (
          <div className="mb-3 min-h-[40px]" />
        )}

        <MetaInfo duration={item.duration} itemCount={item.itemCount} />

        <div className="mt-auto pt-4">
          {item.progress !== undefined && (
            <ProgressBar progress={item.progress} />
          )}
        </div>
      </div>
    </button>
  );
}