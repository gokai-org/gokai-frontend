import { apiFetch } from "@/shared/lib/api/client";
import type {
  SupportContactRequest,
  SupportTicketResponse,
} from "@/features/support/types";

/**
 * POST /api/support/tickets
 * Envía un ticket de soporte al backend.
 */
export async function createSupportTicket(
  data: SupportContactRequest,
): Promise<SupportTicketResponse> {
  return apiFetch<SupportTicketResponse>("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
