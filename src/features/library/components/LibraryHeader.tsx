"use client";

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";

interface LibraryHeaderProps {
  onSearchChange?: (value: string) => void;
}

export function LibraryHeader({ onSearchChange }: LibraryHeaderProps) {
  return (
    <DashboardHeader
      icon={
        <svg
          className="h-7 w-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 19V6h8v13H3zm18 0h-8V6h8v13zm-7-9.5h6V11h-6zm0 2.5h6v1.5h-6zm0 2.5h6V16h-6zM5 9.5h6V11H5zm0 2.5h6v1.5H5zm0 2.5h6V16H5z" />
        </svg>
      }
      title="Biblioteca"
      subtitle="Explora kanjis, hiraganas y katakanas en un solo lugar"
      japaneseText="図書館"
      showSearch
      searchPlaceholder="Buscar kanjis, hiraganas o katakanas..."
      onSearchChange={onSearchChange}
    />
  );
}