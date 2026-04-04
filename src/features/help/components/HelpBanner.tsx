"use client";

import { Search, Sparkles } from "lucide-react";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { HELP_FAQS, HELP_GUIDES } from "@/features/help/utils/help.constants";

interface HelpBannerProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchFocusFaq: () => void;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function HelpBanner({
  searchQuery,
  onSearchChange,
  onSearchFocusFaq,
  animationsEnabled = true,
  heavyAnimationsEnabled = true,
}: HelpBannerProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-accent to-accent-hover p-6 text-content-inverted shadow-lg sm:p-8 lg:p-10">
      <div className="absolute right-[-20px] top-[-40px] h-44 w-44 rounded-full bg-surface-primary/5" />
      <div className="absolute bottom-[-30px] left-[30%] h-32 w-32 rounded-full bg-surface-primary/5" />
      <div className="absolute right-[12%] top-[50%] h-20 w-20 rounded-full bg-surface-primary/5" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <AnimatedEntrance
            index={0}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
              Centro de soporte y aprendizaje
            </p>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={1}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-primary/15 backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-content-inverted" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-content-inverted sm:text-3xl lg:text-4xl">
                  ¿En qué podemos ayudarte?
                </h2>
                <p className="mt-1 text-sm text-white/75 sm:text-[15px]">
                  Encuentra respuestas, guías y consejos para dominar Gokai.
                </p>
              </div>
            </div>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={2}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <div className="relative mt-5 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                placeholder="Buscar en el centro de ayuda..."
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (e.target.value.trim().length > 0) onSearchFocusFaq();
                }}
                className="w-full rounded-2xl border border-white/15 bg-surface-primary/10 py-3.5 pl-12 pr-5 text-sm text-content-inverted placeholder:text-white/50 outline-none backdrop-blur-sm transition-all duration-300 focus:border-white/30 focus:bg-surface-primary/15"
              />
            </div>
          </AnimatedEntrance>
        </div>

        <AnimatedEntrance
          index={3}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div className="grid grid-cols-3 gap-3 rounded-[24px] border border-white/10 bg-surface-primary/8 p-3 backdrop-blur-sm sm:gap-4 sm:p-4">
            <div className="min-w-[90px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
              <p className="text-3xl font-extrabold leading-none text-content-inverted sm:text-4xl">
                {HELP_GUIDES.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-white/70 sm:text-xs">
                Guías
              </p>
            </div>

            <div className="min-w-[90px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
              <p className="text-3xl font-extrabold leading-none text-content-inverted sm:text-4xl">
                {HELP_FAQS.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-white/70 sm:text-xs">
                FAQs
              </p>
            </div>

            <div className="min-w-[90px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
              <p className="text-3xl font-extrabold leading-none text-content-inverted sm:text-4xl">
                24/7
              </p>
              <p className="mt-1 text-[11px] font-semibold text-white/70 sm:text-xs">
                Soporte
              </p>
            </div>
          </div>
        </AnimatedEntrance>
      </div>
    </section>
  );
}
