"use client";

import { Search } from "lucide-react";
import {
  AdminFilterDropdown,
  type AdminFilterOption,
} from "@/features/admin/shared/components/AdminFilterDropdown";
import type {
  SupportPriorityFilter,
  SupportStatusFilter,
} from "../hooks/useAdminSupportTickets";

type StatusOption = {
  value: SupportStatusFilter;
  label: string;
};

const statusOptions: StatusOption[] = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abiertos" },
  { value: "review", label: "Por revisar" },
  { value: "pending", label: "Pendientes" },
  { value: "closed", label: "Cerrados" },
];

const priorityOptions: AdminFilterOption<SupportPriorityFilter>[] = [
  { value: "all", label: "Todos" },
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
];

interface AdminSupportFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: SupportStatusFilter;
  onStatusFilterChange: (value: SupportStatusFilter) => void;
  priorityFilter: SupportPriorityFilter;
  onPriorityFilterChange: (value: SupportPriorityFilter) => void;
}

export function AdminSupportFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}: AdminSupportFiltersProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-[#FCFCFC] px-3 transition-colors focus-within:border-[#993331]/40">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por id, usuario, asunto o asignado"
            className="h-full w-full bg-transparent text-sm leading-none text-gray-700 outline-none placeholder:text-gray-400"
          />
          </div>
        </div>

        <AdminFilterDropdown
          value={priorityFilter}
          options={priorityOptions}
          onChange={onPriorityFilterChange}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {statusOptions.map((option) => {
          const active = statusFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusFilterChange(option.value)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                active
                  ? "border-[#993331]/30 bg-[#993331] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#993331]/25 hover:text-[#993331]",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
