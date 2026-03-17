"use client";

import { RefreshCw } from "lucide-react";

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";

interface ReviewHeaderProps {
  pendingCount: number;
}

export function ReviewHeader({ pendingCount }: ReviewHeaderProps) {
  return (
    <DashboardHeader
      icon={<RefreshCw className="w-7 h-7 text-white" strokeWidth={2.5} />}
      title="Repaso"
      japaneseText="復習"
      subtitle="Refuerza lo que has aprendido con repasos inteligentes"
      rightContent={
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">
            {pendingCount} lecciones pendientes
          </span>
          <div className="w-2 h-2 rounded-full bg-[#993331] animate-pulse" />
        </div>
      }
    />
  );
}
