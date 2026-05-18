"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KazuSvgMascot } from "@/features/mascot";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ChatbotLockedPreview } from "@/features/chatbot/components/ChatbotLockedPreview";
import { ChatHistoryPanel } from "@/features/chatbot/components/ChatHistoryPanel";
import { ChatInput } from "@/features/chatbot/components/ChatInput";
import { ChatPointsBadge } from "@/features/chatbot/components/ChatPointsBadge";
import { ChatRecommendationsPanel } from "@/features/chatbot/components/ChatRecommendationsPanel";
import { ChatConversation } from "@/features/chatbot/components/ChatConversation";
import { ChatSurfacePanel } from "@/features/chatbot/components/ChatSurfacePanel";
import { ChatWritingPanel } from "@/features/chatbot/components/ChatWritingPanel";
import type { ChatMessage } from "@/features/chatbot/types";
import { useChatbot } from "@/features/chatbot/hooks/useChatbot";
import {
  HELP_GUIDE_CHATBOT_EVENT,
  type HelpGuideChatbotDetail,
} from "@/features/help/utils/guideEvents";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useResolvedPremiumAccess } from "@/shared/hooks/useResolvedPremiumAccess";
import { PremiumLockedView } from "@/shared/ui";

type DesktopPanelState =
  | { kind: "recommendations" }
  | { kind: "writing"; messageId: string };

function useDesktopLayout(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);

    const update = () => {
      setIsDesktop(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, [breakpoint]);

  return isDesktop;
}

