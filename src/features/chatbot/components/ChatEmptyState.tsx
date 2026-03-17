"use client";

import { PrimaryActionButton } from "@/shared/ui/PrimaryActionButton";

interface ChatEmptyStateProps {
  onReset?: () => void;
}

export function ChatEmptyState({ onReset }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="w-full max-w-xl rounded-[28px] border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#993331]/10">
          <svg
            className="h-7 w-7 text-[#993331]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h8M8 14h5m-8 6h14a2 2 0 0 0 2-2V8.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 14.172 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-extrabold text-gray-900">
          No hay mensajes todavía
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
          Inicia una conversación con Sensei AI para practicar frases, repasar
          vocabulario o simular una interacción rápida.
        </p>
      </div>
    </div>
  );
}