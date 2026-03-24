"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Loader2,
  Mail,
  MessageSquareText,
  Tag,
  User,
  X,
} from "lucide-react";
import {
  AdminFilterDropdown,
  type AdminFilterOption,
} from "@/features/admin/shared/components/AdminFilterDropdown";
import type {
  AdminSupportTicket,
  AdminTicketCategory,
  AdminTicketStatus,
} from "../types/tickets";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATUS_LABEL: Record<AdminTicketStatus, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

const CATEGORY_LABEL: Record<AdminTicketCategory, string> = {
  technical_issue: "Problema tecnico",
  billing: "Facturacion",
  account_access: "Acceso de cuenta",
  bug_report: "Reporte de bug",
  feature_request: "Solicitud de mejora",
  other: "Otro",
};

const STATUS_OPTIONS: AdminFilterOption<AdminTicketStatus>[] = [
  { value: "open", label: "Abierto" },
  { value: "in_progress", label: "En progreso" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
];

function normalizeStatus(status: string): AdminTicketStatus {
  if (status === "open") return "open";
  if (status === "resolved") return "resolved";
  if (status === "closed") return "closed";
  return "in_progress";
}

function normalizeCategory(category: string): AdminTicketCategory {
  if (category === "technical_issue") return "technical_issue";
  if (category === "billing") return "billing";
  if (category === "account_access") return "account_access";
  if (category === "bug_report") return "bug_report";
  if (category === "feature_request") return "feature_request";
  return "other";
}

interface AdminSupportTicketDetailModalProps {
  open: boolean;
  ticket: AdminSupportTicket | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: { status: AdminTicketStatus; note: string | null }) => Promise<void>;
}

export function AdminSupportTicketDetailModal({
  open,
  ticket,
  saving,
  error,
  onClose,
  onSave,
}: AdminSupportTicketDetailModalProps) {
  const [status, setStatus] = useState<AdminTicketStatus>("open");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!ticket) return;

    setStatus(normalizeStatus(ticket.status));
    setNote(ticket.note ?? "");
  }, [ticket]);

  const normalizedCategory = useMemo(
    () => normalizeCategory(ticket?.category ?? "other"),
    [ticket?.category],
  );

  const hasChanges =
    ticket != null &&
    (status !== normalizeStatus(ticket.status) || note.trim() !== (ticket.note ?? "").trim());

  return (
    <AnimatePresence>
      {open && ticket && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="support-modal-panel relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[28px]"
            style={{ maxHeight: "min(94dvh, 940px)" }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#993331] to-[#7a2927] px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/5" />
              <div className="absolute bottom-[-16px] left-[28%] h-20 w-20 rounded-full bg-white/5" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm sm:h-14 sm:w-14">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                      Detalle completo del ticket
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      Gestiona estado y respuesta administrativa desde una sola vista.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-white/80">
                      Ticket ID: {ticket.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="support-modal-scroll flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
                <section className="space-y-5">
                  <div className="rounded-2xl border border-gray-100 bg-[#FCFAF9] p-4 sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-gray-900">Informacion del ticket</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <p className="text-xs font-semibold text-gray-500">Nombre</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{ticket.name}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <p className="text-xs font-semibold text-gray-500">Correo</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{ticket.email}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <p className="text-xs font-semibold text-gray-500">Categoria</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {CATEGORY_LABEL[normalizedCategory]}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <p className="text-xs font-semibold text-gray-500">Fecha</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{ticket.createdAt}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold text-gray-500">Asunto</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{ticket.subject}</p>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold text-gray-500">Mensaje del usuario</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                        {ticket.message}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-5">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-gray-900">Gestion administrativa</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Estado del ticket
                        </label>
                        <AdminFilterDropdown
                          value={status}
                          options={STATUS_OPTIONS}
                          onChange={setStatus}
                          fullWidth
                          menuAlign="left"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Nota / respuesta del admin
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={8}
                          placeholder="Escribe aqui la respuesta interna o el mensaje que se enviara al usuario al cerrar el ticket."
                          className="w-full resize-y rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-colors hover:border-gray-300 focus:border-[#993331]/40"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Si cambias el estado a <span className="font-semibold">cerrado</span>, se envia un correo con esta nota al usuario.
                        </p>
                      </div>

                      {error && (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" /> {error}
                        </p>
                      )}

                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Cerrar
                        </button>
                        <button
                          type="button"
                          onClick={() => onSave({ status, note: note.trim() ? note.trim() : null })}
                          disabled={saving || !hasChanges}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#882d2d] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Guardar cambios
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-[#FCFAF9] p-4 sm:p-5">
                    <h4 className="text-sm font-bold text-gray-900">Resumen rapido</h4>
                    <ul className="mt-3 space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#993331]" /> {ticket.name}
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#993331]" /> {ticket.email}
                      </li>
                      <li className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-[#993331]" /> Estado actual: {STATUS_LABEL[normalizeStatus(ticket.status)]}
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageSquareText className="h-4 w-4 text-[#993331]" /> Asunto: {ticket.subject}
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
