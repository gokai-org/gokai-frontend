"use client";

import { BookOpenCheck } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";

interface AdminLessonsHeaderProps {
  totalLessons: number;
}

export function AdminLessonsHeader({ totalLessons }: AdminLessonsHeaderProps) {
  return (
    <AdminPageHeader
      icon={<BookOpenCheck className="h-7 w-7 text-content-inverted" strokeWidth={2.5} />}
      title="Gramática"
      japaneseText="文法"
      subtitle="Edición de lecciones gramaticales con sus bloques y exámenes"
      rightContent={
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-tertiary">
            {totalLessons} lecciones activas
          </span>
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        </div>
      }
    />
  );
}