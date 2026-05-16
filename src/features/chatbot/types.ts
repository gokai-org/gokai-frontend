export type MessageRole = "user" | "bot";
export type ChatMessageVariant = "default" | "error";

export interface ChatbotRecommendation {
  id: string;
  recommendedLessonId: string;
  reviewChatId: string;
  lessonType: string;
  entityId: string;
  description: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  reviewChatId?: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  variant?: ChatMessageVariant;
  retryText?: string;
  recommendations?: ChatbotRecommendation[];
  audioUrl?: string;
  audioDuration?: string;
  waveform?: number[];
}

export interface ReviewChat {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ChatConversationData {
  chat: ReviewChat;
  messages: ChatMessage[];
  usedTokens: number;
}

export interface CreateChatPayload {
  name: string;
}

export interface RenameChatPayload {
  name: string;
}

export interface SendChatMessagePayload {
  content: string;
}

export interface ChatSendResult {
  userMessageId: string;
  botMessage: ChatMessage;
  usedTokens: number;
  similarity?: number;
  pointsAwarded?: number;
  totalPoints?: number;
}

export interface ChatbotState {
  chats: ReviewChat[];
  messages: ChatMessage[];
  recommendations: ChatbotRecommendation[];
  currentChat?: ReviewChat;
  isLoading: boolean;
  isBootstrapping?: boolean;
  error?: string | null;
}

export interface SendMockMessagePayload {
  text: string;
}

export interface MockChatResponse {
  reply: ChatMessage;
}
