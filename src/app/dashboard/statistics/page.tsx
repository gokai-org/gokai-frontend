"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatsOverview } from "@/features/stats/components/StatsOverview";
import { WeeklyActivityChart } from "@/features/stats/components/WeeklyActivityChart";
import { SkillRadarChart } from "@/features/stats/components/SkillRadarChart";
import { ProgressRing } from "@/features/stats/components/ProgressRing";
import { MonthlyProgressChart } from "@/features/stats/components/MonthlyProgressChart";
import { RecentActivity } from "@/features/stats/components/RecentActivity";
import { StudyStreakCalendar } from "@/features/stats/components/StudyStreakCalendar";
import { useStats } from "@/features/stats/hooks/useStats";
import { StatsSkeleton } from "@/shared/ui/Skeleton";

/*  Animation wrappers  */

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

/* Page  */

function getBannerMessage(accuracy: number, streak: number, hasData: boolean) {
  if (!hasData)
    return {
      title: "¡Bienvenido a tus estadísticas!",
      subtitle: "Aquí verás tu progreso a medida que estudies.",
    };
  if (streak >= 7 && accuracy >= 80)
    return {
      title: "¡Racha imparable!",
      subtitle: "Tu consistencia y precisión son admirables.",
    };
  if (accuracy >= 90)
    return {
      title: "¡Excelente precisión!",
      subtitle: "Tu dominio del japonés está en otro nivel.",
    };
  if (accuracy >= 70)
    return {
      title: "¡Buen progreso!",
      subtitle: "Sigue así, vas por buen camino.",
    };
  if (streak >= 3)
    return {
      title: "¡Buena racha!",
      subtitle: "La constancia es la clave del éxito.",
    };
  if (accuracy > 0)
    return {
      title: "¡Sigue practicando!",
      subtitle: "Cada sesión te acerca más a la fluidez.",
    };
  return {
    title: "¡Tu aventura comienza aquí!",
    subtitle: "Completa tu primera lección para ver tus estadísticas.",
  };
}

export default function Page() {
  const { data, loading, error, period, setPeriod, refresh } = useStats();

  const overview = data.overview;
  const streak = overview?.currentStreak ?? 0;
  const accuracy = overview?.accuracy ?? 0;

  const scoreEntries =
    data.recentActivity?.activities?.filter(
      (a) => typeof a.score === "number",
    ) ?? [];

  const averageScore =
    scoreEntries.length > 0
      ? Math.round(
          scoreEntries.reduce((sum, a) => sum + (a.score ?? 0), 0) /
            scoreEntries.length,
        )
      : 0;

    const hasAnyData = !!(
      overview &&
      (overview.studyHours > 0 ||
        overview.kanjiLearned > 0 ||
        overview.hiraganaLearned > 0 ||
        overview.katakanaLearned > 0 ||
        overview.reviewsCompleted > 0)
    );

  const banner = getBannerMessage(accuracy, streak, hasAnyData);

  return (
    <DashboardShell
      header={
        <DashboardHeader
          icon={<BarChart3 className="w-7 h-7 text-white" strokeWidth={2.5} />}
          title="Estadísticas"
          japaneseText="統計"
          subtitle="Visualiza tu progreso y rendimiento de estudio"
          rightContent={
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
              {(["week", "month", "all"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    period === p
                      ? "bg-[#993331] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {p === "week" ? "Semana" : p === "month" ? "Mes" : "Todo"}
                </button>
              ))}
            </div>
          }
        />
      }
    >
      {/* Banner */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 bg-gradient-to-r from-[#993331] to-[#7a2927] rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden"
      >
        {/* Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-white/80 text-sm font-medium mb-1"
            >
              Resumen de rendimiento
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
            >
              {banner.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-white/80 mt-2 text-sm max-w-md"
            >
              {banner.subtitle}
              <br />
              <span className="text-white/60 text-xs">
                統計を確認して、学習の進歩を追跡しましょう。
              </span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-4"
          >
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="h-10 w-16 bg-white/20 rounded-lg animate-pulse mb-1" />
                  <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <div className="h-10 w-12 bg-white/20 rounded-lg animate-pulse mb-1" />
                  <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-4xl font-extrabold">{averageScore}%</p>
                  <p className="text-xs text-white/70 font-medium mt-1">
                    Precisión promedio
                  </p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-4xl font-extrabold">{streak}</p>
                  <p className="text-xs text-white/70 font-medium mt-1">
                    Días de racha
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Cards */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <StatsOverview data={data.overview} loading={loading} />
      </motion.div>

      {/* ── Charts row 1: Weekly + Monthly ─────────────── */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <SectionHeader
          className="mb-5"
          title={
            <>
              Análisis de <span className="text-[#993331]">Actividad</span>
            </>
          }
          titleClassName="text-2xl font-extrabold tracking-tight text-gray-900"
          subtitle="Tu tiempo de estudio y evolución de rendimiento"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <WeeklyActivityChart data={data.activity?.weekly} loading={loading} />
          <MonthlyProgressChart
            data={data.activity?.monthly}
            loading={loading}
          />
        </div>
      </motion.div>

      {/* ── Charts row 2: Radar + Donut + Recent ─────── */}
      <motion.div
        custom={3}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <SectionHeader
          className="mb-5"
          title={
            <>
              Desglose de <span className="text-[#993331]">Habilidades</span>
            </>
          }
          titleClassName="text-2xl font-extrabold tracking-tight text-gray-900"
          subtitle="Tu dominio por área y actividad reciente"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkillRadarChart data={data.skills?.skills} loading={loading} />
          <ProgressRing
            total={data.skills?.distribution.total}
            categories={data.skills?.distribution.categories}
            loading={loading}
          />
          <RecentActivity
            activities={data.recentActivity?.activities}
            loading={loading}
          />
        </div>
      </motion.div>

      {/* ── Streak calendar ───────────────────────────── */}
      <motion.div
        custom={4}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <SectionHeader
          className="mb-5"
          title={
            <>
              Racha de <span className="text-[#993331]">Estudio</span>
            </>
          }
          titleClassName="text-2xl font-extrabold tracking-tight text-gray-900"
          subtitle="Tu consistencia a lo largo del tiempo"
        />
        <StudyStreakCalendar data={data.streakCalendar} loading={loading} />
      </motion.div>

      {/* ── CTA ───────────────────────────────────────── */}
      <motion.div
        custom={5}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center"
      >
        <div className="inline-block bg-[#993331]/10 px-8 py-4 rounded-full mb-4">
          <p className="text-xl font-bold text-[#993331]">
            毎日の努力が大きな成果につながります
          </p>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          El esfuerzo de cada día se convierte en grandes logros. ¡Sigue así!
        </p>
        <button className="bg-gradient-to-r from-[#993331] to-[#7a2927] text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all shadow-md">
          Comenzar sesión de estudio
        </button>
      </motion.div>
    </DashboardShell>
  );
}
