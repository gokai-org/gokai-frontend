"use client";

import { Archive, Filter, Search, X } from "lucide-react";
import { cls } from "@/features/notices/utils/noticeConfig";

interface NoticeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoticeSearchBar({ value, onChange }: NoticeSearchBarProps) {
  return (
    <div className="relative w-full max-w-md flex-1">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />

      <input
        type="text"
        placeholder="Buscar notificación..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border-default bg-surface-secondary py-2.5 pl-10 pr-9 text-sm outline-none transition-all duration-200 focus:border-accent/30 focus:bg-surface-primary"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted transition-colors hover:text-content-secondary"
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
            ? "border-accent/20 bg-accent/10 text-accent"
            : "border-border-default bg-surface-secondary text-content-tertiary hover:border-border-default",
        )}
      >
        <Filter className="h-4 w-4" />
        Solo sin leer
      </button>

      {hasReadNotices && (
        <button
          onClick={onClearRead}
          className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-secondary px-4 py-2.5 text-xs font-bold text-content-tertiary transition-all duration-200 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400"
        >
          <Archive className="h-4 w-4" />
          Limpiar leídas
        </button>
      )}
    </div>
  );
}
