"use client";

import { useMemo, useState } from "react";
import { adminSupportTicketsMock } from "../utils/supportTicketMocks";
import type {
  AdminSupportTicket,
  AdminTicketPriority,
  AdminTicketStatus,
} from "../types/tickets";

export type SupportStatusFilter = "all" | AdminTicketStatus;
export type SupportPriorityFilter = "all" | AdminTicketPriority;

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function includesText(ticket: AdminSupportTicket, query: string) {
  const q = normalize(query);
  if (!q) return true;

  return (
    normalize(ticket.id).includes(q) ||
    normalize(ticket.requesterName).includes(q) ||
    normalize(ticket.subject).includes(q) ||
    normalize(ticket.assignee).includes(q)
  );
}

export function useAdminSupportTickets() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportStatusFilter>("all");
  const [priorityFilter, setPriorityFilter] =
    useState<SupportPriorityFilter>("all");

  const summary = useMemo(() => {
    const tickets = adminSupportTicketsMock;

    return {
      total: tickets.length,
      open: tickets.filter((x) => x.status === "open").length,
      review: tickets.filter((x) => x.status === "review").length,
      pending: tickets.filter((x) => x.status === "pending").length,
      closed: tickets.filter((x) => x.status === "closed").length,
      highPriority: tickets.filter((x) => x.priority === "high").length,
    };
  }, []);

  const filteredTickets = useMemo(() => {
    return adminSupportTicketsMock.filter((ticket) => {
      const matchStatus =
        statusFilter === "all" ? true : ticket.status === statusFilter;
      const matchPriority =
        priorityFilter === "all" ? true : ticket.priority === priorityFilter;
      const matchQuery = includesText(ticket, query);

      return matchStatus && matchPriority && matchQuery;
    });
  }, [priorityFilter, query, statusFilter]);

  return {
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    summary,
    filteredTickets,
    allTickets: adminSupportTicketsMock,
  };
}
