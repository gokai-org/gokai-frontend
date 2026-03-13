"use client";

import { useState, useCallback } from "react";
import type {
  SupportContactRequest,
  SupportTicketResponse,
  SupportCategory,
} from "@/features/support/types";
import { createSupportTicket } from "@/features/support/services/api";

/* ── Estado del formulario ─────────────────────────────── */

export interface SupportFormState {
  name: string;
  email: string;
  subject: string;
  category: SupportCategory;
  message: string;
}

const INITIAL_STATE: SupportFormState = {
  name: "",
  email: "",
  subject: "",
  category: "other",
  message: "",
};

/* ── Validación ────────────────────────────────────────── */

export interface SupportFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  category?: string;
  message?: string;
}

function validate(form: SupportFormState): SupportFormErrors {
  const errors: SupportFormErrors = {};

  if (!form.name.trim()) errors.name = "El nombre es obligatorio";
  if (!form.email.trim()) errors.email = "El email es obligatorio";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Formato de email inválido";
  }
  if (!form.subject.trim()) errors.subject = "El asunto es obligatorio";
  if (!form.message.trim()) errors.message = "El mensaje es obligatorio";
  else if (form.message.trim().length < 10) {
    errors.message = "El mensaje debe tener al menos 10 caracteres";
  }

  return errors;
}

/* ── Hook ──────────────────────────────────────────────── */

interface UseSupportFormOptions {
  /** Valores iniciales parciales (ej. pre-rellenar name/email del usuario logueado) */
  defaults?: Partial<SupportFormState>;
  /** Callback tras envío exitoso */
  onSuccess?: (ticket: SupportTicketResponse) => void;
  /** Callback tras error */
  onError?: (message: string) => void;
}

export interface UseSupportFormReturn {
  form: SupportFormState;
  errors: SupportFormErrors;
  submitError: string | null;
  submitting: boolean;
  submitted: boolean;
  ticketId: string | null;
  setField: <K extends keyof SupportFormState>(
    key: K,
    value: SupportFormState[K],
  ) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useSupportForm(
  opts: UseSupportFormOptions = {},
): UseSupportFormReturn {
  const initial: SupportFormState = { ...INITIAL_STATE, ...opts.defaults };

  const [form, setForm] = useState<SupportFormState>(initial);
  const [errors, setErrors] = useState<SupportFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof SupportFormState>(key: K, value: SupportFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setSubmitError((prev) => (prev ? null : prev));
      // Limpiar error del campo al escribir
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const submit = useCallback(async () => {
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      const payload: SupportContactRequest = {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        category: form.category,
        message: form.message.trim(),
      };

      const ticket = await createSupportTicket(payload);
      setTicketId(ticket.id);
      setSubmitted(true);
      opts.onSuccess?.(ticket);
    } catch (err) {
      const message = extractErrorMessage(err);
      setSubmitError(message);
      opts.onError?.(message);
    } finally {
      setSubmitting(false);
    }
  }, [form, opts]);

  const reset = useCallback(() => {
    setForm(initial);
    setErrors({});
    setSubmitError(null);
    setSubmitting(false);
    setSubmitted(false);
    setTicketId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    form,
    errors,
    submitError,
    submitting,
    submitted,
    ticketId,
    setField,
    submit,
    reset,
  };
}

function extractErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Error al enviar el ticket";

  const raw = err.message || "";
  const jsonPart = raw.startsWith("HTTP")
    ? raw.split(": ").slice(1).join(": ")
    : "";

  if (jsonPart) {
    try {
      const parsed = JSON.parse(jsonPart) as { error?: string };
      if (parsed.error) return parsed.error;
    } catch {
      // ignore parse error and fallback to raw message
    }
  }

  return raw || "Error al enviar el ticket";
}
