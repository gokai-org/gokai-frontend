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
};

export function MobileInterestCarousel({
  interests,
  currentSectionId,
  selectedInterests,
  onToggle,
  isResolving = false,
}: OnboardingInterestOptionsProps) {
  return (
    <div className="lg:hidden relative left-1/2 right-1/2 w-screen max-w-none -translate-x-1/2 overflow-visible py-4 sm:py-5">
      <div
        className="
          flex items-stretch gap-3 sm:gap-4 md:gap-5
          overflow-x-auto overflow-y-visible
          snap-x snap-mandatory scroll-smooth
          px-4 sm:px-6 md:px-8
          pt-4 pb-6 sm:pt-5 sm:pb-7 md:pt-6 md:pb-8
          [scroll-padding-left:1rem]
          [scroll-padding-right:1rem]
          sm:[scroll-padding-left:1.5rem]
          sm:[scroll-padding-right:1.5rem]
          md:[scroll-padding-left:2rem]
          md:[scroll-padding-right:2rem]
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
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
              className="snap-start shrink-0 w-[70vw] max-w-[270px] sm:w-[52vw] sm:max-w-[320px] md:w-[40vw] md:max-w-[360px] self-stretch py-1"
            >
              <OnboardingInterestCard
                interest={interest}
                index={index}
                total={interests.length}
                isSelected={isSelected}
                onClick={() => onToggle(interest)}
                isResolving={isResolving}
                compact
              />
            </motion.div>
          );
        })}
      </div>

      <p className="mt-1 text-center text-[11px] sm:text-xs font-medium tracking-wide text-content-tertiary">
        Desliza para explorar
      </p>
    </div>
  );
}

export function DesktopInterestRow({
  interests,
  currentSectionId,
  selectedInterests,
  onToggle,
  isResolving = false,
}: OnboardingInterestOptionsProps) {
  return (
    <div className="hidden lg:flex lg:items-stretch lg:justify-center lg:gap-6 w-full max-w-[1600px] mx-auto">
      {interests.map((interest, index) => {
        const isSelected =
          !!interest.themeId && selectedInterests[currentSectionId] === interest.themeId;

        return (
          <motion.div
            key={interest.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="w-[380px] flex-none"
          >
            <OnboardingInterestCard
              interest={interest}
              index={index}
              total={interests.length}
              isSelected={isSelected}
              onClick={() => onToggle(interest)}
              isResolving={isResolving}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
