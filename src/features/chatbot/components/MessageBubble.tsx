"use client";

import type { ChatMessage } from "@/features/chatbot/types";
import { hasJapaneseCharacters } from "@/features/chatbot/utils/writingCharacters";

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenWritingMessage?: (message: ChatMessage) => void;
  onRetryMessage?: (text: string) => void;
  isBusy?: boolean;
}

export function MessageBubble({
  message,
  onOpenWritingMessage,
  onRetryMessage,
  isBusy = false,
}: MessageBubbleProps) {
  const isBot = message.role === "bot";
  const canOpenWriting = hasJapaneseCharacters(message.content);
  const isErrorMessage = message.variant === "error";

  return (
    <div className={`mb-4 flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div className="min-w-0 max-w-[88%] sm:max-w-[74%]">
        {isBot ? (
          <div className="mb-2 inline-flex rounded-full bg-gradient-to-r from-accent to-accent-hover px-3 py-1 text-[11px] font-extrabold tracking-wide text-content-inverted shadow-sm ring-1 ring-white/15">
            KAZU
          </div>
        ) : null}

        <div
          className={[
            "rounded-[26px] px-4 py-3.5 shadow-sm transition-all duration-300",
            isBot
              ? isErrorMessage
                ? "border border-red-200 bg-red-50 text-red-950 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-100"
                : "border border-border-subtle bg-surface-primary text-content-primary"
              : "bg-gradient-to-br from-accent to-accent-hover text-content-inverted",
          ].join(" ")}
        >
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14px] leading-6 sm:text-[15px]">
            {message.content}
          </p>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div
              className={`text-[11px] font-medium ${
                isBot
                  ? isErrorMessage
                    ? "text-red-700 dark:text-red-200/80"
                    : "text-content-muted"
                  : "text-white/75"
              }`}
            >
              {message.timestamp.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            {isErrorMessage && message.retryText && onRetryMessage ? (
              <button
                type="button"
                onClick={() => onRetryMessage(message.retryText as string)}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400/30 dark:bg-white/5 dark:text-red-100 dark:hover:bg-white/10"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 3v6h6" />
                </svg>
                Reintentar
              </button>
            ) : canOpenWriting && onOpenWritingMessage ? (
              <button
                type="button"
                onClick={() => onOpenWritingMessage(message)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  isBot
                    ? "border border-border-default bg-surface-elevated text-content-secondary hover:border-accent/20 hover:text-accent"
                    : "bg-white/14 text-white hover:bg-white/18",
                ].join(" ")}
                aria-label="Practicar escritura de este mensaje"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m4 20 5.5-1.5L19 9a2.12 2.12 0 1 0-3-3l-9.5 9.5Z" />
                  <path d="M13.5 6.5 17 10" />
                </svg>
                Escribir
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
