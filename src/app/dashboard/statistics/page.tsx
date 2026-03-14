"use client";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { StatsHeader } from "@/features/stats/components/StatsHeader";
import { StatsBanner } from "@/features/stats/components/StatsBanner";
import { StatsOverview } from "@/features/stats/components/StatsOverview";
import { StatsActivitySection } from "@/features/stats/components/StatsActivitySection";
import { StatsSkillsSection } from "@/features/stats/components/StatsSkillsSection";
import { StatsStreakSection } from "@/features/stats/components/StatsStreakSection";
import { StatsCTA } from "@/features/stats/components/StatsCTA";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { StatsSkeleton } from "@/shared/ui/Skeleton";
import { useStats } from "@/features/stats/hooks/useStats";
import { useStatsSummary } from "@/features/stats/hooks/useStatsSummary";

export default function StatsPage() {
  const { data, loading, period, setPeriod } = useStats();
  const { banner, averageScore, streak } = useStatsSummary(data);

  const animationsEnabled = true;

  if (loading) {
    return (
      <DashboardShell
        header={
          <StatsHeader period={period} onPeriodChange={setPeriod} />
        }
      >
        <StatsSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      header={<StatsHeader period={period} onPeriodChange={setPeriod} />}
    >
      <StatsBanner
        title={banner.title}
        subtitle={banner.subtitle}
        averageScore={averageScore}
        streak={streak}
        loading={loading}
        animationsEnabled={animationsEnabled}
      />

      <AnimatedEntrance
        index={1}
        className="mb-8"
        disabled={!animationsEnabled}
      >
        <StatsOverview
          data={data.overview}
          loading={loading}
          animationsEnabled={animationsEnabled}
        />
      </AnimatedEntrance>

      <StatsActivitySection
        data={data.activity}
        loading={loading}
        animationsEnabled={animationsEnabled}
      />

      <StatsSkillsSection
        skills={data.skills}
        recentActivity={data.recentActivity}
        loading={loading}
        animationsEnabled={animationsEnabled}
      />

      <StatsStreakSection
        data={data.streakCalendar}
        loading={loading}
        animationsEnabled={animationsEnabled}
      />

      <StatsCTA animationsEnabled={animationsEnabled} />
    </DashboardShell>
  );
}