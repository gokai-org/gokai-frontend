"use client";

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
  const stats = [
    { value: totalCount, label: "Total" },
    { value: unreadCount, label: "Sin leer" },
    { value: pinnedCount, label: "Fijadas" },
  ];

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-accent to-accent-hover p-6 text-content-inverted shadow-lg sm:p-8 lg:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            "radial-gradient(ellipse at 72% -8%, rgba(255,255,255,0.20) 0%, transparent 52%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            "radial-gradient(ellipse at 12% 108%, rgba(255,255,255,0.11) 0%, transparent 48%)",
        }}
      />
      <div className="absolute right-[-20px] top-[-40px] h-44 w-44 rounded-full bg-surface-primary/8" />
      <div className="absolute bottom-[-30px] left-[30%] h-32 w-32 rounded-full bg-surface-primary/6" />
      <div className="absolute right-[12%] top-[50%] h-20 w-20 rounded-full bg-surface-primary/5" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-primary/15 backdrop-blur-sm">
              <Sparkles className="h-7 w-7 text-content-inverted" />
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Panel general
              </p>

              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-content-inverted sm:text-3xl">
                Centro de notificaciones
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-[15px]">
                No te pierdas ninguna actualización importante sobre tus
                lecciones, revisiones, logros y actividad reciente.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-[24px] border border-white/10 bg-surface-primary/8 p-3 backdrop-blur-sm sm:gap-4 sm:p-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-[72px] rounded-2xl bg-surface-primary/6 px-3 py-3 text-center"
            >
              <div className="text-2xl font-extrabold leading-none text-content-inverted sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-[11px] font-semibold text-white/70 sm:text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
