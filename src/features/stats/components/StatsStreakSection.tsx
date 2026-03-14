"use client";

import { SectionHeader } from "@/shared/ui/SectionHeader";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { StudyStreakCalendar } from "@/features/stats/components/StudyStreakCalendar";
import type { StreakCalendarResponse } from "@/features/stats/types";

interface StatsStreakSectionProps {
  data?: StreakCalendarResponse | null;
  loading?: boolean;
  animationsEnabled?: boolean;
}

export function StatsStreakSection({
  data,
  loading = false,
  animationsEnabled = true,
}: StatsStreakSectionProps) {
  return (
    <AnimatedEntrance
      index={4}
      disabled={!animationsEnabled}
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
      <StudyStreakCalendar
        data={data}
        loading={loading}
        animationsEnabled={animationsEnabled}
      />
    </AnimatedEntrance>
  );
}