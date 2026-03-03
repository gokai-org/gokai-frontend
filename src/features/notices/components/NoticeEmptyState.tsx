"use client";

import { motion } from "framer-motion";
import { BellOff } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <BellOff className="w-9 h-9 text-gray-300" />
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-1">
        {searchQuery
          ? "Sin resultados"
          : showUnreadOnly
          ? "¡Todo al día!"
          : "Sin notificaciones"}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">
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
    </motion.div>
  );
}
