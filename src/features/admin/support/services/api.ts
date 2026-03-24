import { apiFetch } from "@/shared/lib/api/client";
import type {
  BackendSupportTicket,
  BackendSupportTicketsGrouped,
  UpdateSupportTicketStatusRequest,
} from "../types/tickets";

export async function getAdminSupportTickets(): Promise<BackendSupportTicketsGrouped> {
  return apiFetch<BackendSupportTicketsGrouped>("/admin/api/support/tickets", {
    method: "GET",
  });
}

export async function updateAdminSupportTicketStatus(
  id: string,
  payload: UpdateSupportTicketStatusRequest,
): Promise<BackendSupportTicket> {
  return apiFetch<BackendSupportTicket>(`/admin/api/support/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function saveAdminSupportTicketReply(
  id: string,
  payload: UpdateSupportTicketStatusRequest,
): Promise<BackendSupportTicket> {
  return updateAdminSupportTicketStatus(id, payload);
}
