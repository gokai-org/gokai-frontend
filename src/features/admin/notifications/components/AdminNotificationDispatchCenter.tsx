"use client";

import { useMemo } from "react";
import {
  BellRing,
  Flame,
  Inbox,
  Loader2,
  Megaphone,
  RadioTower,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import type { AdminVocabularyTheme } from "@/features/admin/vocabulary/types/vocabulary";
import {
  AdminFilterDropdown,
  type AdminFilterOption,
} from "@/features/admin/shared/components/AdminFilterDropdown";
import type {
  AdminGeneralNoticeResult,
  AdminNotificationCampaignKind,
} from "../types/notifications";

type CampaignOption = {
  kind: AdminNotificationCampaignKind;
  label: string;
  summary: string;
  audience: string;
  icon: typeof Megaphone;
};

const CAMPAIGN_OPTIONS: CampaignOption[] = [
  {
    kind: "general_notice",
    label: "Aviso general",
    summary: "Escribe un aviso para compartir una novedad.",
    audience: "Personas que pueden recibir este aviso",
    icon: Megaphone,
  },
  {
    kind: "daily_review",
    label: "Recordatorio de estudio",
    summary: "Envía el recordatorio diario de estudio.",
    audience: "Personas con estudio pendiente",
    icon: BellRing,
  },
  {
    kind: "streak_reminder",
    label: "Recordatorio de avance",
    summary: "Envía un recordatorio a personas con avance activo.",
    audience: "Personas con avance activo",
    icon: Flame,
  },
  {
    kind: "theme_released",
    label: "Aviso por tema",
    summary: "Anuncia la salida de un tema concreto.",
    audience: "Personas interesadas en el tema",
    icon: Sparkles,
  },
];

function formatDateLabel(timestamp: number) {
  return new Date(timestamp).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatThemeOptionLabel(theme: AdminVocabularyTheme) {
  return [theme.kanji, theme.kana, theme.meaning].filter(Boolean).join(" • ");
}

function getActionLabel(kind: AdminNotificationCampaignKind) {
  switch (kind) {
    case "general_notice":
      return "Enviar aviso general";
    case "daily_review":
      return "Enviar recordatorio";
    case "streak_reminder":
      return "Enviar recordatorio";
    case "theme_released":
      return "Enviar aviso por tema";
  }
}

function getDeliveryLabel(lastResult: AdminGeneralNoticeResult | null) {
  if (!lastResult) {
    return "Sin actividad";
  }

  return lastResult.deliveryMode === "inbox_only"
    ? "Solo en app"
    : "Alerta y app";
}

interface AdminNotificationDispatchCenterProps {
  activeKind: AdminNotificationCampaignKind;
  onActiveKindChange: (value: AdminNotificationCampaignKind) => void;
  generalTitle: string;
  generalMessage: string;
  onGeneralTitleChange: (value: string) => void;
  onGeneralMessageChange: (value: string) => void;
  themes: AdminVocabularyTheme[];
  themesLoading: boolean;
  themesError: string | null;
  selectedThemeId: string;
  onSelectedThemeIdChange: (value: string) => void;
  selectedTheme: AdminVocabularyTheme | null;
  onSubmit: () => void;
  sending: boolean;
  lastResult: AdminGeneralNoticeResult | null;
}

export function AdminNotificationDispatchCenter({
  activeKind,
  onActiveKindChange,
  generalTitle,
  generalMessage,
  onGeneralTitleChange,
  onGeneralMessageChange,
  themes,
  themesLoading,
  themesError,
  selectedThemeId,
  onSelectedThemeIdChange,
  selectedTheme,
  onSubmit,
  sending,
  lastResult,
}: AdminNotificationDispatchCenterProps) {
  const activeOption =
    CAMPAIGN_OPTIONS.find((option) => option.kind === activeKind) ??
    CAMPAIGN_OPTIONS[0];
  const themeOptions = useMemo<AdminFilterOption[]>(() => {
    if (themesLoading) {
      return [{ value: "", label: "Cargando temas..." }];
    }

    if (themes.length === 0) {
      return [{ value: "", label: "Sin temas" }];
    }

    return themes.map((theme) => ({
      value: theme.id,
      label: formatThemeOptionLabel(theme),
    }));
  }, [themes, themesLoading]);
  const selectedThemeLabel = selectedTheme
    ? formatThemeOptionLabel(selectedTheme)
    : themesLoading
      ? "Cargando temas..."
      : "Selecciona un tema";

  return (
    <section className="overflow-visible rounded-[28px] border border-accent bg-surface-primary shadow-sm">
      <div className="rounded-t-[28px] border-b border-accent-hover bg-accent p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <RadioTower className="h-3.5 w-3.5" />
              Envíos
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
              Envía avisos y recordatorios
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/85">
              Elige el tipo de envío, completa lo necesario y confirma.
            </p>
          </div>

          <div className="rounded-2xl border border-accent-hover bg-accent-hover px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
              Ultimo resultado
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {lastResult ? `${lastResult.sent} destinatarios` : "Sin actividad"}
            </p>
            <p className="mt-1 text-xs text-white/75">
              {getDeliveryLabel(lastResult)}
            </p>
            <p className="mt-1 text-xs text-white/75">
              {lastResult
                ? formatDateLabel(lastResult.sentAt)
                : "Todavia no se ha disparado ningun flujo desde esta sesion."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:p-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            {CAMPAIGN_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = option.kind === activeKind;

              return (
                <button
                  key={option.kind}
                  type="button"
                  onClick={() => onActiveKindChange(option.kind)}
                  className={[
                    "rounded-[24px] border px-4 py-4 text-left transition",
                    active
                      ? "border-accent-hover bg-accent text-white shadow-sm"
                      : "border-border-subtle bg-surface-secondary/55 hover:border-border-default hover:bg-surface-secondary",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={[
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                          active
                            ? "bg-white/15 text-white"
                            : "bg-surface-primary text-accent",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={[
                            "text-sm font-bold",
                            active ? "text-white" : "text-content-primary",
                          ].join(" ")}
                        >
                          {option.label}
                        </p>
                        <p
                          className={[
                            "mt-1 text-xs leading-5",
                            active ? "text-white/85" : "text-content-secondary",
                          ].join(" ")}
                        >
                          {option.summary}
                        </p>
                      </div>
                    </div>

                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        active
                          ? "bg-white text-accent"
                          : "bg-surface-primary text-content-tertiary",
                      ].join(" ")}
                    >
                      {active ? "Activo" : "Disponible"}
                    </span>
                  </div>

                  <div
                    className={[
                      "mt-4 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium",
                      active
                        ? "bg-white/15 text-white/85"
                        : "bg-white/70 text-content-tertiary",
                    ].join(" ")}
                  >
                    {option.audience}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-[26px] border border-border-subtle bg-surface-secondary/45 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-tertiary">
                  Flujo activo
                </p>
                <h3 className="mt-1 text-xl font-bold text-content-primary">
                  {activeOption.label}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-content-secondary">
                  {activeOption.summary}
                </p>
              </div>

              <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Para quién
                </p>
                <p className="mt-1 font-semibold text-content-primary">
                  {activeOption.audience}
                </p>
              </div>
            </div>

            {activeKind === "general_notice" ? (
              <div className="mt-5 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-content-primary">Titulo</span>
                  <input
                    value={generalTitle}
                    onChange={(event) => onGeneralTitleChange(event.target.value)}
                    placeholder="Ej. Nuevo servicio disponible"
                    className="w-full rounded-2xl border border-border-default bg-surface-primary px-4 py-3 text-sm text-content-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-content-primary">Mensaje</span>
                  <textarea
                    value={generalMessage}
                    onChange={(event) => onGeneralMessageChange(event.target.value)}
                    placeholder="Escribe el mensaje que quieres compartir."
                    rows={6}
                    className="w-full resize-y rounded-2xl border border-border-default bg-surface-primary px-4 py-3 text-sm leading-6 text-content-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                </label>
              </div>
            ) : null}

            {activeKind === "theme_released" ? (
              <div className="mt-5 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-content-primary">Tema a anunciar</span>
                  <AdminFilterDropdown
                    value={selectedThemeId}
                    options={themeOptions}
                    onChange={onSelectedThemeIdChange}
                    buttonLabel={selectedThemeLabel}
                    fullWidth
                    menuAlign="left"
                    disabled={themesLoading || themeOptions.length === 0}
                  />
                </label>

                {themesError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {themesError}
                  </div>
                ) : null}

                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-tertiary">
                    Vista previa
                  </p>
                  <p className="mt-2 text-sm font-semibold text-content-primary">
                    {selectedTheme
                      ? `Nuevo tema: ${selectedTheme.meaning}`
                      : "Selecciona un tema"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-content-secondary">
                    {selectedTheme
                      ? `Se avisará a las personas interesadas en ${formatThemeOptionLabel(selectedTheme)}.`
                      : "Este aviso se enviará a personas interesadas en el tema elegido."}
                  </p>
                </div>
              </div>
            ) : null}

            {activeKind === "daily_review" ? (
              <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                <p className="text-sm font-semibold text-content-primary">
                  Se enviará el recordatorio diario de estudio.
                </p>
                <p className="mt-2 text-sm leading-6 text-content-secondary">
                  No necesitas escribir un mensaje manual para este envío.
                </p>
              </div>
            ) : null}

            {activeKind === "streak_reminder" ? (
              <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                <p className="text-sm font-semibold text-content-primary">
                  Se enviará un recordatorio relacionado con el avance de cada persona.
                </p>
                <p className="mt-2 text-sm leading-6 text-content-secondary">
                  No necesitas escribir un mensaje manual para este envío.
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-3">
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
                {sending ? "Procesando flujo..." : getActionLabel(activeKind)}
              </button>

              <span className="text-xs text-content-tertiary">
                Si la alerta externa falla, el aviso sigue quedando guardado en la app.
              </span>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[24px] border border-border-subtle bg-surface-secondary/60 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-tertiary">
              Qué puedes hacer
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-content-secondary">
              <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                <p className="font-semibold text-content-primary">Enviar avisos</p>
                <p className="mt-1 text-xs text-content-tertiary">
                  Puedes enviar avisos generales, recordatorios y avisos por tema.
                </p>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                <p className="font-semibold text-content-primary">Revisar mensajes</p>
                <p className="mt-1 text-xs text-content-tertiary">
                  Puedes revisar, marcar como leído y borrar mensajes por persona.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-border-subtle bg-surface-primary p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Inbox className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-content-primary">
                  Ultima entrega registrada
                </p>
                <p className="text-xs text-content-tertiary">
                  Resultado consolidado del último flujo disparado.
                </p>
              </div>
            </div>

            {lastResult ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl border border-border-subtle bg-surface-secondary/60 p-4">
                  <p className="font-semibold text-content-primary">{lastResult.title}</p>
                  <p className="mt-1 text-xs text-content-tertiary">
                    {lastResult.audienceLabel}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-content-secondary">
                    {lastResult.sent} impactados
                  </span>
                  <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-content-secondary">
                    {getDeliveryLabel(lastResult)}
                  </span>
                </div>
                <p className="text-xs text-content-tertiary">
                  {formatDateLabel(lastResult.sentAt)}
                </p>
                {lastResult.pushError ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
                    La alerta externa no salió. El aviso quedó guardado en la app.
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-content-tertiary">
                Aquí verás el último envío realizado.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}