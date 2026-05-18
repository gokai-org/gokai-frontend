"use client";

import { BookMarked } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";

interface AdminVocabularyHeaderProps {
  totalThemes: number;
}

export function AdminVocabularyHeader({ totalThemes }: AdminVocabularyHeaderProps) {
  return (
    <AdminPageHeader
      icon={
        <BookMarked
          className="h-7 w-7 text-content-inverted"
          strokeWidth={2.5}
        />
      }
      title="Vocabulario"
      japaneseText="語彙"
      subtitle="Gestion jerarquica de temas, subtemas y palabras"
      rightContent={
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-tertiary">
            {totalThemes} temas totales
          </span>
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        </div>
      }
    />
  );
}