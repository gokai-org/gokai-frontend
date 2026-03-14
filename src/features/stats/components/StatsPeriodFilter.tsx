"use client";

import type { StatsPeriod } from "@/features/stats/types";

interface StatsPeriodFilterProps {
  period: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
}

export function StatsPeriodFilter({
  period,
  onChange,
}: StatsPeriodFilterProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
      {(["week", "month", "all"] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            period === p
              ? "bg-[#993331] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {p === "week" ? "Semana" : p === "month" ? "Mes" : "Todo"}
        </button>
      ))}
    </div>
  );
}