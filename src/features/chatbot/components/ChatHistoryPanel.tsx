"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useMemo, useState } from "react";
import type { ReviewChat } from "@/features/chatbot/types";
import { AnswerConfirmationPanel } from "@/shared/ui";

interface ChatHistoryPanelProps {
  chats: ReviewChat[];
  currentChatId?: string;
  recentlyCreatedChatId?: string | null;
  isBusy?: boolean;
  onCreateChat: () => Promise<void> | void;
  onSelectChat: (chatId: string) => Promise<void> | void;
  onRenameChat: (chatId: string, name: string) => Promise<void> | void;
  onDeleteChat: (chatId: string) => Promise<void> | void;
}

function formatRelativeDate(date?: Date) {
  if (!date) {
    return "Sin actividad reciente";
  }

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatHistoryPanel({
  chats,
  currentChatId,
  recentlyCreatedChatId,
  isBusy = false,
  onCreateChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}: ChatHistoryPanelProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [pendingDeleteChat, setPendingDeleteChat] = useState<ReviewChat | null>(null);
  const empty = chats.length === 0;

  const orderedChats = useMemo(
    () =>
      [...chats].sort(
        (left, right) =>
          (right.updatedAt ?? right.createdAt).getTime() -
          (left.updatedAt ?? left.createdAt).getTime(),
      ),
    [chats],
  );

  const handleCloseDeleteDialog = (
    event?: ReactMouseEvent<HTMLDivElement> | ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event?.stopPropagation();
    setPendingDeleteChat(null);
  };

  return (
    <div className="relative flex h-full flex-col bg-surface-primary">
      <div className="shrink-0 border-b border-border-subtle px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={() => void onCreateChat()}
          disabled={isBusy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-content-inverted transition hover:bg-accent-hover disabled:opacity-60"
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
          Nuevo chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        {empty ? (
          <div className="rounded-[24px] border border-dashed border-border-default bg-surface-elevated px-5 py-8 text-center">
            <h4 className="text-base font-bold text-content-primary">
              Aun no tienes conversaciones
            </h4>
            <p className="mt-2 text-sm leading-6 text-content-tertiary">
              Crea un chat nuevo para separar temas, practicar distinto vocabulario o llevar conversaciones por objetivo.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {orderedChats.map((chat) => {
              const isCurrent = chat.id === currentChatId;
              const isEditing = editingChatId === chat.id;
              const isRecentlyCreated = chat.id === recentlyCreatedChatId;

              return (
                <motion.div
                  layout
                  key={chat.id}
                  initial={
                    isRecentlyCreated
                      ? { opacity: 0, y: -18, scale: 0.96 }
                      : false
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isRecentlyCreated ? [1, 1.015, 1] : 1,
                  }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{
                    duration: isRecentlyCreated ? 0.38 : 0.2,
                    ease: [0.22, 1, 0.36, 1],
                    layout: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className={[
                    "mb-3 rounded-[24px] border px-4 py-4 transition",
                    isCurrent
                      ? "border-accent/30 bg-accent/5"
                      : "border-border-subtle bg-surface-elevated",
                    isRecentlyCreated
                      ? "shadow-[0_18px_46px_-26px_rgba(186,81,73,0.42)] ring-1 ring-accent/20"
                      : "",
                  ].join(" ")}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        autoFocus
                        className="w-full rounded-2xl border border-border-default bg-surface-primary px-4 py-3 text-sm text-content-primary outline-none transition focus:border-accent/30"
                        placeholder="Nombre del chat"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChatId(null);
                            setDraftName("");
                          }}
                          className="rounded-full border border-border-default px-3 py-2 text-xs font-semibold text-content-secondary transition hover:bg-surface-primary"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await onRenameChat(chat.id, draftName);
                            setEditingChatId(null);
                            setDraftName("");
                          }}
                          className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-content-inverted transition hover:bg-accent-hover"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void onSelectChat(chat.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate text-sm font-bold text-content-primary sm:text-base">
                                {chat.name}
                              </h4>
                              {isCurrent ? (
                                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                                  Abierto
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-content-tertiary">
                              {formatRelativeDate(chat.updatedAt ?? chat.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChatId(chat.id);
                            setDraftName(chat.name);
                          }}
                          className="rounded-full border border-border-default px-3 py-2 text-xs font-semibold text-content-secondary transition hover:border-accent/20 hover:text-accent"
                        >
                          Renombrar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteChat(chat)}
                          className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Borrar
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {pendingDeleteChat ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/58 p-4 backdrop-blur-sm"
            onClick={handleCloseDeleteDialog}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-md"
              onClick={(event) => event.stopPropagation()}
            >
              <AnswerConfirmationPanel
                title="Borrar chat"
                description={`Si continúas, eliminarás “${pendingDeleteChat.name}” y ya no aparecerá en tu historial.`}
                confirmLabel="Borrar"
                onConfirm={async () => {
                  await onDeleteChat(pendingDeleteChat.id);
                  setPendingDeleteChat(null);
                }}
                disabled={isBusy}
                tone="grammar"
                secondaryAction={{
                  label: "Conservar chat",
                  onAction: () => setPendingDeleteChat(null),
                  disabled: isBusy,
                }}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}