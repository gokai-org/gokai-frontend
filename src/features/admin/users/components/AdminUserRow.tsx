"use client";

import { memo } from "react";
import type { AdminUser } from "../types/users";

interface AdminUserRowProps {
  user: AdminUser;
  onViewUser: (user: AdminUser) => void;
}

function AdminUserRowBase({ user, onViewUser }: AdminUserRowProps) {
  const initials =
    (user.firstName?.[0] ?? "").toUpperCase() +
    (user.lastName?.[0] ?? "").toUpperCase();

  return (
    <tr className="border-b border-border-subtle last:border-0 hover:bg-accent/[0.03] transition-colors">
      <td className="px-2.5 py-2.5 text-xs font-semibold text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        <p
          className="max-w-[120px] truncate sm:max-w-[140px]"
          title={user.id}
        >
          {user.id.slice(0, 8)}...
        </p>
      </td>

      <td className="px-2.5 py-2.5 sm:px-3 lg:px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
            {initials || "?"}
          </span>
          <span className="text-xs font-semibold text-content-primary sm:text-sm">
            {user.firstName} {user.lastName}
          </span>
        </div>
      </td>

      <td className="px-2.5 py-2.5 text-xs text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        <p
          className="line-clamp-1 max-w-[200px] sm:max-w-[260px]"
          title={user.email}
        >
          {user.email}
        </p>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 sm:px-3 lg:px-4">
        <span className="inline-flex rounded-full bg-surface-tertiary px-2 py-0.5 text-[11px] font-semibold text-content-secondary sm:px-2.5 sm:py-1 sm:text-xs">
          {user.profile}
        </span>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        {user.points}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 sm:px-3 lg:px-4">
        <span
          className={[
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
            user.subscribed
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
          ].join(" ")}
        >
          {user.subscribed ? "Suscrito" : "Gratis"}
        </span>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-content-tertiary sm:px-3 sm:text-sm lg:px-4">
        {user.createdAt}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-center sm:px-3 lg:px-4">
        <button
          type="button"
          onClick={() => onViewUser(user)}
          className="inline-flex items-center justify-center rounded-lg border border-accent/25 bg-accent/5 px-2.5 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/10 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          Ver usuario
        </button>
      </td>
    </tr>
  );
}

export const AdminUserRow = memo(AdminUserRowBase);
