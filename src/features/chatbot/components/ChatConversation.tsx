"use client";

import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import type { ChatMessage } from "@/features/chatbot/types";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSkeleton } from "./ChatSkeleton";

interface ChatConversationProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isBootstrapping?: boolean;
  animationsEnabled: boolean;
  heavyAnimationsEnabled?: boolean;
  onReset?: () => void;
}

export function ChatConversation({
  messages,
  isLoading,
  isBootstrapping = false,
  animationsEnabled,
  heavyAnimationsEnabled = true,
  onReset,
}: ChatConversationProps) {
  return (
    <AnimatedEntrance
      disabled={!animationsEnabled}
      mode={heavyAnimationsEnabled ? "default" : "light"}
      className="w-full"
    >
      <section className="w-full rounded-[30px] border border-border-subtle bg-surface-elevated shadow-[0_2px_18px_-8px_rgba(0,0,0,0.08)]">
        <div className="border-b border-border-subtle bg-surface-primary px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-content-primary">
                Conversación
              </h2>
              <p className="mt-1 text-sm text-content-tertiary">
                Practica mensajes, repaso guiado y audio en una sola vista.
              </p>
            </div>

            <span className="rounded-full bg-accent/8 px-3 py-1 text-xs font-semibold text-accent">
              {messages.length} mensajes
            </span>
          </div>
        </div>

        <div className="px-3 py-3 sm:px-5 sm:py-5">
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
            />
          )}
        </div>
      </section>
    </AnimatedEntrance>
  );
}