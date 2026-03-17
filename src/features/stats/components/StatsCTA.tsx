"use client";

import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { PrimaryActionButton } from "@/shared/ui/PrimaryActionButton";

interface StatsCTAProps {
  onStartStudy?: () => void;
  animationsEnabled?: boolean;
}

export function StatsCTA({
  onStartStudy,
  animationsEnabled = true,
}: StatsCTAProps) {
  return (
    <AnimatedEntrance index={5} disabled={!animationsEnabled}>
      <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 inline-block rounded-full bg-[#993331]/10 px-8 py-4">
          <p className="text-xl font-bold text-[#993331]">
            毎日の努力が大きな成果につながります
          </p>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          El esfuerzo de cada día se convierte en grandes logros. ¡Sigue así!
        </p>
        <PrimaryActionButton onClick={onStartStudy}>
          Comenzar sesión de estudio
        </PrimaryActionButton>
      </div>
    </AnimatedEntrance>
  );
}