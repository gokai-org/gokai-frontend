export type MessageRole = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  review_chat_id?: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  // Campos opcionales para mensajes de audio (CHECAR DESPUÉS)
  audioUrl?: string;
  audioDuration?: string;
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
  isRecording: boolean;
}
