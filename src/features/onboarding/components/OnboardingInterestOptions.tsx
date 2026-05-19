"use client";

import { motion } from "framer-motion";
import { OnboardingInterestCard } from "@/features/onboarding/components/OnboardingInterestCard";
import type {
  OnboardingInterest,
  SelectedOnboardingInterests,
} from "@/features/onboarding/types";

type OnboardingInterestOptionsProps = {
  interests: OnboardingInterest[];
  currentSectionId: string;
  selectedInterests: SelectedOnboardingInterests;
  onToggle: (interest: OnboardingInterest) => void;
  isResolving?: boolean;
  variant?: "default" | "modal";
};

export function MobileInterestCarousel({
  interests,
  currentSectionId,
  selectedInterests,
  onToggle,
  isResolving = false,
  variant = "default",
}: OnboardingInterestOptionsProps) {
  return (
    <div
      className={
        variant === "modal"
          ? "relative -mx-4 overflow-visible py-3 sm:-mx-6 lg:hidden"
          : "lg:hidden relative left-1/2 right-1/2 w-screen max-w-none -translate-x-1/2 overflow-visible py-4 sm:py-5"
      }
    >
      <div
        className={
          variant === "modal"
            ? "flex items-stretch gap-3 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth pl-3 pr-4 pb-4 pt-3 [scroll-padding-left:0.75rem] [scroll-padding-right:1rem] sm:pl-4 sm:pr-6 sm:[scroll-padding-left:1rem] sm:[scroll-padding-right:1.5rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex items-stretch gap-3 sm:gap-4 md:gap-5 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth px-4 sm:px-6 md:px-8 pt-4 pb-6 sm:pt-5 sm:pb-7 md:pt-6 md:pb-8 [scroll-padding-left:1rem] [scroll-padding-right:1rem] sm:[scroll-padding-left:1.5rem] sm:[scroll-padding-right:1.5rem] md:[scroll-padding-left:2rem] md:[scroll-padding-right:2rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        {interests.map((interest, index) => {
          const isSelected =
            !!interest.themeId &&
            selectedInterests[currentSectionId] === interest.themeId;

          return (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.08,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={
                variant === "modal"
                  ? "snap-start shrink-0 w-[68vw] min-w-[180px] max-w-[220px] sm:w-[46vw] sm:min-w-[195px] sm:max-w-[230px] md:w-[32vw] md:min-w-[210px] md:max-w-[240px] self-stretch py-1"
                  : "snap-start shrink-0 w-[70vw] max-w-[270px] sm:w-[52vw] sm:max-w-[320px] md:w-[40vw] md:max-w-[360px] self-stretch py-1"
              }
            >
              <OnboardingInterestCard
                interest={interest}
                index={index}
                total={interests.length}
                isSelected={isSelected}
                onClick={() => onToggle(interest)}
                isResolving={isResolving}
                compact
                variant={variant}
              />
            </motion.div>
          );
        })}
      </div>

      {variant === "modal" ? (
        <p className="mt-1 text-center text-[11px] font-medium tracking-wide text-content-tertiary">
          Desliza para ver opciones
        </p>
      ) : (
        <p className="mt-1 text-center text-[11px] sm:text-xs font-medium tracking-wide text-content-tertiary">
          Desliza para explorar
        </p>
      )}
    </div>
  );
}

export function DesktopInterestRow({
  interests,
  currentSectionId,
  selectedInterests,
  onToggle,
  isResolving = false,
  variant = "default",
}: OnboardingInterestOptionsProps) {
  return (
    <div
      className={
        variant === "modal"
          ? "hidden w-full max-w-[980px] lg:grid lg:grid-cols-2 lg:gap-4 2xl:grid-cols-3"
          : "hidden lg:flex lg:items-stretch lg:justify-center lg:gap-6 w-full max-w-[1600px] mx-auto"
      }
    >
      {interests.map((interest, index) => {
        const isSelected =
          !!interest.themeId && selectedInterests[currentSectionId] === interest.themeId;

        return (
          <motion.div
            key={interest.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className={variant === "modal" ? "min-w-0" : "w-[380px] flex-none"}
          >
            <OnboardingInterestCard
              interest={interest}
              index={index}
              total={interests.length}
              isSelected={isSelected}
              onClick={() => onToggle(interest)}
              isResolving={isResolving}
              compact={variant === "modal"}
              variant={variant}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
