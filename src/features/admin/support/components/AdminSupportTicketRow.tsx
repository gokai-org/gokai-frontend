"use client";

import type {
  AdminSupportTicket,
  AdminTicketPriority,
  AdminTicketStatus,
} from "../types/tickets";

const statusLabel: Record<AdminTicketStatus, string> = {
  open: "Abierto",
  review: "Por revisar",
  pending: "Pendiente",
  closed: "Cerrado",
};

const statusTone: Record<AdminTicketStatus, string> = {
  open: "bg-emerald-50 text-emerald-700",
  review: "bg-amber-50 text-amber-700",
  pending: "bg-blue-50 text-blue-700",
  closed: "bg-rose-50 text-rose-700",
};

const priorityLabel: Record<AdminTicketPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const priorityTone: Record<AdminTicketPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-indigo-50 text-indigo-700",
  high: "bg-[#993331]/10 text-[#993331]",
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
}

export function AdminSupportTicketRow({ ticket }: AdminSupportTicketRowProps) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-[#993331]/[0.03] transition-colors">
      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-700">
        {ticket.id}
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#993331]/10 text-xs font-bold text-[#993331]">
            {avatarLabel(ticket.requesterName)}
          </span>
          <span className="text-sm font-medium text-gray-700">{ticket.requesterName}</span>
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-600">
        <p className="line-clamp-1 max-w-[280px]">{ticket.subject}</p>
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            statusTone[ticket.status],
          ].join(" ")}
        >
          {statusLabel[ticket.status]}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            priorityTone[ticket.priority],
          ].join(" ")}
        >
          {priorityLabel[ticket.priority]}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {ticket.assignee}
      </td>

      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
        {ticket.createdAt}
      </td>
    </tr>
  );
}
