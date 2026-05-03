"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import {
  MAX_ONBOARDING_SELECTIONS,
} from "@/features/onboarding/data/interestSections";
import { useOnboardingInterests } from "@/features/onboarding/hooks/useOnboardingInterests";
import {
  InitialExperienceSettings,
  type SettingStep,
} from "./InitialExperienceSettings";
import {
  DesktopInterestRow,
  MobileInterestCarousel,
} from "@/features/onboarding/components/OnboardingInterestOptions";
import type { OnboardingInterest } from "@/features/onboarding/types";
import { getCurrentUser } from "@/features/auth/services/api";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { ThemeModeToggle } from "@/shared/components";
import { ScreenTransitionOverlay } from "@/shared/ui";

type OnboardingStep = "interests" | "settings";
type PlanVariant = "free" | "premium";

type OnboardingInterestsExperienceProps = {
  initialPlanVariant?: PlanVariant;
};

type ScreenTransitionState = {
  title: string;
  description: string;
};

export function OnboardingInterestsExperience({
  initialPlanVariant = "free",
}: OnboardingInterestsExperienceProps) {
  const router = useRouter();
  const platformMotion = usePlatformMotion();
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState<OnboardingStep>("interests");
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const [sectionDirection, setSectionDirection] = useState<1 | -1>(1);
  const [currentSettingsStep, setCurrentSettingsStep] =
    useState<SettingStep>("appearance");
  const [planVariant, setPlanVariant] =
    useState<PlanVariant>(initialPlanVariant);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [screenTransition, setScreenTransition] =
    useState<ScreenTransitionState | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const {
    sections,
    status,
    error,
    saving,
    selectedInterests,
    selectedCount,
    retryLoadThemes,
    toggleInterest,
    saveSelections,
  } = useOnboardingInterests();

  const routeTransitionDelayMs = platformMotion.shouldAnimate
    ? Math.max(170, Math.round(360 * platformMotion.durationScale))
    : 0;

  useEffect(() => {
    router.prefetch("/dashboard/graph");
  }, [router]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    getCurrentUser().then((user) => {
      if (!mounted || !user) return;
      const isPremium =
        user.subscribed || user.plan === "premium" || user.plan === "pro";
      setPlanVariant(isPremium ? "premium" : "free");
    });

    return () => {
      mounted = false;
    };
  }, []);

  const currentSection = sections[currentSectionIndex];
  const totalSections = sections.length;
  const progress = ((currentSectionIndex + 1) / totalSections) * 100;
  const currentSectionHasSelection = !!selectedInterests[currentSection.id];
  const themesLoading = status === "idle" || status === "loading";
  const canFinish = !saving && selectedCount > 0 && status === "success";
  const showThemeModeToggle =
    !(step === "settings" && currentSettingsStep === "appearance");

  const handleInterestToggle = (interest: OnboardingInterest) => {
    toggleInterest(currentSection.id, interest.themeId);
  };

  const handleNext = () => {
    if (currentSectionIndex < totalSections - 1) {
      setSectionDirection(1);
      setCurrentSectionIndex((current) => current + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setSectionDirection(-1);
      setCurrentSectionIndex((current) => current - 1);
    }
  };

  const handleFinish = async () => {
    if (!canFinish) return;

    try {
      await saveSelections();
      setStepDirection(1);
      setStep("settings");
    } catch {
      // The hook keeps the user-facing error state.
    }
  };

  const handleCompleteSettings = () => {
    setScreenTransition({
      title: "Entrando a tu dashboard",
      description: "Aplicando tus preferencias y preparando tu ruta de aprendizaje.",
    });

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    if (routeTransitionDelayMs === 0) {
      router.push("/dashboard/graph");
      return;
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      router.push("/dashboard/graph");
    }, routeTransitionDelayMs);
  };

  return (
    <main className="relative min-h-screen bg-surface-secondary overflow-hidden">
      {showThemeModeToggle ? (
        <ThemeModeToggle className="fixed right-4 top-4 z-50 md:right-6 md:top-6" />
      ) : null}

      <AnimatedGraphBackground
        variant="dimmed"
        density={0.00006}
        maxDist={200}
        speed={0.18}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-surface-primary/20 via-surface-primary/10 to-surface-primary/30" />

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
              setTimeout(() => setShowIntro(false), 3000);
            }}
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-surface-primary/40"
          >
            <div className="max-w-5xl mx-auto px-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-content-primary mb-6 leading-tight px-4">
                  Elige tus intereses principales
                </h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-xl sm:text-2xl md:text-3xl text-content-secondary font-medium px-4"
                >
                  Personalizaremos tu experiencia según los temas que más te interesan
                </motion.p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  className="mt-8 inline-block"
                >
                  <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/gokai-logo.svg"
              alt="Gokai"
              width={48}
              height={48}
              priority
              className="dark:hidden"
            />
            <Image
              src="/logos/gokai-logo-dark.svg"
              alt=""
              width={48}
              height={48}
              priority
              className="hidden dark:block"
            />
            <span className="text-2xl font-bold text-content-primary">
              GOKAI
            </span>
            <span className="text-sm text-content-tertiary">語界</span>
          </div>
        </header>

        <AnimatePresence mode="wait" initial={false} custom={stepDirection}>
          {step === "settings" ? (
            <motion.div
              key="settings"
              custom={stepDirection}
              initial={{
                opacity: 0,
                x: stepDirection > 0 ? 42 : -42,
                filter: "blur(8px)",
              }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                x: stepDirection > 0 ? -30 : 30,
                filter: "blur(8px)",
              }}
              transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >
              <InitialExperienceSettings
                onBack={() => {
                  setStepDirection(-1);
                  setStep("interests");
                }}
                onComplete={handleCompleteSettings}
                onStepChange={setCurrentSettingsStep}
              />
            </motion.div>
          ) : (
            <motion.div
              key="interests"
              custom={stepDirection}
              initial={{
                opacity: 0,
                x: stepDirection > 0 ? 42 : -42,
                filter: "blur(8px)",
              }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                x: stepDirection > 0 ? -30 : 30,
                filter: "blur(8px)",
              }}
              transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >

        <div className="px-6 lg:px-16 xl:px-20 mb-6">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-0">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative flex-1 h-3 rounded-full overflow-hidden bg-surface-tertiary/90 shadow-inner">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.04] to-transparent" />

                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-accent/25 blur-md"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 20,
                    mass: 0.8,
                  }}
                />

                <motion.div
                  className="relative h-full rounded-full bg-gradient-to-r from-accent via-[#B85C52] to-[#C17B6F] shadow-[0_0_20px_rgba(153,51,49,0.35)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 20,
                    mass: 0.8,
                  }}
                >
                  <motion.div
                    className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["0%", "320%"] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  <div className="absolute inset-x-0 top-0 h-[45%] rounded-full bg-white/20" />
                </motion.div>
              </div>

              <motion.div
                key={currentSectionIndex}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-sm font-semibold text-content-secondary whitespace-nowrap"
              >
                {currentSectionIndex + 1} / {totalSections}
              </motion.div>
            </div>

            <div className="flex items-center justify-between text-sm gap-4">
              <span className="text-content-secondary">
                Categoría:{" "}
                <span className="font-semibold text-content-primary">
                  {currentSection.title}
                </span>
              </span>

              <span
                className={`font-semibold ${
                  currentSectionHasSelection ? "text-green-600" : "text-accent"
                }`}
              >
                {currentSectionHasSelection ? "✓ Seleccionado" : "Selecciona uno"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-0 lg:px-16 xl:px-20 pb-8">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait" initial={false} custom={sectionDirection}>
              <motion.div
                key={currentSection.id}
                custom={sectionDirection}
                initial={{
                  opacity: 0,
                  x: sectionDirection > 0 ? 54 : -54,
                  filter: "blur(8px)",
                }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  x: sectionDirection > 0 ? -54 : 54,
                  filter: "blur(8px)",
                }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-left mb-8">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h1 className="text-3xl md:text-4xl font-bold text-content-primary leading-tight">
                      {currentSection.title}
                    </h1>
                    <p className="text-lg text-content-secondary mt-1">
                      {currentSection.description}
                      {planVariant === "premium"
                        ? ". Elige tu tema principal ahora; podrás explorar más contenido después."
                        : ""}
                    </p>
                  </motion.div>
                </div>

                <div className="w-full overflow-visible">
                  <MobileInterestCarousel
                    interests={currentSection.interests}
                    currentSectionId={currentSection.id}
                    selectedInterests={selectedInterests}
                    onToggle={handleInterestToggle}
                    isResolving={themesLoading}
                  />
                </div>

                <DesktopInterestRow
                  interests={currentSection.interests}
                  currentSectionId={currentSection.id}
                  selectedInterests={selectedInterests}
                  onToggle={handleInterestToggle}
                  isResolving={themesLoading}
                />

                <div className="flex flex-col gap-5 mt-8">
                  <div className="text-center">
                    {(selectedCount > 0 || themesLoading || error) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex flex-wrap items-center justify-center gap-3 bg-surface-primary/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg"
                      >
                        {themesLoading ? (
                          <p className="text-sm text-content-secondary">
                            Cargando temas...
                          </p>
                        ) : error ? (
                          <>
                            <p className="text-sm text-accent">{error}</p>
                            <button
                              type="button"
                              onClick={retryLoadThemes}
                              className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reintentar
                            </button>
                          </>
                        ) : (
                          <p className="text-sm text-content-secondary">
                            <span className="font-bold text-accent text-base">
                              {selectedCount}
                            </span>{" "}
                            de {MAX_ONBOARDING_SELECTIONS} categorías completadas
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={currentSectionIndex === 0}
                      className="inline-flex w-[150px] items-center justify-center gap-2 sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-surface-primary/80 backdrop-blur-sm text-content-primary font-semibold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-primary transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    {currentSectionIndex < totalSections - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-[150px] sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-accent text-white font-semibold shadow-lg hover:opacity-95 transition"
                      >
                        Siguiente
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinish}
                        disabled={!canFinish}
                        className="w-[150px] sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-accent text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition"
                      >
                        {saving ? "Guardando intereses..." : "Continuar"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ScreenTransitionOverlay
        active={screenTransition !== null}
        title={screenTransition?.title ?? ""}
        description={screenTransition?.description}
      />
    </main>
  );
}
