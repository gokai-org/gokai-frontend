"use client";

import { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 140;

export function ChatInput({
  onSendMessage,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      MAX_TEXTAREA_HEIGHT,
    )}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  };

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  const resetTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "44px";
    textarea.style.overflowY = "hidden";
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setMessage("");
    resetTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const trimmed = message.trim();
      if (!trimmed || disabled) return;

      onSendMessage(trimmed);
      setMessage("");
      resetTextarea();
    }
  };

  return (
    <div
      data-help-target="chat-input"
      className="border-t border-border-default bg-surface-primary/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4"
    >
      <div className="mx-auto w-full max-w-5xl">
        <form onSubmit={handleSubmit} className="flex w-full items-end gap-3">
          <div className="flex min-w-0 flex-1 items-end rounded-[28px] border border-accent/20 bg-surface-secondary px-4 py-2 shadow-sm transition-all focus-within:border-accent/30 focus-within:bg-surface-primary">
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje para practicar..."
              disabled={disabled}
              rows={1}
              className="w-full resize-none overflow-hidden bg-transparent py-[10px] text-sm leading-6 text-content-primary outline-none placeholder:text-content-muted disabled:opacity-50"
              style={{ height: 44 }}
            />

            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-accent text-content-inverted transition-all duration-300 hover:bg-accent-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar mensaje"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.126A59.77 59.77 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L6 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
