"use client";

import { useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import type { ChatMessage } from "@/features/chatbot/types";
import { MessageBubble } from "./MessageBubble";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { useChatScroll } from "@/features/chatbot/hooks/useChatScroll";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  animationsEnabled: boolean;
  heavyAnimationsEnabled?: boolean;
  onOpenWritingMessage?: (message: ChatMessage) => void;
  onRetryMessage?: (text: string) => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  animationsEnabled,
  heavyAnimationsEnabled = true,
  onOpenWritingMessage,
  onRetryMessage,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useChatScroll({
    dependency: [messages.length, isLoading],
    anchorRef: bottomRef,
  });

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="mx-auto flex w-full max-w-4xl flex-col py-2">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <AnimatedEntrance
              key={message.id}
              index={index}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <MessageBubble
                message={message}
                onOpenWritingMessage={onOpenWritingMessage}
                onRetryMessage={onRetryMessage}
                isBusy={isLoading}
              />
            </AnimatedEntrance>
          ))}

          {isLoading && (
            <AnimatedEntrance
              key="typing-indicator"
              index={messages.length + 1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <ChatTypingIndicator />
            </AnimatedEntrance>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
