"use client";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { StatsLockedPreview } from "@/features/stats/components/StatsLockedPreview";
import { StatsBanner } from "@/features/stats/components/StatsBanner";
import { StatsPeriodFilter } from "@/features/stats/components/StatsPeriodFilter";
import { StatsOverview } from "@/features/stats/components/StatsOverview";
import { StatsActivitySection } from "@/features/stats/components/StatsActivitySection";
import { StatsSkillsSection } from "@/features/stats/components/StatsSkillsSection";
import { StatsStreakSection } from "@/features/stats/components/StatsStreakSection";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useResolvedPremiumAccess } from "@/shared/hooks/useResolvedPremiumAccess";
import { PremiumLockedView } from "@/shared/ui";
import { StatsSkeleton } from "@/shared/ui/Skeleton";
import { useStats } from "@/features/stats/hooks/useStats";
import { useStatsSummary } from "@/features/stats/hooks/useStatsSummary";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

function StatsExperience() {
  const { data, loading, period, setPeriod } = useStats();
  const { banner, averageScore, streak } = useStatsSummary(data);

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  if (loading) {
    return (
      <DashboardShell>
        <div data-help-loading="true">
          <div className="mb-6 flex justify-end">
            <StatsPeriodFilter period={period} onChange={setPeriod} />
          </div>
          <StatsSkeleton />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mb-6 flex justify-end">
        <StatsPeriodFilter period={period} onChange={setPeriod} />
      </div>
      <AnimatedEntrance
        index={0}
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <div data-help-target="stats-banner">
          <StatsBanner
            title={banner.title}
            subtitle={banner.subtitle}
            averageScore={averageScore}
            streak={streak}
            loading={loading}
            animationsEnabled={animationsEnabled}
            heavyAnimationsEnabled={heavyAnimationsEnabled}
          />
        </div>
      </AnimatedEntrance>

      <AnimatedEntrance
        index={2}
        className="mb-8"
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <div data-help-target="stats-overview">
          <StatsOverview
            data={data.overview}
            completedTotals={data.recentAnswers?.completedTotals}
            loading={loading}
            animationsEnabled={animationsEnabled}
          />
        </div>
      </AnimatedEntrance>

      <AnimatedEntrance
        index={3}
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <div data-help-target="stats-activity">
          <StatsActivitySection
            data={data.activity}
            loading={loading}
            animationsEnabled={animationsEnabled}
          />
        </div>
      </AnimatedEntrance>

      <AnimatedEntrance
        index={4}
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <StatsSkillsSection
          skills={data.skills}
          recentActivity={data.recentActivity}
          loading={loading}
          animationsEnabled={animationsEnabled}
        />
      </AnimatedEntrance>

      <AnimatedEntrance
        index={5}
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <div data-help-target="stats-streak">
          <StatsStreakSection
            data={data.streakCalendar}
            loading={loading}
            animationsEnabled={animationsEnabled}
          />
        </div>
      </AnimatedEntrance>
    </DashboardShell>
  );
}

export default function StatsPage() {
  const { accessResolved, isPremium } = useResolvedPremiumAccess();

  if (!accessResolved) {
    return (
      <DashboardShell useContainer={false} contentClassName="overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1680px] flex-col gap-4">
          <div className="overflow-hidden rounded-[32px] border border-[#BA5149]/14 bg-surface-primary/92">
            <StatsLockedPreview />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!isPremium) {
    return (
      <DashboardShell useContainer={false} contentClassName="overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1680px] flex-col gap-4">
          <PremiumLockedView
            preview={<StatsLockedPreview />}
            title="Tus estadisticas avanzadas estan bloqueadas"
            description="GOKAI+ desbloquea reportes mas profundos, actividad por periodos, progreso por habilidades y seguimiento detallado de tus rachas."
            primaryHref="/checkout?returnTo=%2Fdashboard%2Fstatistics"
            primaryLabel="Desbloquear estadisticas"
            secondaryHref="/auth/membership?from=dashboard&returnTo=%2Fdashboard%2Fstatistics"
            secondaryLabel="Comparar planes"
            featureLabel="Estadisticas premium"
            detailItems={[
              "Resumen avanzado",
              "Actividad y habilidades",
              "Rachas detalladas",
            ]}
            caption="Activa GOKAI+ para ver tu progreso completo, detectar patrones y medir mejor tu avance semanal."
          />
        </div>
      </DashboardShell>
    );
  }

  return <StatsExperience />;
}
