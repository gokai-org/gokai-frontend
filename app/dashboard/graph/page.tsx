"use client";

import { useEffect, useState } from "react";
import type { Kanji } from "@/types/content";
import { listKanjis } from "@/lib/api/content";

export default function KanjiPage() {
  const [data, setData] = useState<Kanji[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="p-6">Cargando kanjis…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Kanjis</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((k) => (
          <div key={k.id} className="rounded-lg border p-3">
            <div className="text-3xl">{k.symbol}</div>
            <div className="text-xs text-gray-500 mt-2">Points: {k.points_to_unlock}</div>
          </div>
        ))}
      </div>
    </div>
  );
}