function ChatbotExperience() {
  const {
    chats,
    messages,
    recommendations,
    currentChat,
    isLoading,
    isBootstrapping,
    error,
    createNewChat,
    selectChat,
    renameExistingChat,
    deleteExistingChat,
    sendMessage,
    retryMessage,
    resetConversation,
  } = useChatbot();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [desktopPanel, setDesktopPanel] = useState<DesktopPanelState | null>(null);
  const [mobileWritingMessage, setMobileWritingMessage] = useState<ChatMessage | null>(null);
  const [mobileRecommendationsAttention, setMobileRecommendationsAttention] =
    useState(false);
  const [recentlyCreatedChatId, setRecentlyCreatedChatId] = useState<string | null>(null);
  const previousChatIdRef = useRef<string | null>(null);
  const previousRecommendationIdsRef = useRef<string[] | null>(null);

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const isDesktop = useDesktopLayout();

  const handleRecommendationsToggle = () => {
    if (isDesktop) {
      setMobileRecommendationsAttention(false);
      setDesktopPanel((current) =>
        current?.kind === "recommendations" ? null : { kind: "recommendations" },
      );
      return;
    }

    setMobileRecommendationsAttention(false);
    setRecommendationsOpen(true);
  };

  const handleOpenWritingMessage = (message: ChatMessage) => {
    if (isDesktop) {
      setDesktopPanel({ kind: "writing", messageId: message.id });
      return;
    }

    setMobileWritingMessage(message);
  };

  const handleCreateNewChat = async () => {
    setMobileRecommendationsAttention(false);
    setHistoryOpen(true);
    const nextChat = await createNewChat();
    setRecentlyCreatedChatId(nextChat.id);
  };

  const handleSelectChat = async (chatId: string) => {
    setMobileRecommendationsAttention(false);
    await selectChat(chatId);
  };

  const desktopWritingMessage =
    desktopPanel?.kind === "writing"
      ? messages.find((message) => message.id === desktopPanel.messageId) ?? null
      : null;

  useEffect(() => {
    if (!recentlyCreatedChatId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRecentlyCreatedChatId((current) =>
        current === recentlyCreatedChatId ? null : current,
      );
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [recentlyCreatedChatId]);

  useEffect(() => {
    const handleHelpGuideChatbot = (event: Event) => {
      const customEvent = event as CustomEvent<HelpGuideChatbotDetail>;
      const action = customEvent.detail?.action;

      if (action === "open-recommendations") {
        if (isDesktop) {
          setDesktopPanel({ kind: "recommendations" });
          return;
        }

        setRecommendationsOpen(true);
        return;
      }

      if (action === "close-recommendations") {
        setDesktopPanel((current) =>
          current?.kind === "recommendations" ? null : current,
        );
        setRecommendationsOpen(false);
      }
    };

    window.addEventListener(HELP_GUIDE_CHATBOT_EVENT, handleHelpGuideChatbot);

    return () => {
      window.removeEventListener(
        HELP_GUIDE_CHATBOT_EVENT,
        handleHelpGuideChatbot,
      );
    };
  }, [isDesktop]);

  useEffect(() => {
    const currentChatId = currentChat?.id ?? null;
    const currentRecommendationIds = recommendations.map(
      (recommendation) => recommendation.id,
    );
    let frameId: number | null = null;

    if (previousChatIdRef.current !== currentChatId) {
      previousChatIdRef.current = currentChatId;
      previousRecommendationIdsRef.current = currentRecommendationIds;
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    const previousRecommendationIds = previousRecommendationIdsRef.current;
    previousRecommendationIdsRef.current = currentRecommendationIds;

    if (!previousRecommendationIds) {
      return;
    }

    const previousIds = new Set(previousRecommendationIds);
    const hasNewRecommendation = currentRecommendationIds.some(
      (recommendationId) => !previousIds.has(recommendationId),
    );

    if (!hasNewRecommendation) {
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    if (isDesktop) {
      frameId = window.requestAnimationFrame(() => {
        setDesktopPanel({ kind: "recommendations" });
      });

      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    frameId = window.requestAnimationFrame(() => {
      setMobileRecommendationsAttention(true);
    });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [currentChat?.id, isDesktop, recommendations]);

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
        onClick={() => void handleCreateNewChat()}
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
        onClick={handleRecommendationsToggle}
        data-help-target="chat-recommendations-trigger"
        className={[
          "relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border-default bg-surface-elevated text-content-secondary transition hover:border-[#b8bcc6] hover:bg-white hover:text-content-primary",
          desktopPanel?.kind === "recommendations"
            ? "border-[#b8bcc6] bg-white text-content-primary shadow-[0_10px_24px_-20px_rgba(15,23,42,0.45)]"
            : "",
          mobileRecommendationsAttention
            ? "border-red-500/40 bg-red-500/10 text-red-600 shadow-[0_0_0_6px_rgba(239,68,68,0.12)] animate-pulse dark:text-red-300"
            : "",
        ].join(" ")}
        aria-label={
          desktopPanel?.kind === "recommendations"
            ? "Cerrar recomendaciones"
            : "Abrir recomendaciones"
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3.8 2.55 5.16 5.7.83-4.13 4.03.97 5.68L12 16.8l-5.09 2.7.97-5.68-4.13-4.03 5.7-.83L12 3.8Z" />
        </svg>

        {mobileRecommendationsAttention ? (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
        ) : null}
      </button>

      <ChatPointsBadge />
    </>
  );

  return (
    <DashboardShell
      useContainer={false}
      contentClassName="overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
    >
      <motion.div
        layout
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="mx-auto flex h-full min-h-0 w-full max-w-[1680px] flex-col gap-4"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
          <motion.div
            layout
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className={[
              "relative min-h-[72dvh] min-w-0 lg:min-h-0",
              desktopPanel ? "flex-1 lg:basis-[58%]" : "mx-auto w-full max-w-[980px] flex-1",
            ].join(" ")}
          >
            <ChatConversation
              title="KAZU"
              currentChatName={currentChat?.name}
              messages={messages}
              isLoading={isLoading}
              isBootstrapping={isBootstrapping}
              error={error}
              headerActions={chatActions}
              footer={
                <ChatInput
                  onSendMessage={sendMessage}
                  disabled={isLoading || isBootstrapping}
                />
              }
              animationsEnabled={animationsEnabled}
              heavyAnimationsEnabled={heavyAnimationsEnabled}
              onReset={resetConversation}
              onOpenWritingMessage={handleOpenWritingMessage}
              onRetryMessage={retryMessage}
            />

            <ChatSurfacePanel
              open={historyOpen}
              title="Tus chats"
              subtitle="Crea conversaciones por tema, vuelve a una sesion anterior o limpia las que ya no necesites."
              onClose={() => setHistoryOpen(false)}
              mode="page"
            >
              <ChatHistoryPanel
                chats={chats}
                currentChatId={currentChat?.id}
                recentlyCreatedChatId={recentlyCreatedChatId}
                isBusy={isLoading || isBootstrapping}
                onCreateChat={handleCreateNewChat}
                onSelectChat={async (chatId) => {
                  await handleSelectChat(chatId);
                  setHistoryOpen(false);
                }}
                onRenameChat={renameExistingChat}
                onDeleteChat={deleteExistingChat}
              />
            </ChatSurfacePanel>
          </motion.div>

          <AnimatePresence initial={false} mode="popLayout">
            {desktopPanel ? (
              <motion.aside
                layout
                key={
                  desktopPanel.kind === "writing"
                    ? `desktop-writing-${desktopPanel.messageId}`
                    : "desktop-recommendations"
                }
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 48 }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                className="hidden min-h-[72dvh] min-w-0 flex-1 lg:block lg:min-h-0 lg:basis-[42%]"
              >
                {desktopPanel.kind === "recommendations" ? (
                  <ChatRecommendationsPanel
                    recommendations={recommendations}
                    onClose={() => setDesktopPanel(null)}
                  />
                ) : (
                  <ChatWritingPanel
                    message={desktopWritingMessage}
                    onClose={() => setDesktopPanel(null)}
                  />
                )}
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      <ChatSurfacePanel
        open={recommendationsOpen}
        title="Recomendaciones"
        subtitle="Este panel se actualiza con cada nueva sugerencia de estudio."
        onClose={() => setRecommendationsOpen(false)}
        mode="page"
      >
        <ChatRecommendationsPanel
          recommendations={recommendations}
        />
      </ChatSurfacePanel>

      <ChatSurfacePanel
        open={mobileWritingMessage !== null}
        title="Escritura"
        subtitle="Practica los simbolos del mensaje sin salir del flujo del chat."
        onClose={() => setMobileWritingMessage(null)}
        mode="page"
      >
        <ChatWritingPanel message={mobileWritingMessage} />
      </ChatSurfacePanel>
    </DashboardShell>
  );
}

export default function ChatbotPage() {
  const { accessResolved, isPremium } = useResolvedPremiumAccess();

  if (!accessResolved) {
    return (
      <DashboardShell
        useContainer={false}
        contentClassName="overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
      >
        <div className="flex h-full min-h-0 w-full max-w-[1680px] flex-col gap-4 lg:pr-4">
          <div className="overflow-hidden rounded-[32px] border border-[#BA5149]/14 bg-surface-primary/92">
            <ChatbotLockedPreview />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!isPremium) {
    return (
      <DashboardShell
        useContainer={false}
        contentClassName="overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
      >
        <div className="flex h-full min-h-0 w-full max-w-[1680px] flex-col gap-4 lg:pr-4">
          <PremiumLockedView
            preview={<ChatbotLockedPreview />}
            title="El chat con KAZU esta bloqueado"
            description="El chatbot premium incluye practica conversacional con IA, recomendaciones adaptativas y ejercicios guiados dentro del mismo flujo. Activa GOKAI+ para entrar a esta experiencia."
            primaryHref="/checkout?returnTo=%2Fdashboard%2Fchatbot"
            primaryLabel="Convertirte en Pro"
            secondaryHref="/auth/membership?from=dashboard&returnTo=%2Fdashboard%2Fchatbot"
            secondaryLabel="Ver planes"
            featureLabel="Chatbot premium"
            detailItems={[
              "Conversaciones ilimitadas",
              "Historial y recomendaciones",
              "Panel de escritura guiada",
            ]}
            caption="Desbloquea el chat completo con respuestas en tiempo real, recomendaciones contextuales y ejercicios conectados al mismo hilo."
            hero={
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-3 rounded-[22px] bg-white/12 blur-xl" />
                <div className="relative flex flex-col items-center gap-1.5">
                  <KazuSvgMascot
                    state="idle"
                    size={52}
                    reducedMotion
                    className="drop-shadow-none"
                  />
                  <span className="text-[10px] font-black tracking-[0.28em] text-white/92">
                    KAZU
                  </span>
                </div>
              </div>
            }
          />
        </div>
      </DashboardShell>
    );
  }

  return <ChatbotExperience />;
}
