import { apiFetch } from "@/shared/lib/api/client";
import type {
  ChatConversationData,
  ChatMessage,
  ChatSendResult,
  ChatbotRecommendation,
  CreateChatPayload,
  MockChatResponse,
  RenameChatPayload,
  ReviewChat,
  SendChatMessagePayload,
  SendMockMessagePayload,
} from "@/features/chatbot/types";
import { mockBotReplies } from "@/features/chatbot/utils/chatbotMocks";

type ChatbotApiRecommendation = {
  id: string;
  recommendedLessonId: string;
  reviewChatId: string;
  lessonType: string;
  entityId: string;
  description: string;
  createdAt: string;
};

type ChatbotApiMessage = {
  id: string;
  reviewChatId: string;
  content: string;
  sender: string;
  createdAt: string;
};

type ChatbotApiChat = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
};

type ChatbotApiChatDetail = {
  id: string;
  userId: string;
  name: string;
  usedTokens: number;
  createdAt: string;
  messages?: ChatbotApiMessage[] | null;
  recommendations?: ChatbotApiRecommendation[] | null;
};

type CreateChatResponse = {
  chatId: string;
};

type SendChatMessageResponse = {
  userMessageId: string;
  botMessageId: string;
  answer: string;
  recommendation?: ChatbotApiRecommendation[] | null;
  recommendations?: ChatbotApiRecommendation[] | null;
  similarity?: number;
  similatiry?: number;
  usedTokens: number;
};

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const DEFAULT_RECOMMENDATION_MESSAGE =
  "He actualizado recomendaciones para ti segun los temas de tu mensaje!";

const DEFAULT_RECOMMENDATION_MESSAGE_ACCENTED =
  "He actualizado recomendaciones para ti según los temas de tu mensaje!";

const RECOMMENDATION_PREFIX_PATTERN =
  /^He actualizado recomendaciones para ti seg[uú]n los temas de tu mensaje[!.]?\s*/i;

const INLINE_RECOMMENDATION_SENTENCE_PATTERN =
  /\s*Como parte de tus nuevas recomendaciones,[^.?!]*[.?!]\s*/gi;

const EXTRA_RECOMMENDATION_SENTENCE_PATTERN =
  /\s*(?:Tambi[eé]n|Adem[aá]s),?[^.?!]*recomendaci[^.?!]*[.?!]\s*/gi;

const TRANSIENT_CHATBOT_HIGH_DEMAND_PATTERN =
  /high demand|status:\s*UNAVAILABLE|Error\s*503/i;

const CHATBOT_RETRY_DELAYS_MS = [1200, 2500] as const;

