"use client";

import { BookOpen } from "lucide-react";

export default function GrammarEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 dark:bg-pink-950/30">
        <BookOpen className="h-7 w-7 text-pink-400 dark:text-pink-500" />
      </div>
      <p className="text-sm font-medium text-content-secondary">
        Aun no hay lecciones de gramatica disponibles
      </p>
      <p className="text-xs text-content-muted">Vuelve pronto</p>
    </div>
  );
}
