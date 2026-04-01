"use client";

import {
  ChevronDown,
  Clock,
  MailOpen,
  Check,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import type { Notice } from "@/features/notices/types";
import {
  cls,
  noticeCategoryConfig,
  timeAgo,
} from "@/features/notices/utils/noticeConfig";

interface BaseNoticeCardProps {
  notice: Notice;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
  eyebrow?: string;
}

export function BaseNoticeCard({
  notice,
  onToggleRead,
  onTogglePin,
  onDelete,
  animationsEnabled = true,
  heavyAnimationsEnabled = true,
  eyebrow,
}: BaseNoticeCardProps) {
  const [expanded, setExpanded] = useState(false);

  const config = noticeCategoryConfig[notice.category];
  const Icon = config.icon;
  const longText = notice.description.length > 120;

  return (
    <AnimatedEntrance
      disabled={!animationsEnabled}
      mode={heavyAnimationsEnabled ? "default" : "light"}
    >
      <div
        className={cls(
          "group relative rounded-[24px] border bg-surface-primary transition-all duration-300",
          notice.read
            ? "border-border-subtle hover:border-border-default"
            : "border-accent/20 shadow-[0_2px_16px_-4px_rgba(153,51,49,0.12)] hover:shadow-[0_8px_28px_-6px_rgba(153,51,49,0.22)]",
        )}
      >
        {!notice.read && (
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-[24px] bg-gradient-to-b from-accent to-accent-hover" />
        )}

        <div className="p-5 pl-6">
          <div className="flex items-start gap-4">
            <div
              className={cls(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                config.bg,
                config.color,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {eyebrow && (
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-accent">
                      {eyebrow}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={cls(
                        "text-sm font-bold leading-snug",
                        notice.read ? "text-content-secondary" : "text-content-primary",
                      )}
                    >
                      {notice.title}
                    </h3>

                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                        <Pin className="h-3 w-3" />
                        Fijada
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={cls(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        config.bg,
                        config.color,
                      )}
                    >
                      {config.label}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] text-content-muted">
                      <Clock className="h-3 w-3" />
                      {timeAgo(notice.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <button
                    onClick={() => onToggleRead(notice.id)}
                    className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-accent/5 hover:text-accent"
                    title={
                      notice.read ? "Marcar como no leída" : "Marcar como leída"
                    }
                  >
                    {notice.read ? (
                      <MailOpen className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onTogglePin(notice.id)}
                    className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-accent/5 hover:text-accent"
                    title={notice.pinned ? "Desfijar" : "Fijar"}
                  >
                    {notice.pinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onDelete(notice.id)}
                    className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => longText && setExpanded((prev) => !prev)}
                className={cls("mt-2 w-full text-left", !longText && "cursor-default")}
              >
                <p
                  className={cls(
                    "text-xs leading-relaxed",
                    notice.read ? "text-content-muted" : "text-content-tertiary",
                  )}
                >
                  {expanded || !longText
                    ? notice.description
                    : `${notice.description.slice(0, 120)}…`}
                </p>

                {longText && (
                  <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-bold text-accent">
                    {expanded ? "Ver menos" : "Ver más"}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </span>
                )}
              </button>

              {notice.actionLabel && (
                <a
                  href={notice.actionHref}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-accent-hover px-4 py-2 text-xs font-bold text-content-inverted shadow-sm shadow-accent/15 transition-shadow duration-200 hover:shadow-md hover:shadow-accent/20 active:scale-[0.98]"
                >
                  {notice.actionLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedEntrance>
  );
}