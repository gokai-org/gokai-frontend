"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle2,
  Crown,
  RotateCcw,
  Sparkles,
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
import { OnboardingKanaAssessmentStep } from "./OnboardingKanaAssessmentStep";
import {
  DesktopInterestRow,
  MobileInterestCarousel,
} from "@/features/onboarding/components/OnboardingInterestOptions";
import type {
  OnboardingInterest,
  OnboardingKanaAssessmentSelections,
} from "@/features/onboarding/types";
import { getCurrentUser } from "@/features/auth/services/api";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { ThemeModeToggle } from "@/shared/components";
import { hasPremiumAccess } from "@/shared/lib/userAccess";
import { KanaExamModal } from "@/features/kana/components/quiz";
import type { KanaExamResult, KanaType } from "@/features/kana/types";

type OnboardingStep = "interests" | "settings" | "kana-assessment";
type PlanVariant = "free" | "premium";

const INITIAL_KANA_ASSESSMENT: OnboardingKanaAssessmentSelections = {
  hiragana: null,
  katakana: null,
};

const KANA_EXAM_ORDER: KanaType[] = ["hiragana", "katakana"];
const ONBOARDING_INTRO_HOLD_MS = 4200;
const ONBOARDING_TRANSITION_UNLOCKING_MS = 6000;
const ONBOARDING_TRANSITION_TOTAL_MS = 13200;

type OnboardingInterestsExperienceProps = {
  initialPlanVariant?: PlanVariant;
};

type FlowTransitionMode = "entry" | "completion";
type FlowTransitionPhase = "unlocking" | "ready";

type FlowTransitionState = {
  mode: FlowTransitionMode;
  passedKanaTypes: KanaType[];
  destinationStep?: Extract<OnboardingStep, "kana-assessment">;
};

