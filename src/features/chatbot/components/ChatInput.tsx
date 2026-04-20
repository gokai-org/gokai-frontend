"use client";

import { useEffect, useRef, useState } from "react";
import { ChatRecordingPanel } from "@/features/chatbot/components/ChatRecordingPanel";
import { useAudioRecorder } from "@/features/chatbot/hooks/useAudioRecorder";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendAudioMessage?: (payload: {
    audioUrl: string;
    audioDuration: string;
    audioBlob: Blob;
    mimeType: string;
    waveform: number[];
  }) => void;
  disabled?: boolean;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 140;

export function ChatInput({
  onSendMessage,
  onSendAudioMessage,
  disabled = false,
  animationsEnabled = true,
  heavyAnimationsEnabled = true,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isRecording,
    isPreparing,
    formattedDuration,
    audioLevel,
    waveformBars,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  } = useAudioRecorder();

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
    if (!trimmed || disabled || isRecording || isPreparing) return;

    onSendMessage(trimmed);
    setMessage("");
    resetTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const trimmed = message.trim();
      if (!trimmed || disabled || isRecording || isPreparing) return;

      onSendMessage(trimmed);
      setMessage("");
      resetTextarea();
    }
  };

  const handleMicClick = async () => {
    clearError();

    if (isRecording) {
      const result = await stopRecording();

      if (result && onSendAudioMessage) {
        const mins = Math.floor(result.durationInSeconds / 60);
        const secs = result.durationInSeconds % 60;
        const duration = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        onSendAudioMessage({
          audioUrl: result.url,
          audioDuration: duration,
          audioBlob: result.blob,
          mimeType: result.mimeType,
          waveform: result.waveform,
        });
      }

      return;
    }

    await startRecording();
  };

  const handleStopRecording = async () => {
    const result = await stopRecording();

    if (result && onSendAudioMessage) {
      const mins = Math.floor(result.durationInSeconds / 60);
      const secs = result.durationInSeconds % 60;
      const duration = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      onSendAudioMessage({
        audioUrl: result.url,
        audioDuration: duration,
        audioBlob: result.blob,
        mimeType: result.mimeType,
        waveform: result.waveform,
      });
    }
  };

  return (
    <div
      data-help-target="chat-input"
      className="border-t border-border-default bg-surface-primary/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4"
    >
      <div className="mx-auto w-full max-w-5xl">
        <ChatRecordingPanel
          isRecording={isRecording}
          isPreparing={isPreparing}
          duration={formattedDuration}
          audioLevel={audioLevel}
          waveformBars={waveformBars}
          animationsEnabled={animationsEnabled}
          heavyAnimationsEnabled={heavyAnimationsEnabled}
          onStop={handleStopRecording}
          onCancel={cancelRecording}
        />

        {error && (
          <div className="mb-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex w-full items-end gap-3">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled || isPreparing}
            data-help-target="chat-mic"
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border transition-all duration-300",
              isRecording
                ? "border-accent bg-accent text-content-inverted shadow-lg shadow-accent/20"
                : "border-border-default bg-surface-secondary text-content-secondary hover:border-accent/15 hover:bg-surface-primary hover:text-accent",
              "disabled:cursor-not-allowed disabled:opacity-50",
            ].join(" ")}
            aria-label={isRecording ? "Detener grabación" : "Iniciar grabación"}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a3 3 0 0 0-3 3v4a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z" />
              <path d="M5.5 10a.75.75 0 0 1 .75.75v.5a3.75 3.75 0 0 0 7.5 0v-.5a.75.75 0 0 1 1.5 0v.5A5.25 5.25 0 0 1 10.75 16v1.25h2a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h2V16A5.25 5.25 0 0 1 4.75 11.25v-.5A.75.75 0 0 1 5.5 10Z" />
            </svg>
          </button>

          <div className="flex min-w-0 flex-1 items-end rounded-[28px] border border-accent/20 bg-surface-secondary px-4 py-2 shadow-sm transition-all focus-within:border-accent/30 focus-within:bg-surface-primary">
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje para practicar..."
              disabled={disabled || isRecording || isPreparing}
              rows={1}
              className="w-full resize-none overflow-hidden bg-transparent py-[10px] text-sm leading-6 text-content-primary outline-none placeholder:text-content-muted disabled:opacity-50"
              style={{ height: 44 }}
            />

            <button
              type="submit"
              disabled={
                !message.trim() || disabled || isRecording || isPreparing
              }
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
