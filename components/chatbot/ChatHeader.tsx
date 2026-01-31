'use client';

import { DashboardHeader } from '@/components/layout/DashboardHeader';

export function ChatHeader() {
  return (
    <DashboardHeader
      icon={
        <svg
          className="w-7 h-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L3 6v4c0 1.5.5 3 1.5 4.5L12 22l7.5-7.5C20.5 13 21 11.5 21 10V6l-9-4z" />
          <path d="M12 2v6M8 8l4-2 4 2M6 10l6 4 6-4" opacity="0.7" />
        </svg>
      }
      title="Sensei AI"
      subtitle="Tu asistente de japonés"
      japaneseText="先生"
      statusBadge={
        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          En línea
        </span>
      }
    />
  );
}
