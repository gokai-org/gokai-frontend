"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChatMessage,
  ChatbotRecommendation,
  ReviewChat,
} from "@/features/chatbot/types";
import {
  createChat,
  deleteChat,
  getChatById,
  listChats,
  renameChat,
  sendChatMessage,
} from "@/features/chatbot/services/api";
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";

const RECOMMENDATION_REFRESH_DELAYS_MS = [450, 1000] as const;

function waitForRecommendationRefresh(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function buildDefaultChatName(date = new Date()) {
  return `Chat ${date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getReadableError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const directMessage = error.message.trim();

  if (/Cannot read properties of (?:null|undefined)/i.test(directMessage)) {
    return fallback;
  }

  const match = directMessage.match(/HTTP\s+\d+:\s*(.*)$/);
  if (!match?.[1]) {
    return directMessage || fallback;
  }

  try {
    const parsed = JSON.parse(match[1]) as { error?: string; message?: string };
    return parsed.error ?? parsed.message ?? fallback;
  } catch {
    return match[1] || fallback;
  }
}

function buildRetryPromptMessage(content: string, errorMessage: string): ChatMessage {
  const normalizedError = errorMessage.trim();

  return {
    id: `${Date.now()}-bot-error`,
    role: "bot",
    content:
      normalizedError ||
      "Tuvimos un problema para responder en este momento. Vuelve a intentarlo con el mismo mensaje.",
    timestamp: new Date(),
    variant: "error",
    retryText: content,
  };
}

function removeRetryPromptMessages(messages: ChatMessage[]) {
  return messages.filter((message) => message.variant !== "error");
}

export function useChatbot() {
  const [chats, setChats] = useState<ReviewChat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChat, setCurrentChat] = useState<ReviewChat>();
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedTokens, setUsedTokens] = useState(0);
  const currentChatRef = useRef<ReviewChat | undefined>(undefined);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  const recommendations = useMemo(() => {
    const seen = new Set<string>();
    const collected: ChatbotRecommendation[] = [];

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const messageRecommendations = messages[index]?.recommendations ?? [];

      for (const recommendation of messageRecommendations) {
        if (seen.has(recommendation.id)) {
          continue;
        }

        seen.add(recommendation.id);
        collected.push(recommendation);
      }
    }

    return collected;
  }, [messages]);

  const applyConversation = useCallback(
    (chat: ReviewChat, nextMessages: ChatMessage[], nextUsedTokens: number) => {
      currentChatRef.current = chat;
      setCurrentChat(chat);
      setMessages(nextMessages);
      setUsedTokens(nextUsedTokens);
      setChats((previous) => {
        const withoutCurrent = previous.filter((item) => item.id !== chat.id);
        return [chat, ...withoutCurrent];
      });
    },
    [],
  );

  const syncChatAfterSend = useCallback(
    async (chatId: string) => {
      let latestConversation = await getChatById(chatId);

      for (const delay of RECOMMENDATION_REFRESH_DELAYS_MS) {
        const hasRecommendations = latestConversation.messages.some(
          (message) => (message.recommendations?.length ?? 0) > 0,
        );

        if (hasRecommendations) {
          return latestConversation;
        }

        await waitForRecommendationRefresh(delay);
        latestConversation = await getChatById(chatId);
      }

      return latestConversation;
    },
    [],
  );

  const loadChat = useCallback(
    async (chatId: string) => {
      setIsBootstrapping(true);
      setError(null);

      try {
        const conversation = await getChatById(chatId);
        applyConversation(
          conversation.chat,
          conversation.messages,
          conversation.usedTokens,
        );
      } catch (loadError) {
        setError(
          getReadableError(loadError, "No se pudo cargar este chat."),
        );
      } finally {
        setIsBootstrapping(false);
      }
    },
    [applyConversation],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrapChat() {
      setIsBootstrapping(true);
      setError(null);

      try {
        const availableChats = await listChats();
        const latestChat = availableChats[0];

        if (!latestChat) {
          if (!cancelled) {
            setChats([]);
            setCurrentChat(undefined);
            setMessages([]);
            setUsedTokens(0);
          }
          return;
        }

        const conversation = await getChatById(latestChat.id);

        if (cancelled) {
          return;
        }

        setChats(availableChats);
        applyConversation(
          conversation.chat,
          conversation.messages,
          conversation.usedTokens,
        );
      } catch (bootstrapError) {
        if (!cancelled) {
          setError(
            getReadableError(
              bootstrapError,
              "No se pudo cargar la conversación del chatbot.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrapChat();

    return () => {
      cancelled = true;
    };
  }, [applyConversation]);

  const createNewChat = useCallback(async (name?: string) => {
    const nextName = name?.trim() || buildDefaultChatName();
    setError(null);

    const response = await createChat({ name: nextName });
    const nextChat: ReviewChat = {
      id: response.chatId,
      userId: currentChatRef.current?.userId ?? "",
      name: nextName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    currentChatRef.current = nextChat;
    setCurrentChat(nextChat);
    setMessages([]);
    setUsedTokens(0);
    setChats((previous) => [nextChat, ...previous.filter((item) => item.id !== nextChat.id)]);

    return nextChat;
  }, []);

  const ensureCurrentChat = useCallback(async () => {
    if (currentChatRef.current) {
      return currentChatRef.current;
    }

    return createNewChat();
  }, [createNewChat]);

  const selectChat = useCallback(
    async (chatId: string) => {
      if (currentChatRef.current?.id === chatId) {
        return;
      }

      await loadChat(chatId);
    },
    [loadChat],
  );

  const renameExistingChat = useCallback(
    async (chatId: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }

      await renameChat(chatId, { name: trimmed });

      setChats((previous) =>
        previous.map((chat) =>
          chat.id === chatId
            ? { ...chat, name: trimmed, updatedAt: new Date() }
            : chat,
        ),
      );

      setCurrentChat((previous) =>
        previous?.id === chatId
          ? { ...previous, name: trimmed, updatedAt: new Date() }
          : previous,
      );
    },
    [],
  );

  const deleteExistingChat = useCallback(
    async (chatId: string) => {
      await deleteChat(chatId);

      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setChats(remainingChats);

      if (currentChatRef.current?.id !== chatId) {
        return;
      }

      if (remainingChats.length === 0) {
        currentChatRef.current = undefined;
        setCurrentChat(undefined);
        setMessages([]);
        setUsedTokens(0);
        return;
      }

      await loadChat(remainingChats[0].id);
    },
    [chats, loadChat],
  );

  const sendMessageInternal = useCallback(
    async (text: string, options?: { appendUserMessage?: boolean }) => {
      const trimmed = text.trim();
      const appendUserMessage = options?.appendUserMessage ?? true;

      if (!trimmed) {
        return;
      }

      const userMessage: ChatMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((previous) => {
        const withoutRetryPrompts = removeRetryPromptMessages(previous);

        if (!appendUserMessage) {
          return withoutRetryPrompts;
        }

        return [...withoutRetryPrompts, userMessage];
      });
      setError(null);
      setIsLoading(true);

      try {
        const chat = await ensureCurrentChat();
        const response = await sendChatMessage(chat.id, { content: trimmed });
        const hasBotContent = response.botMessage.content.trim().length > 0;
        const hasRecommendations =
          (response.botMessage.recommendations?.length ?? 0) > 0;

        if (!hasBotContent && !hasRecommendations) {
          throw new Error(
            "No recibimos una respuesta util del chatbot. Vuelve a intentarlo con el mismo mensaje.",
          );
        }

        const shouldSyncConversation = !hasRecommendations;

        if (shouldSyncConversation) {
          try {
            const conversation = await syncChatAfterSend(chat.id);
            applyConversation(
              conversation.chat,
              conversation.messages,
              conversation.usedTokens,
            );
            return;
          } catch {
            // Si la reconciliacion falla, conservamos la respuesta inmediata.
          }
        }

        setUsedTokens(response.usedTokens);
        if (typeof response.totalPoints === "number") {
          dispatchMasteryProgressSync({ points: response.totalPoints });
        }
        setChats((previous) =>
          [
            {
              ...chat,
              updatedAt: new Date(),
            },
            ...previous.filter((item) => item.id !== chat.id),
          ],
        );
        setMessages((previous) => [
          ...removeRetryPromptMessages(previous),
          response.botMessage,
        ]);
      } catch (sendError) {
        const readableError = getReadableError(
          sendError,
          "No se pudo enviar el mensaje al chatbot.",
        );

        setMessages((previous) => [
          ...removeRetryPromptMessages(previous),
          buildRetryPromptMessage(trimmed, readableError),
        ]);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    },
    [applyConversation, ensureCurrentChat, syncChatAfterSend],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      await sendMessageInternal(text, { appendUserMessage: true });
    },
    [sendMessageInternal],
  );

  const retryMessage = useCallback(
    async (text: string) => {
      await sendMessageInternal(text, { appendUserMessage: false });
    },
    [sendMessageInternal],
  );

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

      setMessages((previous) => [...previous, userAudioMessage]);
      setError(
        "El backend actual del chatbot solo soporta mensajes de texto por ahora.",
      );
    },
    [],
  );

  const resetConversation = useCallback(() => {
    currentChatRef.current = undefined;
    setChats([]);
    setCurrentChat(undefined);
    setMessages([]);
    setUsedTokens(0);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    chats,
    messages,
    recommendations,
    currentChat,
    isLoading,
    isBootstrapping,
    error,
    usedTokens,
    createNewChat,
    selectChat,
    renameExistingChat,
    deleteExistingChat,
    sendMessage,
    retryMessage,
    sendAudioMessage,
    resetConversation,
  };
}