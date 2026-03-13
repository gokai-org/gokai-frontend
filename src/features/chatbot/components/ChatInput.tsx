"use client";

import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartRecording: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onStartRecording,
  isRecording,
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <button
          type="button"
          onClick={onStartRecording}
          disabled={disabled}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isRecording
              ? "bg-[#993331] animate-pulse"
              : "bg-gray-100 hover:bg-gray-200"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg
            className={`w-5 h-5 ${isRecording ? "text-white" : "text-gray-600"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3z" />
            <path d="M5.5 10a.75.75 0 01.75.75v.5a3.75 3.75 0 007.5 0v-.5a.75.75 0 011.5 0v.5A5.25 5.25 0 0110.75 16v1.25h2a.75.75 0 010 1.5h-5.5a.75.75 0 010-1.5h2V16A5.25 5.25 0 014.75 10.75v-.5a.75.75 0 01.75-.75z" />
          </svg>
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enviar mensaje"
          disabled={disabled}
          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#993331] focus:border-transparent disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="w-10 h-10 rounded-full bg-[#993331] text-white flex items-center justify-center hover:bg-[#882d2d] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
