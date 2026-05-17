"use client";

import type { ReactNode } from "react";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import type { ChatMessage } from "@/features/chatbot/types";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSkeleton } from "./ChatSkeleton";

interface ChatConversationProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isBootstrapping?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  currentChatName?: string;
  headerActions?: ReactNode;
  footer?: ReactNode;
  animationsEnabled: boolean;
  heavyAnimationsEnabled?: boolean;
  onReset?: () => void;
  onOpenWritingMessage?: (message: ChatMessage) => void;
  onRetryMessage?: (text: string) => void;
}

export function ChatConversation({
  messages,
  isLoading,
  isBootstrapping = false,
  error,
  title = "KAZU",
  subtitle,
  currentChatName,
  headerActions,
  footer,
  animationsEnabled,
  heavyAnimationsEnabled = true,
  onReset,
  onOpenWritingMessage,
  onRetryMessage,
}: ChatConversationProps) {
  return (
    <AnimatedEntrance
      disabled={!animationsEnabled}
      mode={heavyAnimationsEnabled ? "default" : "light"}
      className="h-full w-full"
    >
      <section
        data-help-target="chat-conversation"
        data-help-loading={isBootstrapping ? "true" : undefined}
        className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[30px] border border-border-subtle bg-surface-elevated shadow-[0_2px_18px_-8px_rgba(0,0,0,0.08)]"
      >
        <div className="shrink-0 border-b border-border-subtle bg-surface-primary px-4 py-4 sm:px-5 sm:py-4">
          <div className="flex min-h-[88px] items-center justify-between gap-4 sm:min-h-[104px]">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-extrabold text-content-primary">
                {title}
              </h2>

              {subtitle ? (
                <p className="mt-1 text-sm text-content-tertiary">
                  {subtitle}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {currentChatName ? (
                  <span className="truncate rounded-full border border-border-default bg-surface-elevated px-3 py-1 text-xs font-semibold text-content-secondary">
                    {currentChatName}
                  </span>
                ) : null}

                <span className="rounded-full bg-accent/8 px-3 py-1 text-xs font-semibold text-accent">
                  {messages.length} mensajes
                </span>
              </div>
            </div>

            {headerActions ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{headerActions}</div>
            ) : null}
          </div>
        </div>

        <div
          data-help-target="chat-messages"
          className="min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-5 sm:py-5"
        >
          {error ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {error}
            </div>
          ) : null}

          {isBootstrapping ? (
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <ChatEmptyState onReset={onReset} />
          ) : (
            <ChatMessageList
              messages={messages}
              isLoading={isLoading}
              animationsEnabled={animationsEnabled}
              heavyAnimationsEnabled={heavyAnimationsEnabled}
              onOpenWritingMessage={onOpenWritingMessage}
              onRetryMessage={onRetryMessage}
            />
          )}
        </div>

        {footer ? <div className="shrink-0">{footer}</div> : null}
      </section>
    </AnimatedEntrance>
  );
}
