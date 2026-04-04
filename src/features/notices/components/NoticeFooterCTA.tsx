"use client";

import { Bell, Settings } from "lucide-react";

export default function NoticeFooterCTA() {
  return (
    <div className="rounded-3xl border border-border-subtle bg-surface-primary p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
          <Bell className="h-7 w-7 text-accent" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="mb-1 text-lg font-extrabold text-content-primary">
            Configura tus preferencias de notificación
          </h3>
          <p className="text-sm leading-relaxed text-content-tertiary">
            Elige qué tipo de notificaciones quieres recibir, la frecuencia de
            recordatorios de revisión y los canales de comunicación.
          </p>
        </div>

        <a
          href="/dashboard/configuration"
          className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20 transition-shadow duration-200 hover:shadow-xl hover:shadow-accent/25 active:scale-[0.97]"
        >
          <Settings className="h-4 w-4" />
          Configuración
        </a>
      </div>
    </div>
  );
}
