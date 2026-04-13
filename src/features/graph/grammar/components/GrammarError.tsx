"use client";

import { XCircle, RefreshCw } from "lucide-react";

interface GrammarErrorProps {
  message: string;
  onRetry?: () => void;
}

export default function GrammarError({ message, onRetry }: GrammarErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <XCircle className="h-10 w-10 text-pink-400 dark:text-pink-500" />
      <p className="text-sm text-content-secondary max-w-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-pink-50 dark:bg-pink-950/30 px-4 py-2 text-sm font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-950/50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}
