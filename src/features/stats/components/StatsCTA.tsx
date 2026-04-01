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
      <div className="rounded-3xl border border-border-subtle bg-surface-primary p-8 text-center shadow-sm">
        <div className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-8 py-4">
          <p className="text-xl font-bold text-accent">
            毎日の努力が大きな成果につながります
          </p>
        </div>
        <p className="mb-6 text-sm text-content-tertiary">
          El esfuerzo de cada día se convierte en grandes logros. ¡Sigue así!
        </p>
        <PrimaryActionButton onClick={onStartStudy}>
          Comenzar sesión de estudio
        </PrimaryActionButton>
      </div>
    </AnimatedEntrance>
  );
}