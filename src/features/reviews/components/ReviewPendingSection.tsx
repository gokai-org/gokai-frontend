"use client";

import { motion } from "framer-motion";

import { SectionHeader } from "@/shared/ui/SectionHeader";

import type { ReviewItem } from "../types";
import { ReviewItemList } from "./ReviewItemList";

interface ReviewPendingSectionProps {
  loading: boolean;
  error: string | null;
  items: ReviewItem[];
  onStart: (itemId: string) => void;
}

export function ReviewPendingSection({
  loading,
  error,
  items,
  onStart,
}: ReviewPendingSectionProps) {
  return (
    <>
      <SectionHeader
        className="mb-5"
        title={
          <>
            Repasos <span className="text-[#993331]">Pendientes</span>
          </>
        }
        titleClassName="text-2xl font-extrabold tracking-tight text-gray-900"
        subtitle="Una lección de cada tipo lista para reforzar"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="flex items-center gap-5">
                <div className="w-[72px] h-[72px] rounded-2xl bg-gray-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="w-24 h-10 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
        >
          <p className="text-red-600 font-bold">{error}</p>
          <p className="text-red-500 text-sm mt-1">
            Intenta recargar la página
          </p>
        </motion.div>
      ) : (
        <ReviewItemList items={items} onStart={onStart} />
      )}
    </>
  );
}
