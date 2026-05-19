"use client";

import { Languages } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";

interface AdminKanjiHeaderProps {
  totalKanjis: number;
}

export function AdminKanjiHeader({ totalKanjis }: AdminKanjiHeaderProps) {
  return (
    <AdminPageHeader
      icon={<Languages className="h-7 w-7 text-content-inverted" strokeWidth={2.5} />}
      title="Kanjis"
      japaneseText="漢字"
      subtitle="CRUD administrativo para simbolos, lecturas, significados y trazos"
      rightContent={
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-tertiary">
            {totalKanjis} kanjis cargados
          </span>
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        </div>
      }
    />
  );
}