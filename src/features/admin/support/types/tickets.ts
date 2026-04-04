export type AdminTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type AdminTicketCategory =
  | "technical_issue"
  | "billing"
  | "account_access"
  | "bug_report"
  | "feature_request"
  | "other";

export interface BackendSupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  note?: string | null;
  created_at: string;
}

export type BackendSupportTicketsGrouped = Record<
  string,
  BackendSupportTicket[]
>;

export interface UpdateSupportTicketStatusRequest {
  status: AdminTicketStatus;
  note?: string | null;
}

export interface AdminSupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: AdminTicketCategory | string;
  message: string;
  status: AdminTicketStatus | string;
  note?: string | null;
  createdAt: string;
}
