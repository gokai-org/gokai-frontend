"use client";

import { useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ChatHistoryPanel } from "@/features/chatbot/components/ChatHistoryPanel";
import { ChatInput } from "@/features/chatbot/components/ChatInput";
import { ChatRecommendationsPanel } from "@/features/chatbot/components/ChatRecommendationsPanel";
import { ChatConversation } from "@/features/chatbot/components/ChatConversation";
import { ChatSurfacePanel } from "@/features/chatbot/components/ChatSurfacePanel";
import { ChatTracingBoard } from "@/features/chatbot";
import { useChatbot } from "@/features/chatbot/hooks/useChatbot";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

export default function ChatbotPage() {
  const {
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
    sendAudioMessage,
    resetConversation,
  } = useChatbot();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [tracingOpen, setTracingOpen] = useState(false);

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  const chatActions = (
    <>
      <button
        type="button"
        onClick={() => setHistoryOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border-default bg-surface-elevated px-3 text-sm font-semibold text-content-secondary transition hover:border-accent/20 hover:text-accent"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 7h16" />
          <path d="M4 12h10" />
          <path d="M4 17h12" />
        </svg>
        <span className="hidden sm:inline">Chats</span>
      </button>

      <button
        type="button"
        onClick={() => void createNewChat()}
        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-3 text-sm font-semibold text-content-inverted transition hover:bg-accent-hover"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <span className="hidden sm:inline">Nuevo</span>
      </button>

      <button
        type="button"
        onClick={() => setRecommendationsOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border-default bg-surface-elevated text-content-secondary transition hover:border-accent/20 hover:text-accent lg:hidden"
        aria-label="Abrir recomendaciones"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 5h12" />
          <path d="M6 12h12" />
          <path d="M6 19h8" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setTracingOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border-default bg-surface-elevated text-content-secondary transition hover:border-accent/20 hover:text-accent lg:hidden"
        aria-label="Abrir trazado"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="m4 20 5.5-1.5L19 9a2.12 2.12 0 1 0-3-3l-9.5 9.5Z" />
          <path d="M13.5 6.5 17 10" />
        </svg>
      </button>
    </>
  );

  return (
    <DashboardShell
      useContainer={false}
      contentClassName="overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-4 lg:flex-row">
        <div className="relative min-h-[72dvh] min-w-0 flex-1 lg:min-h-0 lg:basis-1/2">
          <ChatConversation
            title="Sensei AI"
            currentChatName={currentChat?.name}
            usedTokens={usedTokens}
            messages={messages}
            isLoading={isLoading}
            isBootstrapping={isBootstrapping}
            error={error}
            headerActions={chatActions}
            footer={
              <ChatInput
                onSendMessage={sendMessage}
                onSendAudioMessage={sendAudioMessage}
                disabled={isLoading || isBootstrapping}
                animationsEnabled={animationsEnabled}
                heavyAnimationsEnabled={heavyAnimationsEnabled}
              />
            }
            animationsEnabled={animationsEnabled}
            heavyAnimationsEnabled={heavyAnimationsEnabled}
            onReset={resetConversation}
          />

          <ChatSurfacePanel
            open={historyOpen}
            title="Tus chats"
            subtitle="Crea conversaciones por tema, vuelve a una sesion anterior o limpia las que ya no necesites."
            onClose={() => setHistoryOpen(false)}
            mode="contained"
          >
            <ChatHistoryPanel
              chats={chats}
              currentChatId={currentChat?.id}
              isBusy={isLoading || isBootstrapping}
              onCreateChat={async () => {
                await createNewChat();
                setHistoryOpen(false);
              }}
              onSelectChat={async (chatId) => {
                await selectChat(chatId);
                setHistoryOpen(false);
              }}
              onRenameChat={renameExistingChat}
              onDeleteChat={deleteExistingChat}
            />
          </ChatSurfacePanel>
        </div>

        <aside className="hidden min-h-0 flex-1 basis-1/2 flex-col gap-4 lg:flex">
          <div className="min-h-0 flex-1">
            <ChatRecommendationsPanel
              recommendations={recommendations}
              currentChatName={currentChat?.name}
            />
          </div>

          <div className="min-h-0 flex-1">
            <ChatTracingBoard messages={messages} />
          </div>
        </aside>
      </div>

      <ChatSurfacePanel
        open={recommendationsOpen}
        title="Recomendaciones"
        subtitle="Este panel se actualiza con cada nueva sugerencia de estudio."
        onClose={() => setRecommendationsOpen(false)}
        mode="page"
      >
        <ChatRecommendationsPanel
          recommendations={recommendations}
          currentChatName={currentChat?.name}
        />
      </ChatSurfacePanel>

      <ChatSurfacePanel
        open={tracingOpen}
        title="Trazado"
        subtitle="Practica caracteres japoneses sin salir del flujo del chatbot."
        onClose={() => setTracingOpen(false)}
        mode="page"
      >
        <ChatTracingBoard messages={messages} />
      </ChatSurfacePanel>
    </DashboardShell>
  );
}
