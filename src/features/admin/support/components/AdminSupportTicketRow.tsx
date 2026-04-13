"use client";

import { memo } from "react";
import type {
  AdminSupportTicket,
  AdminTicketCategory,
  AdminTicketStatus,
} from "../types/tickets";

const statusLabel: Record<AdminTicketStatus, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

const statusTone: Record<AdminTicketStatus, string> = {
  open: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  in_progress:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
  resolved: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  closed: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
};

const categoryLabel: Record<AdminTicketCategory, string> = {
  technical_issue: "Problema tecnico",
  billing: "Facturacion",
  account_access: "Acceso de cuenta",
  bug_report: "Reporte de bug",
  feature_request: "Solicitud de mejora",
  other: "Otro",
};

const categoryTone: Record<AdminTicketCategory, string> = {
  technical_issue:
    "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  billing:
    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  account_access:
    "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400",
  bug_report: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
  feature_request:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
  other: "bg-slate-100 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400",
};

function avatarLabel(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

interface AdminSupportTicketRowProps {
  ticket: AdminSupportTicket;
  onViewTicket: (ticket: AdminSupportTicket) => void;
}

function AdminSupportTicketRowBase({
  ticket,
  onViewTicket,
}: AdminSupportTicketRowProps) {
  const normalizedStatus =
    ticket.status in statusLabel
      ? (ticket.status as AdminTicketStatus)
      : "in_progress";

  const normalizedCategory =
    ticket.category in categoryLabel
      ? (ticket.category as AdminTicketCategory)
      : "other";

  return (
    <tr className="border-b border-border-subtle align-top last:border-0 hover:bg-accent/[0.03] transition-colors">
      <td className="px-2.5 py-3 text-xs font-semibold text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        <p
          className="max-w-[120px] truncate sm:max-w-[140px]"
          title={ticket.id}
        >
          {ticket.id}
        </p>
      </td>

      <td className="px-2.5 py-3 sm:px-3 lg:px-4">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/10 text-[11px] font-bold text-accent sm:h-8 sm:w-8 sm:text-xs">
            {avatarLabel(ticket.name)}
          </span>
          <span
            className="line-clamp-2 min-w-0 break-words text-xs font-medium text-content-secondary sm:text-sm"
            title={ticket.name}
          >
            {ticket.name}
          </span>
        </div>
      </td>

      <td className="px-2.5 py-3 text-xs text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        <p
          className="line-clamp-2 break-all sm:break-words"
          title={ticket.email}
        >
          {ticket.email}
        </p>
      </td>

      <td className="px-2.5 py-3 text-xs text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        <p
          className="line-clamp-2 break-words"
          title={ticket.subject}
        >
          {ticket.subject}
        </p>
      </td>

      <td className="px-2.5 py-3 sm:px-3 lg:px-4">
        <span
          className={[
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
            categoryTone[normalizedCategory],
          ].join(" ")}
        >
          {categoryLabel[normalizedCategory]}
        </span>
      </td>

      <td className="px-2.5 py-3 sm:px-3 lg:px-4">
        <span
          className={[
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
            statusTone[normalizedStatus],
          ].join(" ")}
        >
          {statusLabel[normalizedStatus]}
        </span>
      </td>

      <td className="whitespace-nowrap px-2.5 py-3 text-xs text-content-tertiary sm:px-3 sm:text-sm lg:px-4">
        {ticket.createdAt}
      </td>

      <td className="whitespace-nowrap px-2.5 py-3 text-center sm:px-3 lg:px-4">
        <button
          type="button"
          onClick={() => onViewTicket(ticket)}
          className="inline-flex items-center justify-center rounded-lg border border-accent/25 bg-accent/5 px-2.5 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/10 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          Ver ticket
        </button>
      </td>
    </tr>
  );
}

export const AdminSupportTicketRow = memo(AdminSupportTicketRowBase);
