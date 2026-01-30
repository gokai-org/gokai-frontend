"use client";

import { useEffect, useState } from "react";
import type { Kanji } from "@/types/content";
import { listKanjis } from "@/lib/api/content";
import { KanjiCard } from "@/components/kanji/KanjiCard";
import { KanjiDetailModal } from "@/components/kanji/KanjiDetailModal";

export default function KanjiPage() {
  const [data, setData] = useState<Kanji[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listKanjis();
        setData(res);
      } catch (e) {
        const error = e instanceof Error ? e : new Error("Error desconocido");
        setError(error?.message ?? "Error loading kanji");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">語</div>
          <p className="text-neutral-600">Cargando kanjis…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 text-red-500">!</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Kanjis</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {data.length} caracteres disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Kanjis */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.map((k) => (
            <KanjiCard
              key={k.id}
              kanji={k}
              onClick={() => setSelectedKanji(k)}
            />
          ))}
        </div>
      </div>

      {/* Modal de detalles */}
      <KanjiDetailModal
        kanji={selectedKanji}
        onClose={() => setSelectedKanji(null)}
      />
    </div>
  );
}
