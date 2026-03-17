"use client";

import { Bell, Settings } from "lucide-react";

export default function NoticeFooterCTA() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#993331]/10">
          <Bell className="h-7 w-7 text-[#993331]" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="mb-1 text-lg font-extrabold text-gray-900">
            Configura tus preferencias de notificación
          </h3>
          <p className="text-sm leading-relaxed text-gray-500">
            Elige qué tipo de notificaciones quieres recibir, la frecuencia de
            recordatorios de revisión y los canales de comunicación.
          </p>
        </div>

        <a
          href="/dashboard/configuration"
          className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#993331]/20 transition-shadow duration-200 hover:shadow-xl hover:shadow-[#993331]/25 active:scale-[0.97]"
        >
          <Settings className="h-4 w-4" />
          Configuración
        </a>
      </div>
    </div>
  );
}