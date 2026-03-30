"use client";

import { SectionHeader } from "@/shared/ui/SectionHeader";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { SkillRadarChart } from "@/features/stats/components/SkillRadarChart";
import { ProgressRing } from "@/features/stats/components/ProgressRing";
import { RecentActivity } from "@/features/stats/components/RecentActivity";
import type {
  SkillsResponse,
  RecentActivityResponse,
} from "@/features/stats/types";

interface StatsSkillsSectionProps {
  skills?: SkillsResponse | null;
  recentActivity?: RecentActivityResponse | null;
  loading?: boolean;
  animationsEnabled?: boolean;
}

export function StatsSkillsSection({
  skills,
  recentActivity,
  loading = false,
  animationsEnabled = true,
}: StatsSkillsSectionProps) {
  return (
    <AnimatedEntrance
      index={3}
      disabled={!animationsEnabled}
      className="mb-8"
    >
      <SectionHeader
        className="mb-5"
        title={
          <>
            Desglose de <span className="text-accent">Habilidades</span>
          </>
        }
        titleClassName="text-2xl font-extrabold tracking-tight text-content-primary"
        subtitle="Tu dominio por área y actividad reciente"
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <SkillRadarChart
          data={skills?.skills}
          loading={loading}
          animationsEnabled={animationsEnabled}
        />
        <ProgressRing
          total={skills?.distribution.total}
          categories={skills?.distribution.categories}
          loading={loading}
          animationsEnabled={animationsEnabled}
        />
        <RecentActivity
          activities={recentActivity?.activities}
          loading={loading}
          animationsEnabled={animationsEnabled}
        />
      </div>
    </AnimatedEntrance>
  );
}