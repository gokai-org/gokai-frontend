"use client";

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";

export function ChatHeader() {
  return (
    <DashboardHeader
      icon={
        <svg
          className="h-7 w-7 text-content-inverted"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2 3 6v4c0 1.5.5 3 1.5 4.5L12 22l7.5-7.5C20.5 13 21 11.5 21 10V6l-9-4Z" />
          <path
            d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
            opacity="0.75"
          />
          <path
            d="M8.5 15.25c.8-.95 2.1-1.5 3.5-1.5s2.7.55 3.5 1.5"
            opacity="0.75"
          />
        </svg>
      }
      title="Sensei AI"
      subtitle="Practica vocabulario, frases y repaso conversacional"
      japaneseText="先生"
      statusBadge={
        <span className="hidden items-center gap-2 rounded-full bg-green-50 dark:bg-green-950/30 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Modo demo
        </span>
      }
    />
  );
}
