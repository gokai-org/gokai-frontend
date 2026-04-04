"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { saveUserInterests } from "@/features/auth/services/api";
import type { UserInterest } from "@/features/auth/types";
import { ThemeModeToggle } from "@/shared/components";

const INTEREST_SECTIONS = [
  {
    id: "entretenimiento",
    title: "Entretenimiento",
    description: "Tus pasiones y hobbies favoritos",
    interests: [
      {
        id: "anime-manga",
        kanji: "アニメ・マンガ",
        meaning: "Anime y Manga",
      },
      {
        id: "hobbies",
        kanji: "趣味・娯楽",
        meaning: "Hobbies y Ocio",
      },
      {
        id: "musica-cine",
        kanji: "音楽・映画・テレビ",
        meaning: "Música, Cine y TV",
      },
    ],
  },
  {
    id: "vida-diaria",
    title: "Cotidianidad y Emociones",
    description: "Tu día a día y relaciones",
    interests: [
      {
        id: "vida-diaria",
        kanji: "日常生活",
        meaning: "Vida Diaria",
      },
      {
        id: "familia",
        kanji: "家族・人間関係",
        meaning: "Familia y Relaciones",
      },
      {
        id: "sentimientos",
        kanji: "感情・状態",
        meaning: "Sentimientos y Estados",
      },
    ],
  },
  {
    id: "conocimiento",
    title: "Conocimiento",
    description: "Aprendizaje y educación",
    interests: [
      {
        id: "educacion",
        kanji: "教育",
        meaning: "Educación",
      },
      {
        id: "tecnologia",
        kanji: "技術",
        meaning: "Tecnología",
      },
      {
        id: "numeros",
        kanji: "数字・量",
        meaning: "Números y Cantidades",
      },
      {
        id: "fechas",
        kanji: "日付・時間",
        meaning: "Fechas y Horario",
      },
    ],
  },
  {
    id: "salud-bienestar",
    title: "Salud y Bienestar",
    description: "Cuidado personal y naturaleza",
    interests: [
      {
        id: "medicina",
        kanji: "医療・健康",
        meaning: "Medicina y Salud",
      },
      {
        id: "clima",
        kanji: "天気・自然",
        meaning: "Clima y Naturaleza",
      },
      {
        id: "deportes",
        kanji: "スポーツ",
        meaning: "Deportes",
      },
    ],
  },
  {
    id: "mundo-sociedad",
    title: "Mundo y Sociedad",
    description: "Viajes y cultura global",
    interests: [
      {
        id: "geografia",
        kanji: "地理・国",
        meaning: "Geografía y Países",
      },
      {
        id: "ciudad",
        kanji: "都市・場所",
        meaning: "Ciudad y Lugares",
      },
      {
        id: "transporte",
        kanji: "交通手段",
        meaning: "Medios de Transporte",
      },
      {
        id: "viajes",
        kanji: "旅行・観光",
        meaning: "Viajes y Turismo",
      },
    ],
  },
  {
    id: "estilo-comunicacion",
    title: "Estilo y Comunicación",
    description: "Expresión y apariencia",
    interests: [
      {
        id: "moda",
        kanji: "服・ファッション",
        meaning: "Ropa y Moda",
      },
      {
        id: "colores",
        kanji: "色・外見",
        meaning: "Colores y Apariencia",
      },
      {
        id: "medios",
        kanji: "メディア",
        meaning: "Medios de Comunicación",
      },
    ],
  },
];

const MAX_FREE_SELECTIONS = 6;

const ONBOARDING_CARD_STYLES: {
  bg: string;
  text: string;
  badge: string;
  kanji: string;
  border: string;
}[] = [
  {
    bg: "bg-surface-tertiary dark:bg-[#1a1a1a]",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    kanji: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
  },
  {
    bg: "bg-accent/15 dark:bg-accent/20",
    text: "text-content-primary dark:text-white",
    badge: "bg-accent/15 dark:bg-accent/25",
    kanji: "text-accent dark:text-accent",
    border: "border-accent/20 dark:border-accent/25",
  },
  {
    bg: "bg-accent dark:bg-accent",
    text: "text-white",
    badge: "bg-white/15",
    kanji: "text-white",
    border: "border-white/10",
  },
  {
    bg: "bg-surface-secondary dark:bg-surface-secondary",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    kanji: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
  },
];

