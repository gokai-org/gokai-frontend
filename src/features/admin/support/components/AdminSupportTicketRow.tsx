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
  open: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-blue-50 text-blue-700",
  closed: "bg-rose-50 text-rose-700",
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
  technical_issue: "bg-blue-50 text-blue-700",
  billing: "bg-emerald-50 text-emerald-700",
  account_access: "bg-violet-50 text-violet-700",
  bug_report: "bg-rose-50 text-rose-700",
  feature_request: "bg-amber-50 text-amber-700",
  other: "bg-slate-100 text-slate-600",
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
    <tr className="border-b border-gray-100 last:border-0 hover:bg-[#993331]/[0.03] transition-colors">
      <td className="px-2.5 py-2.5 text-xs font-semibold text-gray-700 sm:px-3 sm:text-sm lg:px-4">
        <p className="max-w-[120px] truncate sm:max-w-[140px]" title={ticket.id}>
          {ticket.id}
        </p>
      </td>

      <td className="px-2.5 py-2.5 sm:px-3 lg:px-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#993331]/10 text-[11px] font-bold text-[#993331] sm:h-8 sm:w-8 sm:text-xs">
            {avatarLabel(ticket.name)}
          </span>
          <span className="max-w-[130px] truncate text-xs font-medium text-gray-700 sm:max-w-[180px] sm:text-sm" title={ticket.name}>
            {ticket.name}
          </span>
        </div>
      </td>

      <td className="px-2.5 py-2.5 text-xs text-gray-600 sm:px-3 sm:text-sm lg:px-4">
        <p className="max-w-[130px] truncate sm:max-w-[180px] lg:max-w-[220px]" title={ticket.email}>
          {ticket.email}
        </p>
      </td>

      <td className="px-2.5 py-2.5 text-xs text-gray-600 sm:px-3 sm:text-sm lg:px-4">
        <p className="line-clamp-1 max-w-[150px] sm:max-w-[210px] lg:max-w-[260px]" title={ticket.subject}>
          {ticket.subject}
        </p>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 sm:px-3 lg:px-4">
        <span
          className={[
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
            categoryTone[normalizedCategory],
          ].join(" ")}
        >
          {categoryLabel[normalizedCategory]}
        </span>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 sm:px-3 lg:px-4">
        <span
          className={[
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
            statusTone[normalizedStatus],
          ].join(" ")}
        >
          {statusLabel[normalizedStatus]}
        </span>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-gray-500 sm:px-3 sm:text-sm lg:px-4">
        {ticket.createdAt}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-center sm:px-3 lg:px-4">
        <button
          type="button"
          onClick={() => onViewTicket(ticket)}
          className="inline-flex items-center justify-center rounded-lg border border-[#993331]/25 bg-[#993331]/5 px-2.5 py-1 text-[11px] font-semibold text-[#993331] transition-colors hover:bg-[#993331]/10 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          Ver ticket
        </button>
      </td>
    </tr>
  );
}

export const AdminSupportTicketRow = memo(AdminSupportTicketRowBase);
