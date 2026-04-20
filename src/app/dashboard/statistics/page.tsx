"use client";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { StatsBanner } from "@/features/stats/components/StatsBanner";
import { StatsPeriodFilter } from "@/features/stats/components/StatsPeriodFilter";
import { StatsOverview } from "@/features/stats/components/StatsOverview";
import { StatsActivitySection } from "@/features/stats/components/StatsActivitySection";
import { StatsSkillsSection } from "@/features/stats/components/StatsSkillsSection";
import { StatsStreakSection } from "@/features/stats/components/StatsStreakSection";
import { StatsCTA } from "@/features/stats/components/StatsCTA";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { StatsSkeleton } from "@/shared/ui/Skeleton";
import { useStats } from "@/features/stats/hooks/useStats";
import { useStatsSummary } from "@/features/stats/hooks/useStatsSummary";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

export default function StatsPage() {
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

      <AnimatedEntrance
        index={6}
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <div data-help-target="stats-cta">
          <StatsCTA animationsEnabled={animationsEnabled} />
        </div>
      </AnimatedEntrance>
    </DashboardShell>
  );
}
