import { apiFetch } from "@/shared/lib/api/client";
import type {
  SupportContactRequest,
  SupportTicketResponse,
} from "@/features/support/types";

/**
 * POST /api/users/support/tickets
 * Envía un ticket de soporte al backend.
 */
export async function createSupportTicket(
  data: SupportContactRequest,
): Promise<SupportTicketResponse> {
  return apiFetch<SupportTicketResponse>("/api/users/support/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
