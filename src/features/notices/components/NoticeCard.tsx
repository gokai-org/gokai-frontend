"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCheck,
  Pin,
  PinOff,
  Trash2,
  Clock,
  ChevronDown,
  MailOpen,
} from "lucide-react";
import type { Notice } from "../types";
import { categoryConfig, timeAgo, cls } from "../lib/constants";

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
        "group relative bg-white rounded-2xl border transition-colors duration-200",
        notice.read
          ? "border-gray-100 hover:border-gray-200"
          : "border-[#993331]/15 shadow-sm shadow-[#993331]/5 hover:shadow-md hover:shadow-[#993331]/8"
      )}
    >
      {/* unread accent */}
      {!notice.read && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#993331] to-[#7a2927] rounded-l-2xl" />
      )}

      <div className="p-5 pl-6">
        <div className="flex items-start gap-4">
          {/* icon */}
          <div
            className={cls(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
              cfg.bg,
              cfg.color
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
                      notice.read ? "text-gray-700" : "text-gray-900"
                    )}
                  >
                    {notice.title}
                  </h3>
                  {notice.pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#993331]/10 text-[#993331] text-[10px] font-bold">
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
                      cfg.color
                    )}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(notice.createdAt)}
                  </span>
                </div>
              </div>

              {/* quick actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => onToggleRead(notice.id)}
                  title={notice.read ? "Marcar como no leída" : "Marcar como leída"}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#993331] hover:bg-[#993331]/5 transition-colors"
                >
                  {notice.read ? <MailOpen className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onTogglePin(notice.id)}
                  title={notice.pinned ? "Desfijar" : "Fijar"}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#993331] hover:bg-[#993331]/5 transition-colors"
                >
                  {notice.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDelete(notice.id)}
                  title="Eliminar"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* description */}
            <button
              onClick={() => longText && setExpanded((p) => !p)}
              className={cls("text-left w-full mt-2", !longText && "cursor-default")}
            >
              <p
                className={cls(
                  "text-xs leading-relaxed",
                  notice.read ? "text-gray-400" : "text-gray-500"
                )}
              >
                {expanded || !longText
                  ? notice.description
                  : notice.description.slice(0, 120) + "…"}
              </p>
              {longText && (
                <span className="text-[11px] font-bold text-[#993331] mt-1 inline-flex items-center gap-0.5">
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
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-[#993331] to-[#7a2927] text-white shadow-sm shadow-[#993331]/15 hover:shadow-md hover:shadow-[#993331]/20 transition-shadow duration-200 active:scale-[0.98]"
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
