"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Pin,
  PinOff,
  Trash2,
  Clock,
  ChevronDown,
  MailOpen,
} from "lucide-react";
import type { Notice } from "../types";
import {
  noticeCategoryConfig as categoryConfig,
  timeAgo,
  cls,
} from "../utils/noticeConfig";

interface NoticeCardProps {
  notice: Notice;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NoticeCard({
  notice,
  onToggleRead,
  onTogglePin,
  onDelete,
}: NoticeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = categoryConfig[notice.category];
  const Icon = cfg.icon;
  const longText = notice.description.length > 120;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className={cls(
        "group relative bg-surface-primary rounded-2xl border transition-colors duration-200",
        notice.read
          ? "border-border-subtle hover:border-border-default"
          : "border-accent/15 shadow-sm shadow-accent/5 hover:shadow-md hover:shadow-accent/8",
      )}
    >
      {/* unread accent */}
      {!notice.read && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-accent-hover rounded-l-2xl" />
      )}

      <div className="p-5 pl-6">
        <div className="flex items-start gap-4">
          {/* icon */}
          <div
            className={cls(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
              cfg.bg,
              cfg.color,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          {/* body */}
          <div className="flex-1 min-w-0">
            {/* top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={cls(
                      "text-sm font-bold leading-snug",
                      notice.read
                        ? "text-content-secondary"
                        : "text-content-primary",
                    )}
                  >
                    {notice.title}
                  </h3>
                  {notice.pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                      <Pin className="w-3 h-3" />
                      Fijada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cls(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      cfg.bg,
                      cfg.color,
                    )}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-[11px] text-content-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(notice.createdAt)}
                  </span>
                </div>
              </div>

              {/* quick actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => onToggleRead(notice.id)}
                  title={
                    notice.read ? "Marcar como no leída" : "Marcar como leída"
                  }
                  className="p-1.5 rounded-lg text-content-muted hover:text-accent hover:bg-accent/5 transition-colors"
                >
                  {notice.read ? (
                    <MailOpen className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => onTogglePin(notice.id)}
                  title={notice.pinned ? "Desfijar" : "Fijar"}
                  className="p-1.5 rounded-lg text-content-muted hover:text-accent hover:bg-accent/5 transition-colors"
                >
                  {notice.pinned ? (
                    <PinOff className="w-4 h-4" />
                  ) : (
                    <Pin className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => onDelete(notice.id)}
                  title="Eliminar"
                  className="p-1.5 rounded-lg text-content-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* description */}
            <button
              onClick={() => longText && setExpanded((p) => !p)}
              className={cls(
                "text-left w-full mt-2",
                !longText && "cursor-default",
              )}
            >
              <p
                className={cls(
                  "text-xs leading-relaxed",
                  notice.read ? "text-content-muted" : "text-content-tertiary",
                )}
              >
                {expanded || !longText
                  ? notice.description
                  : notice.description.slice(0, 120) + "…"}
              </p>
              {longText && (
                <span className="text-[11px] font-bold text-accent mt-1 inline-flex items-center gap-0.5">
                  {expanded ? "Ver menos" : "Ver más"}
                  <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </motion.span>
                </span>
              )}
            </button>

            {/* action CTA */}
            {notice.actionLabel && (
              <a
                href={notice.actionHref}
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-sm shadow-accent/15 hover:shadow-md hover:shadow-accent/20 transition-shadow duration-200 active:scale-[0.98]"
              >
                {notice.actionLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
