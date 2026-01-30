import type { Kanji } from "@/types/content";

interface KanjiDetailModalProps {
  kanji: Kanji | null;
  onClose: () => void;
}

export function KanjiDetailModal({ kanji, onClose }: KanjiDetailModalProps) {
  if (!kanji) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">
            Detalles del Kanji
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 transition"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Símbolo grande */}
          <div className="text-center">
            <div className="text-8xl font-bold text-neutral-900 mb-4">
              {kanji.symbol}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#993331]/10 rounded-full">
              <span className="text-sm font-semibold text-[#993331]">
                {kanji.points_to_unlock} puntos
              </span>
            </div>
          </div>

          {/* Lecturas */}
          <div>
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide mb-3">
              Lecturas
            </h3>
            <div className="flex flex-wrap gap-2">
              {kanji.readings.map((reading, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                >
                  {reading}
                </span>
              ))}
            </div>
          </div>

          {/* Significados */}
          <div>
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide mb-3">
              Significados
            </h3>
            <div className="flex flex-wrap gap-2">
              {kanji.meanings.map((meaning, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                >
                  {meaning}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
