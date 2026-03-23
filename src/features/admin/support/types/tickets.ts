export type AdminTicketStatus = "open" | "review" | "pending" | "closed";

export type AdminTicketPriority = "low" | "medium" | "high";

export interface AdminSupportTicket {
  id: string;
  requesterName: string;
  subject: string;
  status: AdminTicketStatus;
  priority: AdminTicketPriority;
  assignee: string;
  createdAt: string;
}
