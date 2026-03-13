/* ── Categorías de soporte ──────────────────────────────── */

export type SupportCategory =
  | "technical_issue"
  | "billing"
  | "account_access"
  | "bug_report"
  | "feature_request"
  | "other";

/** Etiquetas legibles para el usuario */
export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  technical_issue: "Problema técnico",
  billing: "Facturación",
  account_access: "Acceso a la cuenta",
  bug_report: "Reporte de error",
  feature_request: "Solicitud de función",
  other: "Otro",
};

/* ── Request: lo que envía el usuario ──────────────────── */

export interface SupportContactRequest {
  name: string;
  email: string;
  subject: string;
  category: SupportCategory;
  message: string;
}

/* ── Response: lo que devuelve el backend ──────────────── */

/**
 * El backend crea un ticket y devuelve su ID + estado inicial.
 * El ticket se gestiona luego desde el panel de admin, y las
 * respuestas llegan al email del usuario como hilo de Gmail.
 */
export interface SupportTicketResponse {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  category?: string;
  message?: string;
  status: string;
  note?: string | null;
  created_at: string;
}

/* ── Error estándar ────────────────────────────────────── */

export interface SupportErrorResponse {
  error: string;
}
