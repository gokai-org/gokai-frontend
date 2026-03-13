"use client";

import { motion } from "framer-motion";
import { Search, Filter, Archive, X } from "lucide-react";
import type { NoticeCategory } from "../types";
import { categoryConfig, cls } from "../lib/constants";

/* ── tipos ── */
export type FilterKey = "all" | NoticeCategory;

export const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "lesson", label: "Lecciones" },
  { key: "review", label: "Revisiones" },
  { key: "achievement", label: "Logros" },
  { key: "streak", label: "Racha" },
  { key: "system", label: "Sistema" },
];

/* ── SearchBar ── */
interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function NoticeSearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar notificación..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-9 py-2.5 bg-gray-50 rounded-xl text-sm outline-none border border-gray-200 focus:border-[#993331]/30 focus:bg-white transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ── Toolbar: toggle unread + clear ── */
interface ToolbarProps {
  showUnreadOnly: boolean;
  onToggleUnread: () => void;
  hasReadNotices: boolean;
  onClearRead: () => void;
}

export function NoticeToolbar({
  showUnreadOnly,
  onToggleUnread,
  hasReadNotices,
  onClearRead,
}: ToolbarProps) {
  return (
    <>
      <button
        onClick={onToggleUnread}
        className={cls(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200",
          showUnreadOnly
            ? "bg-[#993331]/10 text-[#993331] border-[#993331]/20"
            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300",
        )}
      >
        <Filter className="w-4 h-4" />
        Solo sin leer
      </button>

      {hasReadNotices && (
        <button
          onClick={onClearRead}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <Archive className="w-4 h-4" />
          Limpiar leídas
        </button>
      )}
    </>
  );
}

/* ── Category Pills ── */
interface CategoryPillsProps {
  activeFilter: FilterKey;
  onSelect: (key: FilterKey) => void;
  counts: Record<string, number>;
}

export function NoticeCategoryPills({
  activeFilter,
  onSelect,
  counts,
}: CategoryPillsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {filterOptions.map((opt) => {
        const count = counts[opt.key] || 0;
        const active = activeFilter === opt.key;
        const cfg =
          opt.key !== "all" ? categoryConfig[opt.key as NoticeCategory] : null;

        return (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={cls(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap",
              active
                ? "bg-[#993331] text-white shadow-sm shadow-[#993331]/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {cfg && <cfg.icon className="w-3.5 h-3.5" />}
            {opt.label}
            <span
              className={cls(
                "text-[10px] px-1.5 py-0.5 rounded-full ml-0.5",
                active ? "bg-white/20" : "bg-gray-200 text-gray-500",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
