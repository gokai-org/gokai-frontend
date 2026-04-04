export type MessageRole = "user" | "bot";

export interface ChatMessage {
  id: string;
  review_chat_id?: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  audioUrl?: string;
  audioDuration?: string;
  waveform?: number[];
}

export interface ReviewChat {
  id: string;
  user_id: string;
  name: string;
  created_at?: Date;
}

export interface ChatbotState {
  messages: ChatMessage[];
  currentChat?: ReviewChat;
  isLoading: boolean;
}

export interface SendMockMessagePayload {
  text: string;
}

export interface MockChatResponse {
  reply: ChatMessage;
}
