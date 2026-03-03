"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface NoticesBannerProps {
  totalCount: number;
  unreadCount: number;
  pinnedCount: number;
}

export default function NoticesBanner({
  totalCount,
  unreadCount,
  pinnedCount,
}: NoticesBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="relative overflow-hidden bg-gradient-to-r from-[#993331] to-[#7a2927] rounded-3xl p-8 md:p-10 text-white shadow-lg"
    >
      {/* decorativas */}
      <div className="absolute top-[-40px] right-[-20px] w-44 h-44 bg-white/5 rounded-full" />
      <div className="absolute bottom-[-30px] left-[30%] w-32 h-32 bg-white/5 rounded-full" />
      <div className="absolute top-[50%] right-[15%] w-20 h-20 bg-white/5 rounded-full" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Centro de notificaciones
            </h2>
            <p className="text-white/70 text-sm mt-0.5">
              No te pierdas ninguna actualización importante
            </p>
          </div>
        </div>

        {/* stats */}
        <div className="flex gap-6">
          {[
            { value: totalCount, label: "Total" },
            { value: unreadCount, label: "Sin leer" },
            { value: pinnedCount, label: "Fijadas" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6">
              {i > 0 && <div className="w-px h-10 bg-white/20 -ml-6" />}
              <div className="text-center">
                <div className="text-3xl font-extrabold">{stat.value}</div>
                <div className="text-xs text-white/60 font-medium mt-0.5">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