function waitForRetry(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientChatbotOverload(error: unknown) {
  return (
    error instanceof Error &&
    TRANSIENT_CHATBOT_HIGH_DEMAND_PATTERN.test(error.message)
  );
}

function normalizeBotAnswer(
  answer: string,
  recommendations: ChatbotRecommendation[],
) {
  const trimmed = answer.trim();

  if (
    recommendations.length > 0 &&
    (trimmed === DEFAULT_RECOMMENDATION_MESSAGE ||
      trimmed === DEFAULT_RECOMMENDATION_MESSAGE_ACCENTED)
  ) {
    return "Ya actualizamos tu espacio de estudio. Si quieres, seguimos practicando con otra frase o una nueva pregunta.";
  }

  if (recommendations.length === 0) {
    return trimmed;
  }

  const cleaned = trimmed
    .replace(RECOMMENDATION_PREFIX_PATTERN, "")
    .replace(INLINE_RECOMMENDATION_SENTENCE_PATTERN, " ")
    .replace(EXTRA_RECOMMENDATION_SENTENCE_PATTERN, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || trimmed;
}

function parseDate(value?: string | null) {
  return value ? new Date(value) : new Date();
}

function normalizeRecommendation(
  recommendation: ChatbotApiRecommendation,
): ChatbotRecommendation {
  return {
    id: recommendation.id,
    recommendedLessonId: recommendation.recommendedLessonId,
    reviewChatId: recommendation.reviewChatId,
    lessonType: recommendation.lessonType,
    entityId: recommendation.entityId,
    description: recommendation.description,
    createdAt: parseDate(recommendation.createdAt),
  };
}

function normalizeRecommendations(
  recommendations?: ChatbotApiRecommendation[] | null,
) {
  return (recommendations ?? []).map(normalizeRecommendation);
}

function normalizeChat(chat: ChatbotApiChat): ReviewChat {
  return {
    id: chat.id,
    userId: chat.userId,
    name: chat.name,
    createdAt: parseDate(chat.createdAt),
    updatedAt: parseDate(chat.updatedAt),
  };
}

function normalizeMessage(message: ChatbotApiMessage): ChatMessage {
  return {
    id: message.id,
    reviewChatId: message.reviewChatId,
    content: message.content,
    role: message.sender === "user" ? "user" : "bot",
    timestamp: parseDate(message.createdAt),
  };
}

function attachRecommendationsToMessages(
  messages: ChatMessage[],
  recommendations: ChatbotRecommendation[],
): ChatMessage[] {
  if (recommendations.length === 0) {
    return messages;
  }

  const lastBotIndex = [...messages]
    .reverse()
    .findIndex((message) => message.role === "bot");

  if (lastBotIndex === -1) {
    return [
      ...messages,
      {
        id: `recommendations-${recommendations[0]?.id ?? Date.now()}`,
        role: "bot" as const,
        content:
          "Ya actualizamos tu espacio de estudio. Si quieres, seguimos practicando con otra frase o una nueva pregunta.",
        timestamp: recommendations[0]?.createdAt ?? new Date(),
        recommendations,
      } satisfies ChatMessage,
    ];
  }

  const normalizedIndex = messages.length - 1 - lastBotIndex;
  return messages.map((message, index) =>
    index === normalizedIndex
      ? {
          ...message,
          content: normalizeBotAnswer(message.content, recommendations),
          recommendations,
        }
      : message,
  );
}

export async function listChats() {
  const chats = await apiFetch<ChatbotApiChat[]>("/api/study/chatbot");

  return chats
    .map(normalizeChat)
    .sort(
      (left, right) =>
        (right.updatedAt ?? right.createdAt).getTime() -
        (left.updatedAt ?? left.createdAt).getTime(),
    );
}

export async function createChat(payload: CreateChatPayload) {
  return apiFetch<CreateChatResponse>("/api/study/chatbot", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getChatById(chatId: string): Promise<ChatConversationData> {
  const response = await apiFetch<ChatbotApiChatDetail>(
    `/api/study/chatbot/${chatId}`,
  );

  const messages = (response.messages ?? []).map(normalizeMessage);
  const recommendations = normalizeRecommendations(response.recommendations);

  return {
    chat: {
      id: response.id,
      userId: response.userId,
      name: response.name,
      createdAt: parseDate(response.createdAt),
    },
    messages: attachRecommendationsToMessages(messages, recommendations),
    usedTokens: response.usedTokens,
  };
}

export async function sendChatMessage(
  chatId: string,
  payload: SendChatMessagePayload,
): Promise<ChatSendResult> {
  let response: SendChatMessageResponse | null = null;

  for (let attempt = 0; attempt <= CHATBOT_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      response = await apiFetch<SendChatMessageResponse>(
        `/api/study/chatbot/${chatId}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      break;
    } catch (error) {
      if (
        !isTransientChatbotOverload(error) ||
        attempt === CHATBOT_RETRY_DELAYS_MS.length
      ) {
        if (isTransientChatbotOverload(error)) {
          throw new Error(
            "KAZU está con mucha demanda en este momento. Intenta de nuevo en unos segundos.",
          );
        }

        throw error;
      }

      await waitForRetry(CHATBOT_RETRY_DELAYS_MS[attempt]);
    }
  }

  if (!response) {
    throw new Error(
      "No se pudo obtener respuesta del chatbot en este momento.",
    );
  }

  const recommendations = normalizeRecommendations(
    response.recommendation ?? response.recommendations,
  );

  return {
    userMessageId: response.userMessageId,
    botMessage: {
      id: response.botMessageId,
      reviewChatId: chatId,
      role: "bot",
      content: normalizeBotAnswer(response.answer, recommendations),
      timestamp: new Date(),
      recommendations,
    },
    usedTokens: response.usedTokens,
    similarity: response.similarity ?? response.similatiry,
  };
}

export async function renameChat(chatId: string, payload: RenameChatPayload) {
  return apiFetch<unknown>(`/api/study/chatbot/${chatId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteChat(chatId: string) {
  return apiFetch<unknown>(`/api/study/chatbot/${chatId}`, {
    method: "DELETE",
  });
}

export async function sendMockMessage({
  text,
}: SendMockMessagePayload): Promise<MockChatResponse> {
  await wait(900);

  const content =
    mockBotReplies[Math.floor(Math.random() * mockBotReplies.length)];

  const reply: ChatMessage = {
    id: `${Date.now()}-bot`,
    role: "bot",
    content:
      text.trim().length > 0
        ? `${content}\n\nTu mensaje fue: “${text.trim()}”`
        : content,
    timestamp: new Date(),
  };

  return { reply };
}
