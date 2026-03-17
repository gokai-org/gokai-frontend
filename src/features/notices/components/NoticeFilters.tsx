"use client";

import { Archive, Filter, Search, X } from "lucide-react";
import { cls } from "@/features/notices/utils/noticeConfig";

interface NoticeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoticeSearchBar({
  value,
  onChange,
}: NoticeSearchBarProps) {
  return (
    <div className="relative w-full max-w-md flex-1">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        placeholder="Buscar notificación..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-9 text-sm outline-none transition-all duration-200 focus:border-[#993331]/30 focus:bg-white"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface NoticeToolbarProps {
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
}: NoticeToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onToggleUnread}
        className={cls(
          "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all duration-200",
          showUnreadOnly
            ? "border-[#993331]/20 bg-[#993331]/10 text-[#993331]"
            : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300",
        )}
      >
        <Filter className="h-4 w-4" />
        Solo sin leer
      </button>

      {hasReadNotices && (
        <button
          onClick={onClearRead}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-500 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        >
          <Archive className="h-4 w-4" />
          Limpiar leídas
        </button>
      )}
    </div>
  );
}