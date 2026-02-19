"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  PenTool,
  Headphones,
  CheckCircle2,
  Zap,
  type LucideIcon,
} from "lucide-react";

/*  Types  */

export interface ActivityItem {
  id: string;
  type: "kanji" | "vocabulary" | "grammar" | "listening" | "review";
  title: string;
  description: string;
  time: string;
  score?: number;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  title?: string;
}

/*  Icon map  */

const iconMap: Record<ActivityItem["type"], LucideIcon> = {
  kanji: PenTool,
  vocabulary: BookOpen,
  grammar: CheckCircle2,
  listening: Headphones,
  review: Zap,
};

const colorMap: Record<ActivityItem["type"], string> = {
  kanji: "bg-[#993331]/10 text-[#993331]",
  vocabulary: "bg-amber-50 text-amber-600",
  grammar: "bg-emerald-50 text-emerald-600",
  listening: "bg-blue-50 text-blue-600",
  review: "bg-purple-50 text-purple-600",
};

/*  Defaults  */

const defaultActivities: ActivityItem[] = [
  {
    id: "1",
    type: "kanji",
    title: "Kanji: 森 · 林 · 木",
    description: "Completaste una sesión de kanji",
    time: "Hace 2 min",
    score: 95,
  },
  {
    id: "2",
    type: "vocabulary",
    title: "Vocabulario N4",
    description: "20 palabras nuevas aprendidas",
    time: "Hace 15 min",
    score: 88,
  },
  {
    id: "3",
    type: "listening",
    title: "Escucha activa",
    description: "Diálogo de nivel intermedio",
    time: "Hace 1h",
    score: 76,
  },
  {
    id: "4",
    type: "review",
    title: "Repaso espaciado",
    description: "45 tarjetas revisadas",
    time: "Hace 3h",
    score: 92,
  },
  {
    id: "5",
    type: "grammar",
    title: "Gramática: てform",
    description: "Ejercicios de conjugación",
    time: "Hace 5h",
    score: 84,
  },
];

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
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

function ActivityRow({ activity }: { activity: ActivityItem }) {
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
        <p className="text-xs text-gray-400">{activity.time}</p>
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
  activities = defaultActivities,
  title = "Actividad reciente",
}: RecentActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
        <button className="text-xs font-bold text-[#993331] hover:underline">
          Ver todo
        </button>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="divide-y divide-gray-50"
      >
        {activities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} />
        ))}
      </motion.div>
    </motion.div>
  );
}
