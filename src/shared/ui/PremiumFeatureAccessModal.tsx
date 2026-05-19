"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Crown, Sparkles, X } from "lucide-react";
import { useMiniDockBlocker } from "@/features/dashboard/utils/miniDockBlockers";
import { stopModalEvent, useModalPageLock } from "@/shared/hooks/useModalPageLock";

export interface PremiumFeatureAccessModalFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface PremiumFeatureAccessModalProps {
  open: boolean;
  title: string;
  description: string;
  badgeLabel: string;
  featureIntro?: string;
  features: PremiumFeatureAccessModalFeature[];
  currentPlanLabel?: string;
  currentPlanItems?: string[];
  footerText: string;
  panelTitle?: string;
  panelSubtitle?: string;
  panelHighlights?: string[];
  panelFootnote?: string;
  tone?: "neutral" | "accent";
  onClose: () => void;
  onOpenUpgrade: () => void;
  onOpenPlans?: () => void;
}

export function PremiumFeatureAccessModal({
  open,
  title,
  description,
  badgeLabel,
  featureIntro = "Todo lo que desbloqueas con GOKAI+",
  features,
  currentPlanLabel = "Con tu plan actual conservas",
  currentPlanItems = [],
  footerText,
  panelTitle = "GOKAI+",
  panelSubtitle = "Desbloquea experiencias premium",
  panelHighlights = [],
  panelFootnote,
  tone = "neutral",
  onClose,
  onOpenUpgrade,
  onOpenPlans,
}: PremiumFeatureAccessModalProps) {
  useMiniDockBlocker(open);
  useModalPageLock(open);

  const isAccentTone = tone === "accent";
  const leftPanelClassName = isAccentTone
    ? "bg-gradient-to-br from-accent to-accent-hover text-content-inverted"
    : "border-b border-border-subtle bg-surface-secondary text-content-primary md:border-b-0 md:border-r";
  const leftIconClassName = isAccentTone
    ? "bg-surface-primary/16 text-content-inverted"
    : "bg-accent/10 text-accent";
  const leftBadgeClassName = isAccentTone
    ? "border-white/15 bg-white/10 text-white/92"
    : "border-accent/15 bg-accent/10 text-accent";
  const leftSubtitleClassName = isAccentTone
    ? "text-white/78"
    : "text-content-secondary";
  const leftDescriptionClassName = isAccentTone
    ? "text-white/82"
    : "text-content-secondary";
  const leftHighlightIconClassName = isAccentTone
    ? "text-white/80"
    : "text-accent";
  const leftHighlightTextClassName = isAccentTone
    ? "text-white/88"
    : "text-content-secondary";
  const leftFootnoteClassName = isAccentTone
    ? "text-white/56"
    : "text-content-tertiary";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-3 sm:p-4"
          onClick={onClose}
          onWheelCapture={stopModalEvent}
          onPointerDown={stopModalEvent}
          onPointerMove={stopModalEvent}
          onTouchMoveCapture={stopModalEvent}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 14 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative my-2 flex max-h-[calc(100dvh-24px)] w-full max-w-[440px] flex-col overflow-hidden rounded-[26px] bg-surface-primary shadow-[0_24px_64px_rgba(0,0,0,0.18)] ring-1 ring-border-subtle sm:my-4 sm:max-h-[calc(100dvh-32px)] sm:max-w-5xl sm:rounded-3xl md:flex-row"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={[
                "relative flex flex-col overflow-hidden md:min-h-[560px] md:w-[360px] md:flex-shrink-0 md:justify-between",
                leftPanelClassName,
              ].join(" ")}
            >
              <button
                type="button"
                onClick={onClose}
                className={[
                  "absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors md:hidden",
                  isAccentTone
                    ? "text-white/70 hover:bg-surface-primary/10 hover:text-content-inverted"
                    : "text-content-muted hover:bg-surface-primary hover:text-content-primary",
                ].join(" ")}
                aria-label="Cerrar modal premium"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="relative z-[1] px-5 pb-4 pt-4 text-center md:px-7 md:pb-0 md:pt-8 md:text-left">
                <div className="flex items-center justify-center gap-3 md:justify-start">
                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl md:h-12 md:w-12",
                      leftIconClassName,
                    ].join(" ")}
                  >
                    <Crown className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <p className="text-[1.35rem] font-extrabold tracking-tight md:text-2xl">{panelTitle}</p>
                    <p className={["hidden text-xs md:text-sm md:block", leftSubtitleClassName].join(" ")}>
                      {panelSubtitle}
                    </p>
                  </div>
                </div>

                <div
                  className={[
                    "mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] md:mt-6 md:text-[11px] md:tracking-[0.24em]",
                    leftBadgeClassName,
                  ].join(" ")}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {badgeLabel}
                </div>

                <h2 className="mx-auto mt-3 max-w-[15ch] text-[1.7rem] font-black leading-[1.02] tracking-tight sm:text-[2.15rem] md:mx-0 md:mt-5 md:max-w-[14ch] md:text-[2.6rem]">
                  {title}
                </h2>

                <p className={["mt-3 hidden text-sm leading-7 md:block", leftDescriptionClassName].join(" ")}>
                  {description}
                </p>

                <p className={["mx-auto mt-2 max-w-[28ch] text-[12px] leading-4 md:hidden", leftDescriptionClassName].join(" ")}>
                  Activa GOKAI+ para entrar.
                </p>

                {panelHighlights.length > 0 ? (
                  <div className="mt-7 hidden space-y-3.5 md:block">
                    {panelHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle2
                          className={[
                            "mt-0.5 h-4.5 w-4.5 shrink-0",
                            leftHighlightIconClassName,
                          ].join(" ")}
                        />
                        <p className={["text-sm leading-6", leftHighlightTextClassName].join(" ")}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {panelFootnote ? (
                <div className={["hidden items-center gap-3 px-7 pb-6 text-xs md:flex", leftFootnoteClassName].join(" ")}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{panelFootnote}</span>
                </div>
              ) : null}
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 hidden rounded-full p-1.5 text-content-muted transition-colors hover:bg-surface-tertiary hover:text-content-secondary md:flex"
                aria-label="Cerrar modal premium"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:pb-4 md:pt-6">
                <p className="hidden text-sm font-semibold text-content-primary md:block">
                  {featureIntro}
                </p>

                <div className="space-y-2 md:mt-4 md:space-y-2.5">
                  {features.map((feature) => (
                    <div
                      key={feature.title}
                      className="flex items-start gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-secondary md:p-2"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-content-primary">
                          {feature.title}
                        </p>
                        <p className="hidden text-xs leading-relaxed text-content-tertiary md:block">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {currentPlanItems.length > 0 ? (
                  <div className="mt-6 hidden rounded-2xl border border-border-subtle bg-surface-secondary/55 px-4 py-4 md:block">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-content-muted">
                      {currentPlanLabel}
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {currentPlanItems.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-primary text-content-secondary">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                          <p className="text-sm leading-6 text-content-secondary">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-border-subtle bg-surface-secondary/50 px-4 py-3 md:px-6 md:py-5">
                <p className="mb-3 hidden text-sm leading-6 text-content-secondary md:block">
                  {footerText}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-bold text-content-inverted transition-colors hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/20"
                  >
                    Convertirte en Pro
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {onOpenPlans ? (
                    <button
                      type="button"
                      onClick={onOpenPlans}
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-border-default bg-surface-primary px-5 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary hover:text-content-primary"
                    >
                      Ver planes
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}