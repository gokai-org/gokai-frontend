export type MessageRole = 'user' | 'bot';

export type MessageContent = {
  type: 'text' | 'audio';
  text?: string;
  audioUrl?: string;
  audioDuration?: string;
};

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: MessageContent;
  timestamp: Date;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  isRecording: boolean;
}
