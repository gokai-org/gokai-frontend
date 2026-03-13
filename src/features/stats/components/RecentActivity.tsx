"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  PenTool,
  CheckCircle2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { RecentActivityEntry } from "@/features/stats/types";
import { timeAgo } from "@/features/stats/utils/timeAgo";

/*  Types  */

interface RecentActivityProps {
  activities?: RecentActivityEntry[] | null;
  title?: string;
  loading?: boolean;
}

/*  Icon map  */

const iconMap: Record<RecentActivityEntry["type"], LucideIcon> = {
  kanji: PenTool,
  hiragana: BookOpen,
  katakana: BookOpen,
  vocabulary: BookOpen,
  grammar: CheckCircle2,
  review: Zap,
};

const colorMap: Record<RecentActivityEntry["type"], string> = {
  kanji: "bg-[#993331]/10 text-[#993331]",
  hiragana: "bg-amber-50 text-amber-600",
  katakana: "bg-sky-50 text-sky-600",
  vocabulary: "bg-emerald-50 text-emerald-600",
  grammar: "bg-purple-50 text-purple-600",
  review: "bg-blue-50 text-blue-600",
};

/*  Defaults  */

const defaultActivities: RecentActivityEntry[] = [];

/*  Item row  */

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function ActivityRow({ activity }: { activity: RecentActivityEntry }) {
  const Icon = iconMap[activity.type];
  const colorClass = colorMap[activity.type];

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors cursor-default"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {activity.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs text-gray-400">{timeAgo(activity.created_at)}</p>
        {activity.score !== undefined && (
          <p className="text-sm font-extrabold text-[#993331]">
            {activity.score}%
          </p>
        )}
      </div>
    </motion.div>
  );
}

/*   Main  */

export function RecentActivity({
  activities,
  title = "Actividad reciente",
  loading,
}: RecentActivityProps) {
  const MAX_ITEMS = 8;
  const items = (activities ?? defaultActivities).slice(0, MAX_ITEMS);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">{title}</h3>
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#993331]/10 flex items-center justify-center">
            <Zap className="w-7 h-7 text-[#993331]/40" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            Nada por aquí todavía
          </p>
          <p className="text-xs text-gray-400 text-center max-w-[220px]">
            Tus lecciones de kanji, kana, gramática y repasos aparecerán aquí en
            tiempo real.
          </p>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="divide-y divide-gray-50"
      >
        {items.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} />
        ))}
      </motion.div>
    </motion.div>
  );
}
