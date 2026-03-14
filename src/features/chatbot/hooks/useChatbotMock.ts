"use client";

import { useCallback, useState } from "react";
import type { ChatMessage } from "@/features/chatbot/types";
import { sendMockMessage } from "@/features/chatbot/services/api";

export function useChatbotMock() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { reply } = await sendMockMessage({ text: trimmed });
      setMessages((prev) => [...prev, reply]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendAudioMessage = useCallback(
    async ({
      audioUrl,
      audioDuration,
      audioBlob: _audioBlob,
      mimeType: _mimeType,
      waveform,
    }: {
      audioUrl: string;
      audioDuration: string;
      audioBlob: Blob;
      mimeType: string;
      waveform: number[];
    }) => {
      const userAudioMessage: ChatMessage = {
        id: `${Date.now()}-audio`,
        role: "user",
        content: "Audio grabado",
        audioUrl,
        audioDuration,
        waveform,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userAudioMessage]);
      setIsLoading(true);

      try {
        const { reply } = await sendMockMessage({
          text: "Audio enviado",
        });

        setMessages((prev) => [...prev, reply]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const resetConversation = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    isBootstrapping,
    sendMessage,
    sendAudioMessage,
    resetConversation,
  };
}