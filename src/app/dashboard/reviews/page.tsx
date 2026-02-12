"use client";

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { useState } from "react";

type ReviewTopic = {
  id: string;
  theme: string;
  themeJp: string;
  type: string;
  timeWithoutPractice: string;
  progress: number;
};

export default function Page() {
  const [topics] = useState<ReviewTopic[]>([
    {
      id: "1",
      theme: "森 (mori)",
      themeJp: "森",
      type: "Kanji",
      timeWithoutPractice: "24h",
      progress: 65,
    },
    {
      id: "2",
      theme: "一 (ichi)",
      themeJp: "一",
      type: "Gramática",
      timeWithoutPractice: "24h",
      progress: 45,
    },
    {
      id: "3",
      theme: "私 (watashi)",
      themeJp: "私",
      type: "Kanji",
      timeWithoutPractice: "48h",
      progress: 30,
    },
  ]);

  const [stats] = useState({
    sessionsCompleted: 24,
    averageScore: 85,
    streak: 7,
  });

  return (
    <DashboardShell
      header={
        <DashboardHeader
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
          title="Repaso"
          japaneseText="復習"
          subtitle="Refuerza lo que has aprendido con repasos inteligentes"
        />
      }
    >
      {/* Mensaje motivacional */}
      <div className="mb-8 bg-white rounded-3xl p-16 shadow-sm border border-gray-100">
        <div className="flex items-start gap-10">
          <div className="flex-shrink-0 w-32 h-32 rounded-full bg-gradient-to-br from-[#993331] to-[#7a2927] flex items-center justify-center shadow-lg">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="inline-block bg-[#993331]/10 px-8 py-5 rounded-full mb-6">
              <p className="text-2xl font-bold text-[#993331]">
                Hace tiempo que no repasas. ¡Vamos paso a paso!
              </p>
            </div>
            <p className="text-lg text-gray-500">
              少し時間が空きましたね。ゆっくりで大丈夫！
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Sesiones completadas"
          value={stats.sessionsCompleted}
          color="text-[#993331]"
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          label="Promedio"
          value={`${stats.averageScore}%`}
          color="text-[#993331]"
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
          label="Racha"
          value={`${stats.streak} días`}
          color="text-[#993331]"
        />
      </div>

      {/* Repaso recomendado */}
      <SectionHeader
        className="mb-6"
        title={
          <>
            Repaso <span className="text-[#993331]">Recomendado</span>
          </>
        }
        titleClassName="text-3xl font-extrabold tracking-tight text-gray-900"
        subtitle="Temas que necesitan refuerzo según tu progreso"
        subtitleClassName="text-sm text-gray-500"
      />

      {/* Lista de temas */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <ReviewCard key={topic.id} topic={topic} />
        ))}
      </div>

      {/* Call to action */}
      <div className="mt-8 bg-gradient-to-r from-[#993331] to-[#7a2927] rounded-3xl p-8 text-center text-white shadow-lg">
        <h3 className="text-2xl font-extrabold mb-2">¿Listo para más?</h3>
        <p className="text-white/90 mb-6">Continúa practicando otros temas y sigue mejorando</p>
        <button className="bg-white text-[#993331] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-md">
          Ver todos los temas
        </button>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`${color} opacity-80`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ topic }: { topic: ReviewTopic }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-[#993331]/20">
      <div className="flex items-center gap-6">
        {/* Icono del tema */}
        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-white">{topic.themeJp}</span>
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-3 py-1 bg-[#993331]/10 text-[#993331] text-xs font-bold rounded-full">
              {topic.type}
            </span>
            <span className="text-xs text-gray-400">Tiempo sin practicar: {topic.timeWithoutPractice}</span>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">
            Tema: <span className="text-[#993331]">{topic.theme}</span>
          </h3>
          
          {/* Barra de progreso */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#993331] to-[#7a2927] rounded-full transition-all duration-500"
                style={{ width: `${topic.progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-600">{topic.progress}%</span>
          </div>
        </div>

        {/* Botón */}
        <button className="flex-shrink-0 bg-[#993331] hover:bg-[#7a2927] text-white px-8 py-3 rounded-full font-bold transition-colors shadow-md hover:shadow-lg">
          Comenzar
        </button>
      </div>
    </div>
  );
}
