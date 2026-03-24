import type {
  AdminSupportTicket,
  AdminTicketCategory,
  AdminTicketStatus,
  BackendSupportTicket,
  BackendSupportTicketsGrouped,
} from "../types/tickets";

const knownStatuses = new Set<AdminTicketStatus>([
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

const knownCategories = new Set<AdminTicketCategory>([
  "technical_issue",
  "billing",
  "account_access",
  "bug_report",
  "feature_request",
  "other",
]);

function normalizeStatus(status: string): AdminTicketStatus | string {
  const s = status.trim().toLowerCase();

  if (s === "review" || s === "pending") {
    return "in_progress";
  }

  return knownStatuses.has(s as AdminTicketStatus)
    ? (s as AdminTicketStatus)
    : status;
}

function normalizeCategory(category: string): AdminTicketCategory | string {
  const c = category.trim().toLowerCase();
  return knownCategories.has(c as AdminTicketCategory)
    ? (c as AdminTicketCategory)
    : category;
}

export function formatTicketDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;

  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function mapBackendTicketToAdminTicket(
  ticket: BackendSupportTicket,
): AdminSupportTicket {
  return {
    id: ticket.id,
    name: ticket.name,
    email: ticket.email,
    subject: ticket.subject,
    category: normalizeCategory(ticket.category),
    message: ticket.message,
    status: normalizeStatus(ticket.status),
    note: ticket.note,
    createdAt: formatTicketDate(ticket.created_at),
  };
}

export function flattenGroupedSupportTickets(
  grouped: BackendSupportTicketsGrouped,
): BackendSupportTicket[] {
  const allTickets = Object.values(grouped).flat();

  return allTickets.sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return db - da;
  });
}