type CompletionCopy = {
  celebrationTitle: string;
  celebrationDescription: string;
  readyTitle: string;
  readyDescription: string;
  badges: string[];
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
  const [userKanaPoints, setUserKanaPoints] = useState(0);
  const [kanaAssessmentSelections, setKanaAssessmentSelections] =
    useState<OnboardingKanaAssessmentSelections>(INITIAL_KANA_ASSESSMENT);
  const [kanaAssessmentResults, setKanaAssessmentResults] = useState<
    Partial<Record<KanaType, KanaExamResult>>
  >({});
  const [activeKanaExamType, setActiveKanaExamType] = useState<KanaType | null>(null);
  const [planVariant, setPlanVariant] =
    useState<PlanVariant>(initialPlanVariant);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [flowTransition, setFlowTransition] =
    useState<FlowTransitionState | null>(null);
  const [flowTransitionPhase, setFlowTransitionPhase] =
    useState<FlowTransitionPhase>("unlocking");
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

  useEffect(() => {
    router.prefetch("/dashboard/graph");
  }, [router]);

  useEffect(() => {
    let mounted = true;

    getCurrentUser().then((user) => {
      if (!mounted || !user) return;
      setPlanVariant(hasPremiumAccess(user) ? "premium" : "free");
      setUserKanaPoints(typeof user.kanaPoints === "number" ? user.kanaPoints : 0);
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

  const finalizeFlowTransition = useCallback((transition: FlowTransitionState) => {
    setFlowTransition(null);

    if (transition.mode === "entry" && transition.destinationStep) {
      setStepDirection(1);
      setStep(transition.destinationStep);
      return;
    }

    router.push("/dashboard/graph");
  }, [router]);

  useEffect(() => {
    if (!flowTransition) {
      return;
    }

    if (!platformMotion.shouldAnimate) {
      const completeTimeoutId = window.setTimeout(() => {
        finalizeFlowTransition(flowTransition);
      }, 0);

      return () => {
        window.clearTimeout(completeTimeoutId);
      };
    }

    const phaseTimeoutId = window.setTimeout(() => {
      setFlowTransitionPhase("ready");
    }, Math.max(4200, Math.round(ONBOARDING_TRANSITION_UNLOCKING_MS * platformMotion.durationScale)));

    const completeTimeoutId = window.setTimeout(() => {
      finalizeFlowTransition(flowTransition);
    }, Math.max(9200, Math.round(ONBOARDING_TRANSITION_TOTAL_MS * platformMotion.durationScale)));

    return () => {
      window.clearTimeout(phaseTimeoutId);
      window.clearTimeout(completeTimeoutId);
    };
  }, [
    finalizeFlowTransition,
    flowTransition,
    platformMotion.durationScale,
    platformMotion.shouldAnimate,
  ]);

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

  const completeOnboarding = (
    results: Partial<Record<KanaType, KanaExamResult>> = kanaAssessmentResults,
  ) => {
    const passedKanaTypes = KANA_EXAM_ORDER.filter(
      (kanaType) => results[kanaType]?.passed === true,
    );

    setFlowTransitionPhase("unlocking");
    setFlowTransition({
      mode: "completion",
      passedKanaTypes,
    });
  };

  const getPendingKanaExams = (
    selections: OnboardingKanaAssessmentSelections,
    results: Partial<Record<KanaType, KanaExamResult>>,
  ) => KANA_EXAM_ORDER.filter(
    (kanaType) => selections[kanaType] === "exam" && !results[kanaType],
  );

  const handleCompleteSettings = () => {
    setFlowTransitionPhase("unlocking");
    setFlowTransition({
      mode: "entry",
      passedKanaTypes: [],
      destinationStep: "kana-assessment",
    });
  };

  const handleKanaAssessmentChoice = (
    kanaType: KanaType,
    choice: OnboardingKanaAssessmentSelections[KanaType],
  ) => {
    setKanaAssessmentSelections((current) => ({
      ...current,
      [kanaType]: choice,
    }));
  };

  const handleStartKanaAssessment = () => {
    const pendingExamTypes = getPendingKanaExams(
      kanaAssessmentSelections,
      kanaAssessmentResults,
    );

    if (pendingExamTypes.length === 0) {
      completeOnboarding(kanaAssessmentResults);
      return;
    }

    setActiveKanaExamType(pendingExamTypes[0]);
  };

  const handleCloseKanaExam = (result?: KanaExamResult) => {
    const completedKanaType = activeKanaExamType;
    setActiveKanaExamType(null);

    if (!completedKanaType || !result) {
      return;
    }

    const nextResults = {
      ...kanaAssessmentResults,
      [completedKanaType]: result,
    };
    setKanaAssessmentResults(nextResults);

    if (result.passed) {
      setUserKanaPoints((current) =>
        completedKanaType === "katakana"
          ? Math.max(current, 705)
          : Math.max(current, 350),
      );
    }

    const pendingExamTypes = getPendingKanaExams(
      kanaAssessmentSelections,
      nextResults,
    );

    if (pendingExamTypes.length > 0) {
      setActiveKanaExamType(pendingExamTypes[0]);
      return;
    }

    completeOnboarding(nextResults);
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
              setTimeout(() => setShowIntro(false), ONBOARDING_INTRO_HOLD_MS);
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
          ) : step === "kana-assessment" ? (
            <motion.div
              key="kana-assessment"
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
              <OnboardingKanaAssessmentStep
                selections={kanaAssessmentSelections}
                results={kanaAssessmentResults}
                currentKanaPoints={userKanaPoints}
                busy={activeKanaExamType !== null}
                skipIntroTransition
                onBack={() => {
                  setStepDirection(-1);
                  setStep("settings");
                }}
                onContinue={handleStartKanaAssessment}
                onSelect={handleKanaAssessmentChoice}
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

      {flowTransition ? (
        <OnboardingFlowTransitionOverlay
          mode={flowTransition.mode}
          phase={flowTransitionPhase}
          passedKanaTypes={flowTransition.passedKanaTypes}
        />
      ) : null}

      {activeKanaExamType ? (
        <KanaExamModal
          kanaType={activeKanaExamType}
          onClose={handleCloseKanaExam}
        />
      ) : null}
    </main>
  );
}

function OnboardingFlowTransitionOverlay({
  mode,
  phase,
  passedKanaTypes,
}: {
  mode: FlowTransitionMode;
  phase: FlowTransitionPhase;
  passedKanaTypes: KanaType[];
}) {
  const copy = useMemo(
    () => getFlowTransitionCopy(mode, passedKanaTypes),
    [mode, passedKanaTypes],
  );

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden bg-surface-secondary">
      <AnimatedGraphBackground variant="dimmed" density={0.00006} maxDist={200} speed={0.18} />
      <TransitionGlow />
      <TransitionParticles />
      <div className="absolute inset-0 bg-gradient-to-b from-surface-primary/40 via-surface-primary/20 to-surface-primary/50" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
        <AnimatePresence mode="wait">
          {phase === "unlocking" ? (
            <motion.div
              key="unlocking"
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            >
              <TransitionSeal mode={mode} passedCount={passedKanaTypes.length} />
              <motion.span
                className="mt-10 text-3xl font-extrabold tracking-tight text-content-primary sm:text-4xl"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 1.2, ease: "easeOut" }}
              >
                {copy.unlockingTitle}
              </motion.span>
              <motion.p
                className="mt-3 max-w-sm text-sm leading-relaxed text-content-tertiary sm:text-base"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 1.4, ease: "easeOut" }}
              >
                {copy.unlockingDescription}
              </motion.p>

              <motion.div
                className="mt-8 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 1 }}
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="h-3 w-3 rounded-full bg-accent shadow-[0_0_16px_rgba(153,51,49,0.25)]"
                    animate={{
                      y: [0, -8, 0],
                      scale: [1, 1.55, 1],
                      opacity: [0.28, 1, 0.28],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: index * 0.32,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              className="flex w-full max-w-md flex-col items-center text-center"
              initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.7, ease: "easeOut" }}
            >
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 110, duration: 1.6 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent/12 blur-2xl"
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.28, 0.52, 0.28],
                  }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  animate={{ y: [0, -5, 0], rotate: [0, 1.5, -1.5, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src="/logos/gokai-logo.svg"
                    alt="Gokai"
                    width={92}
                    height={92}
                    priority
                    className="dark:hidden"
                  />
                  <Image
                    src="/logos/gokai-logo-dark.svg"
                    alt=""
                    width={92}
                    height={92}
                    priority
                    className="hidden dark:block"
                  />
                </motion.div>
              </motion.div>

              <motion.span
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/10 bg-surface-primary/80 px-4 py-2 text-xs font-bold text-accent shadow-sm backdrop-blur-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 1.1 }}
              >
                {copy.readyBadge}
              </motion.span>

              <motion.h1
                className="mt-5 text-4xl font-extrabold tracking-tight text-content-primary sm:text-5xl"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 1.2 }}
              >
                {copy.readyTitle}
              </motion.h1>

              <motion.p
                className="mt-3 max-w-sm text-sm leading-relaxed text-content-tertiary sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 1.3 }}
              >
                {copy.readyDescription}
              </motion.p>

              {copy.badges.length > 0 ? (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {copy.badges.map((badge, index) => (
                    <motion.span
                      key={badge}
                      className="inline-flex items-center rounded-full border border-accent/10 bg-surface-primary/82 px-4 py-2 text-sm font-semibold text-content-primary shadow-sm backdrop-blur-md"
                      initial={{ opacity: 0, y: 14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.16, duration: 0.7 }}
                    >
                      {badge}
                    </motion.span>
                  ))}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getFlowTransitionCopy(
  mode: FlowTransitionMode,
  passedKanaTypes: KanaType[],
): CompletionCopy & { unlockingTitle: string; unlockingDescription: string; readyBadge: string } {
  if (mode === "entry") {
    return {
      unlockingTitle: "Preparando tu evaluación inicial",
      unlockingDescription: "Estamos activando tu siguiente etapa del onboarding para que elijas cómo quieres empezar con los kana.",
      readyBadge: "Evaluación inicial",
      celebrationTitle: "",
      celebrationDescription: "",
      readyTitle: "Elige tu punto de partida",
      readyDescription: "Tu espacio de evaluación ya está listo. Ahora puedes decidir si validas Hiragana, Katakana o empiezas desde cero.",
      badges: ["Hiragana", "Katakana"],
    };
  }

  if (passedKanaTypes.length === 2) {
    return {
      unlockingTitle: "Registrando tu progreso inicial",
      unlockingDescription: "Estamos guardando el resultado de tus alfabetos aprobados y preparando tu entrada al dashboard.",
      readyBadge: "Dashboard listo",
      celebrationTitle: "Aprobaste Hiragana y Katakana",
      celebrationDescription: "Entraste al onboarding con ambos alfabetos validados y tu progreso inicial ya quedó registrado.",
      readyTitle: "Bienvenido a tu dashboard",
      readyDescription: "Tu ruta ya empieza con Hiragana y Katakana aprobados. Estamos preparando tu panel principal.",
      badges: ["Hiragana aprobado", "Katakana aprobado"],
    };
  }

  if (passedKanaTypes[0] === "hiragana") {
    return {
      unlockingTitle: "Registrando tu progreso inicial",
      unlockingDescription: "Estamos guardando tu aprobación de Hiragana y preparando tu entrada al dashboard.",
      readyBadge: "Dashboard listo",
      celebrationTitle: "Aprobaste Hiragana",
      celebrationDescription: "Tu base fonética ya quedó validada. Continuarás con tu progreso guardado desde el primer momento.",
      readyTitle: "Tu dashboard ya te espera",
      readyDescription: "Vamos a abrir tu panel principal con Hiragana aprobado y el resto de tu ruta listo para continuar.",
      badges: ["Hiragana aprobado"],
    };
  }

  if (passedKanaTypes[0] === "katakana") {
    return {
      unlockingTitle: "Registrando tu progreso inicial",
      unlockingDescription: "Estamos guardando tu aprobación de Katakana y preparando tu entrada al dashboard.",
      readyBadge: "Dashboard listo",
      celebrationTitle: "Aprobaste Katakana",
      celebrationDescription: "Tu evaluación registró Katakana como aprobado y ahora entraremos a tu dashboard con ese avance guardado.",
      readyTitle: "Tu dashboard ya te espera",
      readyDescription: "Vamos a abrir tu panel principal con Katakana aprobado y tu ruta inicial preparada para seguir aprendiendo.",
      badges: ["Katakana aprobado"],
    };
  }

  return {
    unlockingTitle: "Preparando tu dashboard",
    unlockingDescription: "Estamos cerrando tu configuración inicial y preparando tu entrada al panel principal.",
    readyBadge: "Dashboard listo",
    celebrationTitle: "Tu onboarding ya está listo",
    celebrationDescription: "Terminaste la configuración inicial. Ahora abriremos tu dashboard para seguir con tu ruta de aprendizaje.",
    readyTitle: "Bienvenido a tu dashboard",
    readyDescription: "Estamos preparando tu panel principal para que continúes desde tu punto de partida elegido.",
    badges: [],
  };
}

function TransitionParticles() {
  const particles = Array.from({ length: 14 }).map((_, index) => ({
    id: index,
    size: 6 + (index % 4) * 4,
    left: `${6 + ((index * 9) % 84)}%`,
    top: `${8 + ((index * 13) % 76)}%`,
    duration: 8 + (index % 4) * 1.4,
    delay: index * 0.24,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-surface-primary/18 blur-[1px] dark:bg-surface-primary/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -18, 0, 14, 0],
            x: [0, 8, -5, 3, 0],
            opacity: [0.14, 0.42, 0.18, 0.35, 0.14],
            scale: [1, 1.14, 0.96, 1.08, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function TransitionGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="absolute h-[520px] w-[520px] rounded-full bg-surface-primary/10 blur-3xl"
        animate={{ scale: [1, 1.08, 0.98, 1], opacity: [0.12, 0.18, 0.12, 0.12] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full bg-surface-primary/8 blur-3xl"
        animate={{ scale: [1, 1.16, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function TransitionSeal({
  mode,
  passedCount,
}: {
  mode: FlowTransitionMode;
  passedCount: number;
}) {
  const Icon = mode === "entry"
    ? Sparkles
    : passedCount >= 2
      ? Crown
      : passedCount === 1
        ? CheckCircle2
        : Sparkles;

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute h-[180px] w-[180px] rounded-full bg-accent/12 blur-2xl"
        animate={{
          scale: [1, 1.24, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute h-[140px] w-[140px] rounded-full border border-accent/15"
        animate={{
          scale: [1, 1.35],
          opacity: [0.7, 0],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      <motion.div
        className="absolute h-[140px] w-[140px] rounded-full border border-accent-hover/20"
        animate={{
          scale: [1, 1.5],
          opacity: [0.55, 0],
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute h-[220px] w-[220px] rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <motion.div
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-accent-hover/55 shadow-[0_0_20px_rgba(186,81,73,0.45)]"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <motion.div
        className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent via-[#A83F3A] to-accent-hover shadow-[0_20px_80px_rgba(153,51,49,0.35)]"
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 6, -6, 0],
        }}
        transition={{
          scale: {
            duration: 4.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border border-white/20"
          animate={{ rotate: -360 }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          animate={{
            y: [0, -3, 0],
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon className="h-11 w-11 text-content-inverted" />
        </motion.div>
      </motion.div>
    </div>
  );
}
