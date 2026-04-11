interface WritingEvaluationCriterion {
  title: string;
  description: string;
  cue: string;
}

interface WritingEvaluationGuideProps {
  eyebrow: string;
  title: string;
  intro: string;
  emphasis: string;
  criteria: readonly WritingEvaluationCriterion[];
  coachNote: string;
}

export default function WritingEvaluationGuide({
  eyebrow,
  title,
  intro,
  emphasis,
  criteria,
  coachNote,
}: WritingEvaluationGuideProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary shadow-sm sm:rounded-[20px]">
      <div className="h-1 bg-gradient-to-r from-accent via-accent-hover to-accent" />

      <div className="space-y-3 p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-content-muted sm:text-[11px]">
          {eyebrow}
        </p>

        <div className="inline-flex max-w-full rounded-2xl border border-accent/15 bg-accent/8 px-3 py-2 shadow-sm">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              Se valora
            </p>
            <p className="mt-1 text-[13px] font-black leading-snug text-content-primary sm:text-[15px]">
              {emphasis}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold leading-snug text-content-primary sm:text-base">
            {title}
          </p>
          <p className="text-[11px] leading-relaxed text-content-secondary sm:text-xs">
            {intro}
          </p>
        </div>

        <div className="grid gap-2">
          {criteria.map((criterion, index) => (
            <div
              key={criterion.title}
              className="rounded-2xl border border-border-subtle bg-surface-primary/75 p-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 text-[11px] font-black text-accent">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-content-primary sm:text-[13px]">
                    {criterion.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-content-secondary">
                    {criterion.cue}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="rounded-2xl border border-accent/12 bg-accent/5 px-3 py-2 text-[11px] leading-relaxed text-content-secondary sm:text-[12px]">
          <span className="font-bold text-content-primary">Tip:</span> {coachNote}
        </p>
      </div>
    </div>
  );
}