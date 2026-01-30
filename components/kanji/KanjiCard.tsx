import type { Kanji } from "@/types/content";

interface KanjiCardProps {
  kanji: Kanji;
  onClick: () => void;
}

export function KanjiCard({ kanji, onClick }: KanjiCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-xl border-2 border-neutral-200 p-6 hover:border-[#993331] hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* Símbolo Kanji */}
      <div className="text-5xl font-bold text-center text-neutral-900 mb-3">
        {kanji.symbol}
      </div>

      {/* Significado principal */}
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-700 line-clamp-1">
          {kanji.meanings[0]}
        </p>
        {kanji.meanings.length > 1 && (
          <p className="text-xs text-neutral-500 mt-1">
            +{kanji.meanings.length - 1} más
          </p>
        )}
      </div>

      {/* Puntos */}
      <div className="mt-3 flex items-center justify-center gap-1">
        <span className="text-xs font-semibold text-[#993331]">
          {kanji.points_to_unlock}
        </span>
        <span className="text-xs text-neutral-500">pts</span>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-[#993331] opacity-0 group-hover:opacity-5 rounded-xl transition-opacity" />
    </button>
  );
}
