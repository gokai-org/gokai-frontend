"use client";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ChatInput } from "@/features/chatbot/components/ChatInput";
import { ChatConversation } from "@/features/chatbot/components/ChatConversation";
import { useChatbotMock } from "@/features/chatbot/hooks/useChatbotMock";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

export default function ChatbotPage() {
  const {
    messages,
    isLoading,
    isBootstrapping,
    sendMessage,
    sendAudioMessage,
    resetConversation,
  } = useChatbotMock();

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  return (
    <DashboardShell
      useContainer={false}
      contentClassName="px-4 py-4 sm:px-6 sm:py-6"
      footer={
        <ChatInput
          onSendMessage={sendMessage}
          onSendAudioMessage={sendAudioMessage}
          disabled={isLoading}
          animationsEnabled={animationsEnabled}
          heavyAnimationsEnabled={heavyAnimationsEnabled}
        />
      }
    >
      <div className="mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-5xl">
        <ChatConversation
          messages={messages}
          isLoading={isLoading}
          isBootstrapping={isBootstrapping}
          animationsEnabled={animationsEnabled}
          heavyAnimationsEnabled={heavyAnimationsEnabled}
          onReset={resetConversation}
        />
      </div>
    </DashboardShell>
  );
}
