"use client";

import { BellOff } from "lucide-react";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";

interface NoticeEmptyStateProps {
  searchQuery: string;
  showUnreadOnly: boolean;
  onReset: () => void;
}

export default function NoticeEmptyState({
  searchQuery,
  showUnreadOnly,
  onReset,
}: NoticeEmptyStateProps) {
  return (
    <AnimatedEntrance className="py-20">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <BellOff className="h-9 w-9 text-gray-300" />
        </div>

        <h3 className="mb-1 text-lg font-bold text-gray-900">
          {searchQuery
            ? "Sin resultados"
            : showUnreadOnly
              ? "¡Todo al día!"
              : "Sin notificaciones"}
        </h3>

        <p className="max-w-sm text-center text-sm text-gray-500">
          {searchQuery
            ? "No encontramos notificaciones que coincidan con tu búsqueda. Intenta con otros términos."
            : showUnreadOnly
              ? "No tienes notificaciones pendientes por leer. ¡Excelente!"
              : "Cuando haya novedades en tu aprendizaje, aparecerán aquí."}
        </p>

        {(searchQuery || showUnreadOnly) && (
          <button
            onClick={onReset}
            className="mt-4 text-xs font-bold text-[#993331] hover:underline"
          >
            Ver todas las notificaciones
          </button>
        )}
      </div>
    </AnimatedEntrance>
  );
}