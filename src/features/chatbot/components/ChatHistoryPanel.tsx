"use client";

import { useMemo, useState } from "react";
import type { ReviewChat } from "@/features/chatbot/types";

interface ChatHistoryPanelProps {
  chats: ReviewChat[];
  currentChatId?: string;
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
  isBusy = false,
  onCreateChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}: ChatHistoryPanelProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
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

  return (
    <div className="flex h-full flex-col bg-surface-primary">
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
          <div className="space-y-3">
            {orderedChats.map((chat) => {
              const isCurrent = chat.id === currentChatId;
              const isEditing = editingChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  className={[
                    "rounded-[24px] border px-4 py-4 transition",
                    isCurrent
                      ? "border-accent/30 bg-accent/5"
                      : "border-border-subtle bg-surface-elevated",
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
                          onClick={async () => {
                            if (!window.confirm("Se eliminara este chat de forma permanente.")) {
                              return;
                            }

                            await onDeleteChat(chat.id);
                          }}
                          className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Borrar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}