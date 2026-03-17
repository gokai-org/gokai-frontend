import type {
  MockChatResponse,
  SendMockMessagePayload,
  ChatMessage,
} from "@/features/chatbot/types";
import { mockBotReplies } from "@/features/chatbot/utils/chatbotMocks";

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

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