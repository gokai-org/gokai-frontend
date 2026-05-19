"use client";

import { Loader2, SendHorizontal, Sparkles } from "lucide-react";
import type { AdminGeneralNoticeResult } from "../types/notifications";

interface AdminGeneralNoticeComposerProps {
  title: string;
  message: string;
  onTitleChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
  sending: boolean;
  lastResult: AdminGeneralNoticeResult | null;
}

function formatDateLabel(timestamp: number) {
  return new Date(timestamp).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getLastResultStatusLabel(lastResult: AdminGeneralNoticeResult | null) {
  if (!lastResult) {
    return "Sin actividad";
  }

  return lastResult.deliveryMode === "inbox_only"
    ? "Solo inbox"
    : "Push + inbox";
}

export function AdminGeneralNoticeComposer({
  title,
  message,
  onTitleChange,
  onMessageChange,
  onSubmit,
  sending,
  lastResult,
}: AdminGeneralNoticeComposerProps) {
  const titleLength = title.trim().length;
  const messageLength = message.trim().length;

  return (
    <section className="overflow-hidden rounded-[28px] border border-border-subtle bg-surface-primary shadow-sm">
      <div className="border-b border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(153,51,49,0.18),transparent_55%),linear-gradient(135deg,rgba(255,244,239,0.92),rgba(255,255,255,0.98))] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Aviso general
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-content-primary">
              Publica un anuncio global desde el panel admin
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-content-secondary">
              El backend respeta disponibilidad de OneSignal, alertas prioritarias y horas silenciosas. El envio no fuerza entrega a usuarios sin push activo.
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-tertiary">
              Ultimo envio
            </p>
            <p className="mt-1 text-sm font-semibold text-content-primary">
              {lastResult ? `${lastResult.sent} destinatarios` : "Sin actividad"}
            </p>
            <p className="mt-1 text-xs text-content-tertiary">
              {getLastResultStatusLabel(lastResult)}
            </p>
            <p className="mt-1 text-xs text-content-tertiary">
              {lastResult ? formatDateLabel(lastResult.sentAt) : "Todavia no se ha disparado un aviso general desde esta sesion."}
            </p>
            {lastResult?.deliveryMode === "inbox_only" && lastResult.pushError ? (
              <p className="mt-2 text-xs leading-5 text-amber-700">
                OneSignal rechazó el push: {lastResult.pushError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:p-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-content-primary">Titulo</span>
            <input
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Ej. Nuevo contenido disponible esta semana"
              className="w-full rounded-2xl border border-border-default bg-surface-secondary px-4 py-3 text-sm text-content-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-content-primary">Mensaje</span>
            <textarea
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              placeholder="Describe el aviso que quieres enviar a los usuarios elegibles."
              rows={6}
              className="w-full resize-y rounded-2xl border border-border-default bg-surface-secondary px-4 py-3 text-sm leading-6 text-content-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSubmit}
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-2xl bg-content-primary px-4 py-3 text-sm font-semibold text-content-inverted transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
              {sending ? "Enviando aviso..." : "Enviar aviso general"}
            </button>

            <span className="text-xs text-content-tertiary">
              {titleLength} caracteres en titulo, {messageLength} en mensaje
            </span>
          </div>
        </div>

        <aside className="rounded-[24px] border border-border-subtle bg-surface-secondary/60 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-tertiary">
            Vista previa operacional
          </p>
          <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Push / Inbox
            </p>
            <h3 className="mt-2 text-base font-bold text-content-primary">
              {title.trim() || "Tu titulo aparecera aqui"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-content-secondary">
              {message.trim() || "El mensaje se reflejara en el inbox y en la notificacion push para usuarios elegibles."}
            </p>
          </div>

          <div className="mt-4 space-y-3 text-xs leading-5 text-content-tertiary">
            <p>
              Los anuncios generales se registran en el inbox backend solo para los destinatarios que el microservicio considera elegibles.
            </p>
            <p>
              Si quieres verificar OneSignal por usuario, puedes seguir usando la prueba individual ya existente fuera de este flujo.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}