function OnboardingInterestCard({
  interest,
  index,
  total,
  isSelected,
  onClick,
  compact = false,
}: {
  interest: {
    id: string;
    kanji: string;
    meaning: string;
  };
  index: number;
  total: number;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const style = ONBOARDING_CARD_STYLES[index % ONBOARDING_CARD_STYLES.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        compact
          ? "group relative flex h-full w-full min-h-[360px] sm:min-h-[430px] md:min-h-[500px] flex-col justify-between overflow-hidden rounded-[24px] sm:rounded-[26px] border text-left font-sans"
          : "group relative flex h-full w-full min-h-[360px] sm:min-h-[410px] md:min-h-[460px] lg:min-h-[520px] flex-col justify-between overflow-hidden rounded-[26px] sm:rounded-[30px] border text-left font-sans",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        compact
          ? "shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
          : "shadow-[0_12px_36px_rgba(0,0,0,0.08)]",
        compact
          ? "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)]"
          : "hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(0,0,0,0.08)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        style.bg,
        style.text,
        style.border,
        isSelected
          ? compact
            ? "ring-2 ring-accent shadow-[0_14px_30px_rgba(153,51,49,0.20)]"
            : "ring-2 ring-accent scale-[1.02] shadow-[0_22px_60px_rgba(153,51,49,0.20)]"
          : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-start overflow-hidden pl-4 pb-5 sm:pl-5 sm:pb-6 lg:pl-5 lg:pb-6">
        <span
          className={[
            "font-black leading-none transition-all duration-500 select-none whitespace-pre-line",
            style.kanji,
            compact
              ? isSelected
                ? "text-[4.9rem] sm:text-[6rem] md:text-[7.25rem] opacity-[0.14] scale-105"
                : "text-[4.5rem] sm:text-[5.6rem] md:text-[6.75rem] opacity-[0.08]"
              : isSelected
                ? "text-[5.75rem] sm:text-[7.5rem] md:text-[8.75rem] lg:text-[13rem] opacity-[0.14] scale-105"
                : "text-[5.25rem] sm:text-[6.75rem] md:text-[8rem] lg:text-[12rem] opacity-[0.08]",
          ].join(" ")}
        >
          {interest.kanji.split("・").join("\n")}
        </span>
      </div>

      <div className={compact ? "relative z-10 p-4 sm:p-4.5 md:p-5" : "relative z-10 p-4 sm:p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={[
                "font-black uppercase tracking-[0.25em] opacity-55",
                compact ? "text-[9px] sm:text-[10px]" : "text-[10px]",
              ].join(" ")}
            >
              Interés
            </p>
            <h3
              className={[
                "mt-2 font-extrabold leading-[1.08] tracking-tight",
                compact
                  ? "text-[1rem] sm:text-[1.08rem] md:text-[1.2rem]"
                  : "text-base sm:text-lg md:text-xl lg:text-xl",
              ].join(" ")}
            >
              {interest.meaning}
            </h3>
          </div>

          <div
            className={[
              compact
                ? "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm"
                : "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm",
              style.badge,
            ].join(" ")}
          >
            {isSelected ? (
              <svg
                className="h-4 w-4 text-accent dark:text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="text-xs font-bold opacity-70">
                {String(index + 1).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={
          compact
            ? "relative z-10 p-4 pt-0 sm:p-4.5 sm:pt-0 md:p-5 md:pt-0"
            : "relative z-10 p-4 pt-0 sm:p-5 sm:pt-0"
        }
      >
        <p
          className={[
            "font-mono tracking-[0.18em] opacity-45 mb-2",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px]",
          ].join(" ")}
        >
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </p>

        <p
          className={[
            "leading-relaxed opacity-75",
            compact ? "text-xs sm:text-sm md:text-[15px]" : "text-xs sm:text-sm md:text-[15px]",
          ].join(" ")}
        >
          {interest.kanji}
        </p>

        <div className={compact ? "mt-4 flex flex-wrap items-center justify-between gap-3" : "mt-4 flex flex-wrap items-center justify-between gap-3"}>
          <span
            className={[
              "font-semibold opacity-80",
              compact ? "text-xs sm:text-sm" : "text-xs sm:text-sm",
            ].join(" ")}
          >
            {isSelected ? "Seleccionado" : "Tocar para elegir"}
          </span>

          <span
            className={[
              compact
                ? "inline-flex items-center rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-semibold"
                : "inline-flex items-center rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-semibold",
              isSelected
                ? "bg-accent text-white"
                : "bg-black/5 text-content-secondary dark:bg-white/10 dark:text-white/80",
            ].join(" ")}
          >
            {isSelected ? "Activo" : "Elegir"}
          </span>
        </div>
      </div>
    </button>
  );
}

function MobileInterestCarousel({
  interests,
  currentSectionId,
  selectedInterests,
  onToggle,
}: {
  interests: {
    id: string;
    kanji: string;
    meaning: string;
  }[];
  currentSectionId: string;
  selectedInterests: Record<string, string>;
  onToggle: (interestId: string) => void;
}) {
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
          const isSelected = selectedInterests[currentSectionId] === interest.id;

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
                onClick={() => onToggle(interest.id)}
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

function DesktopInterestRow({
  interests,
  currentSectionId,
  selectedInterests,
  onToggle,
}: {
  interests: {
    id: string;
    kanji: string;
    meaning: string;
  }[];
  currentSectionId: string;
  selectedInterests: Record<string, string>;
  onToggle: (interestId: string) => void;
}) {
  return (
    <div className="hidden lg:flex lg:items-stretch lg:justify-center lg:gap-6 w-full max-w-[1600px] mx-auto">
      {interests.map((interest, index) => {
        const isSelected = selectedInterests[currentSectionId] === interest.id;

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
              onClick={() => onToggle(interest.id)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export default function InterestsPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);

  const currentSection = INTEREST_SECTIONS[currentSectionIndex];
  const totalSections = INTEREST_SECTIONS.length;
  const progress = ((currentSectionIndex + 1) / totalSections) * 100;
  const selectedCount = Object.keys(selectedInterests).length;
  const currentSectionHasSelection = !!selectedInterests[currentSection.id];

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) => {
      const newSelections = { ...prev };

      if (newSelections[currentSection.id] === interestId) {
        delete newSelections[currentSection.id];
      } else {
        newSelections[currentSection.id] = interestId;
      }

      return newSelections;
    });
  };

  const handleNext = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (selectedCount === 0) return;

    setLoading(true);

    try {
      const interests: UserInterest[] = Object.entries(selectedInterests).map(
        ([categoryId, interestId]) => ({
          categoryId,
          interestId,
        }),
      );

      await saveUserInterests(interests);
      router.push("/dashboard/graph");
    } catch (error) {
      console.error("Error guardando intereses:", error);
      router.push("/dashboard/graph");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-surface-secondary overflow-hidden">
      <ThemeModeToggle className="fixed right-4 top-4 z-50 md:right-6 md:top-6" />

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
                  Crearemos un camino de aprendizaje perfecto para ti
                </h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-xl sm:text-2xl md:text-3xl text-content-secondary font-medium px-4"
                >
                  Selecciona un interés en cada categoría
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
                {currentSectionHasSelection
                  ? "✓ Seleccionado"
                  : "Selecciona uno"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-0 lg:px-16 xl:px-20 pb-8">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
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
                    </p>
                  </motion.div>
                </div>

                <div className="w-full overflow-visible">
                  <MobileInterestCarousel
                    interests={currentSection.interests}
                    currentSectionId={currentSection.id}
                    selectedInterests={selectedInterests}
                    onToggle={handleInterestToggle}
                  />
                </div>

                <DesktopInterestRow
                  interests={currentSection.interests}
                  currentSectionId={currentSection.id}
                  selectedInterests={selectedInterests}
                  onToggle={handleInterestToggle}
                />

                <div className="flex flex-col gap-5 mt-8">
                  <div className="text-center">
                    {selectedCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block bg-surface-primary/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg"
                      >
                        <p className="text-sm text-content-secondary">
                          <span className="font-bold text-accent text-base">
                            {selectedCount}
                          </span>{" "}
                          de {MAX_FREE_SELECTIONS} categorías completadas
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
                    <button
                      onClick={handlePrevious}
                      disabled={currentSectionIndex === 0}
                      className="w-[150px] sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-surface-primary/80 backdrop-blur-sm text-content-primary font-semibold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-primary transition"
                    >
                      Anterior
                    </button>

                    {currentSectionIndex < totalSections - 1 ? (
                      <button
                        onClick={handleNext}
                        className="w-[150px] sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-accent text-white font-semibold shadow-lg hover:opacity-95 transition"
                      >
                        Siguiente
                      </button>
                    ) : (
                      <button
                        onClick={handleFinish}
                        disabled={loading || selectedCount === 0}
                        className="w-[150px] sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-accent text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition"
                      >
                        {loading ? "Guardando..." : "Finalizar"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}