"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Compass,
  Crown,
  Gem,
  LockKeyhole,
  Map,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { KazuSvgMascot } from "@/features/mascot";
import {
  DesktopInterestRow,
  MobileInterestCarousel,
} from "@/features/onboarding/components/OnboardingInterestOptions";
import { useOnboardingInterests } from "@/features/onboarding/hooks/useOnboardingInterests";
import type { OnboardingInterest } from "@/features/onboarding/types";
import { useMiniDockBlocker } from "@/features/dashboard/utils/miniDockBlockers";
import { stopModalEvent, useModalPageLock } from "@/shared/hooks/useModalPageLock";

const SHOGI_PATH =
  "M 33 5 Q 40 0 47 5 L 73 26 Q 80 31 80 39 L 80 86 Q 80 96 69 96 L 11 96 Q 0 96 0 86 L 0 39 Q 0 31 7 26 Z";

const SHOGI_MASK_IMAGE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><path fill="white" d="${SHOGI_PATH}"/></svg>`,
)}")`;

type GraphGateModalVariant = "missing-interests" | "kana-required";
type MissingInterestsStep = "intro" | "picker";

type KanaCardAction = {
  label: string;
  onClick: () => void;
};

type GraphGateModalProps = {
  open: boolean;
  variant: GraphGateModalVariant;
  blockedContentLabel?: string;
  onClose: () => void;
  onSaveInterests?: () => Promise<void> | void;
  onOpenHiragana?: () => void;
  onOpenKatakana?: () => void;
};

type KanaShowcaseCardProps = {
  title: string;
  subtitle: string;
  description: string;
  tileCharacter: string;
  shape: "shoji" | "mahjong";
  action: KanaCardAction;
};

const missingInterestFeatures = [
  {
    icon: Map,
    title: "Mapa inicial más claro",
    description:
      "El Mapa de Japón prioriza primero las regiones y categorías que mejor encajan con lo que quieres estudiar.",
  },
  {
    icon: BookOpen,
    title: "La misma selección, sin salir de aquí",
    description:
      "Usas la selección de intereses que ya conoce la app, pero dentro de esta misma ventana.",
  },
  {
    icon: Sparkles,
    title: "Tu progreso sigue intacto",
    description:
      "No reinicias nada: solo preparas una entrada más clara para explorar el mapa desde el principio.",
  },
] as const;

const missingInterestRetainedItems = [
  "Tus intereses guardados se respetan cuando ya existen",
  "Tu progreso, favoritos y contenido desbloqueado se mantienen",
  "Podrás volver a ajustar tus intereses más adelante",
] as const;

const missingInterestPanelHighlights = [
  "Ordena tu Mapa de Japón sin salir de esta ventana",
  "Conserva tu progreso, favoritos y contenido desbloqueado",
  "Ajusta de nuevo tus intereses cuando quieras",
] as const;

const missingInterestDesktopDetails = [
  {
    title: "Qué cambia ahora",
    items: [
      "El mapa prioriza regiones y categorías cercanas a tus gustos.",
      "La entrada inicial se vuelve más clara desde el primer toque.",
      "Tus siguientes temas sugeridos se ordenan mejor desde graph.",
    ],
  },
  {
    title: "Lo que mantienes intacto",
    items: missingInterestRetainedItems,
  },
] as const;

function getBoardPieceStyle(shape: "shoji" | "mahjong"): CSSProperties {
  if (shape === "shoji") {
    return {
      width: 118,
      height: 144,
      background: "linear-gradient(160deg, #7B3F8A 0%, #A866B5 100%)",
      WebkitMaskImage: SHOGI_MASK_IMAGE,
      maskImage: SHOGI_MASK_IMAGE,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
      boxShadow: "0 18px 54px rgba(0,0,0,0.18)",
    };
  }

  return {
    width: 118,
    height: 144,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "linear-gradient(165deg, #1B5078 0%, #2E82B5 100%)",
    boxShadow: "0 18px 54px rgba(0,0,0,0.18)",
  };
}

function getBoardPieceSymbolStyle(shape: "shoji" | "mahjong"): CSSProperties {
  return {
    fontSize: shape === "shoji" ? "3.25rem" : "3.5rem",
    transform: shape === "shoji" ? "translateY(10px)" : "translateY(-2px)",
  };
}

function KanaShowcaseCard({
  title,
  subtitle,
  description,
  tileCharacter,
  shape,
  action,
}: KanaShowcaseCardProps) {
  const isShoji = shape === "shoji";

  const config = isShoji
    ? {
        accent: "#7B3F8A",
        accentSoft: "rgba(123,63,138,0.14)",
        accentBorder: "rgba(123,63,138,0.24)",
        shortLabel: "SHOGI",
        boardLabel: "Base fonética del japonés",
        icon: Crown,
      }
    : {
        accent: "#1B5078",
        accentSoft: "rgba(27,80,120,0.14)",
        accentBorder: "rgba(27,80,120,0.24)",
        shortLabel: "MAHJONG",
        boardLabel: "Sonidos modernos",
        icon: Gem,
      };

  const Icon = config.icon;

  return (
    <motion.button
      type="button"
      onClick={action.onClick}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="group w-full overflow-hidden rounded-[28px] border border-border-default bg-surface-primary/90 text-left shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 sm:rounded-[34px]"
    >
      <div className="relative h-[176px] overflow-hidden border-b border-border-subtle px-5 pb-5 pt-5 sm:h-[176px] sm:px-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${config.accentSoft}, transparent 58%)`,
          }}
        />

        <div className="relative grid h-full grid-cols-[minmax(0,1fr)_48px] items-start gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-content-muted dark:text-white/40">
              {config.shortLabel}
            </p>

            <h3 className="mt-3 text-[1.7rem] font-black leading-[1.05] tracking-tight text-content-primary dark:text-white sm:text-[2rem]">
              {title}
            </h3>

            <p className="mt-3 h-[2.75rem] max-w-[28ch] text-sm leading-relaxed text-content-secondary dark:text-white/68">
              {config.boardLabel}
            </p>
          </div>

          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: config.accentSoft,
              border: `1px solid ${config.accentBorder}`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: config.accent }} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_170px] md:items-center">
        <div className="order-2 flex flex-col gap-3 md:order-1">
          <span
            className="inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]"
            style={{
              borderColor: config.accentBorder,
              color: config.accent,
              background: config.accentSoft,
            }}
          >
            {subtitle}
          </span>

          <p className="max-w-[38ch] text-sm leading-relaxed text-content-secondary dark:text-white/68">
            {description}
          </p>

          <span
            className="inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: config.accent }}
          >
            {action.label}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>

        <div className="order-1 flex items-center justify-center md:order-2">
          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            transition={{ duration: 0.28 }}
            className="relative flex h-[160px] w-full max-w-[170px] items-center justify-center sm:h-[190px]"
          >
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{ background: config.accentSoft }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.72, 0.45] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {!isShoji ? (
              <motion.div
                className="absolute inset-[18px] rounded-full border"
                style={{ borderColor: config.accentBorder }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.9, 0.55] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}

            <div
              className="relative z-10 flex items-center justify-center overflow-hidden"
              style={getBoardPieceStyle(shape)}
            >
              <span
                className="pointer-events-none absolute select-none font-black leading-none text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
                style={getBoardPieceSymbolStyle(shape)}
              >
                {tileCharacter}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="border-t border-border-subtle bg-surface-secondary/58 px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold leading-5 text-content-secondary dark:text-white/62">
          {isShoji
            ? "Puedes validar Hiragana o empezar desde la ruta base guiada."
            : "Katakana termina de abrir la lectura moderna y el acceso al resto del contenido."}
        </p>
      </div>
    </motion.button>
  );
}

function MissingInterestsVisualPanel({
  currentSectionTitle,
  currentSectionIndex,
  totalSections,
  selectedCount,
  step,
  onClose,
}: {
  currentSectionTitle: string | null;
  currentSectionIndex: number;
  totalSections: number;
  selectedCount: number;
  step: MissingInterestsStep;
  onClose: () => void;
}) {
  const isPicker = step === "picker";
  const sectionProgressLabel = `${Math.min(currentSectionIndex + 1, Math.max(totalSections, 1))}/${Math.max(totalSections, 1)}`;
  const badgeLabel = isPicker ? "Intereses" : "Ruta inicial";
  const heroTitle = isPicker
    ? currentSectionTitle
      ? `Elige ${currentSectionTitle}`
      : "Elige tus intereses"
    : "Personaliza tu mapa antes de empezar";
  const heroDescription = isPicker
    ? `Vas en la sección ${Math.min(currentSectionIndex + 1, Math.max(totalSections, 1))} de ${Math.max(totalSections, 1)}. Selecciona al menos una opción para ordenar mejor el mapa desde el principio.`
    : "No encontramos intereses guardados para tu ruta actual. Vamos a acomodar el Mapa de Japón con la misma selección de intereses que ya usas en la app.";
  const mobileDescription = isPicker
    ? ""
    : "Vuelve a elegir tus intereses y acomoda tu mapa en esta misma ventana.";
  const footerLabel = isPicker
    ? `${selectedCount} intereses seleccionados`
    : "Tu progreso actual se mantiene";

  return (
    <div className="relative order-1 flex flex-col overflow-hidden bg-gradient-to-br from-accent to-accent-hover text-content-inverted xl:order-2 xl:w-[340px] xl:flex-shrink-0 2xl:w-[380px]">
      <div className="pointer-events-none absolute -right-10 -top-10 hidden h-32 w-32 rounded-full bg-surface-primary/10 xl:block" />
      <div className="pointer-events-none absolute -left-6 bottom-8 hidden h-20 w-20 rounded-full bg-surface-primary/5 xl:block" />
      <div className="pointer-events-none absolute right-4 bottom-4 hidden h-14 w-14 rounded-full bg-surface-primary/5 xl:block" />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/70 transition-colors hover:bg-surface-primary/10 hover:text-content-inverted xl:hidden"
        aria-label="Cerrar modal de intereses"
      >
        <X className="h-4.5 w-4.5" />
      </button>

      <div className="relative z-[1] px-5 pb-4 pt-4 text-center sm:px-6 xl:px-7 xl:pb-0 xl:pt-8 xl:text-left">
        <div className="flex items-center justify-center gap-3 xl:justify-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-primary/20 backdrop-blur-sm sm:h-12 sm:w-12">
            <Compass className="h-5 w-5 text-content-inverted sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-[1.35rem] font-extrabold tracking-tight sm:text-2xl">KAZU</p>
            <p className="hidden text-xs text-white/78 sm:text-sm xl:block">Te ayuda a ordenar tu Mapa de Japón</p>
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/92 backdrop-blur-sm sm:mt-5 sm:text-[11px] sm:tracking-[0.24em]">
          <Sparkles className="h-3.5 w-3.5" />
          {badgeLabel}
        </div>

        <h2 className="mx-auto mt-3 max-w-[15ch] text-[1.7rem] font-black leading-[1.02] tracking-tight sm:text-[2.15rem] xl:mx-0 xl:mt-5 xl:max-w-[14ch] xl:text-[2.6rem]">
          {heroTitle}
        </h2>

        <p className="mt-4 hidden text-sm leading-7 text-white/82 xl:block">
          {heroDescription}
        </p>

        {mobileDescription ? (
          <p className="mx-auto mt-2 max-w-[32ch] text-[13px] leading-5 text-white/82 xl:hidden">
            {mobileDescription}
          </p>
        ) : null}

        <div className="mt-7 hidden space-y-3.5 xl:block">
          {missingInterestPanelHighlights.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-white/80" />
              <p className="text-sm leading-6 text-white/88">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 hidden justify-center xl:mt-7 xl:flex xl:justify-start">
          <div className="relative flex h-[148px] w-[148px] items-center justify-center rounded-full bg-surface-primary/10 backdrop-blur-sm sm:h-[170px] sm:w-[170px] xl:h-[240px] xl:w-[240px] 2xl:h-[280px] 2xl:w-[280px]">
            <div className="absolute inset-[18px] rounded-full border border-white/12" />
            <KazuSvgMascot
              state="idle"
              size={150}
              reducedMotion
              className="drop-shadow-none"
            />
          </div>
        </div>
      </div>

      <div className="hidden items-center justify-between gap-3 px-7 pb-6 text-xs text-white/58 xl:flex">
        <div className="flex items-center gap-3">
          <Star className="h-3.5 w-3.5" />
          <span>{footerLabel}</span>
        </div>
        {isPicker ? <span>{sectionProgressLabel}</span> : null}
      </div>
    </div>
  );
}

function MissingInterestsSelector({
  open,
  onClose,
  onSaveInterests,
}: {
  open: boolean;
  onClose: () => void;
  onSaveInterests?: () => Promise<void> | void;
}) {
  const [step, setStep] = useState<MissingInterestsStep>("intro");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
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
    if (!open) {
      return;
    }

    setStep("intro");
    setCurrentSectionIndex(0);
    setSaveError(null);
  }, [open]);

  useEffect(() => {
    if (currentSectionIndex < sections.length) {
      return;
    }

    setCurrentSectionIndex(Math.max(0, sections.length - 1));
  }, [currentSectionIndex, sections.length]);

  const currentSection = sections[currentSectionIndex] ?? null;
  const totalSections = sections.length;
  const progress = totalSections > 0 ? ((currentSectionIndex + 1) / totalSections) * 100 : 0;
  const canGoBack = currentSectionIndex > 0;
  const canGoNext = currentSectionIndex < totalSections - 1;
  const canSave = selectedCount > 0 && !saving && status === "success";
  const currentSectionHasSelection = currentSection
    ? Boolean(selectedInterests[currentSection.id])
    : false;

  const handleToggle = (interest: OnboardingInterest) => {
    if (!currentSection) {
      return;
    }

    toggleInterest(currentSection.id, interest.themeId);
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setSaveError(null);

    try {
      await saveSelections();
      await onSaveInterests?.();
      onClose();
    } catch {
      setSaveError("No se pudieron guardar tus intereses. Inténtalo otra vez.");
    }
  };

  const renderPickerBody = () => {
    if (status === "loading" || status === "idle") {
      return (
        <div className="rounded-[28px] border border-border-subtle bg-surface-secondary/60 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-content-primary">
            Preparando tus intereses disponibles...
          </p>
          <p className="mt-2 text-sm leading-6 text-content-secondary">
            Estamos organizando las regiones y categorías para personalizar tu mapa.
          </p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="rounded-[28px] border border-border-subtle bg-surface-secondary/60 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-content-primary">
            No pudimos cargar tus intereses.
          </p>
          <p className="mt-2 text-sm leading-6 text-content-secondary">
            {error ?? "Inténtalo de nuevo para seguir personalizando tu mapa."}
          </p>
          <button
            type="button"
            onClick={retryLoadThemes}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-content-inverted transition-colors hover:bg-accent-hover"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (!currentSection) {
      return (
        <div className="rounded-[28px] border border-border-subtle bg-surface-secondary/60 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-content-primary">
            No encontramos categorías disponibles.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="rounded-[24px] border border-border-subtle bg-surface-secondary/60 p-4 sm:rounded-[28px] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-accent">
                <span>
                  Categoria {Math.min(currentSectionIndex + 1, totalSections)} de {totalSections}
                </span>
                {currentSectionHasSelection ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/15 bg-accent/10 px-2 py-0.5 text-[10px] tracking-[0.14em]">
                    <CheckCircle2 className="h-3 w-3" />
                    Lista
                  </span>
                ) : null}
              </div>

              <h3 className="mt-2 text-[1.45rem] font-black tracking-tight text-content-primary sm:mt-3 sm:text-2xl">
                {currentSection.title}
              </h3>

              <p className="mt-2 hidden text-sm leading-7 text-content-secondary sm:block">
                {currentSection.description}
              </p>
            </div>

            <div className="w-full rounded-2xl border border-border-subtle bg-surface-primary px-4 py-3 shadow-sm sm:max-w-[220px]">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-content-muted">
                <span>Avance</span>
                <span>{selectedCount} elegidos</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-tertiary">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <MobileInterestCarousel
          interests={currentSection.interests}
          currentSectionId={currentSection.id}
          selectedInterests={selectedInterests}
          onToggle={handleToggle}
          isResolving={saving}
          variant="modal"
        />

        <DesktopInterestRow
          interests={currentSection.interests}
          currentSectionId={currentSection.id}
          selectedInterests={selectedInterests}
          onToggle={handleToggle}
          isResolving={saving}
          variant="modal"
        />
      </div>
    );
  };

  if (step === "intro") {
    return (
      <div className="flex min-h-0 flex-col xl:flex-row">
        <div className="relative order-2 flex min-h-0 flex-1 flex-col xl:order-1">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 hidden rounded-full p-1.5 text-content-muted transition-colors hover:bg-surface-tertiary hover:text-content-secondary xl:flex"
            aria-label="Cerrar modal de intereses"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          <div className="min-h-0 flex-1 px-5 py-5 sm:px-6 xl:overflow-y-auto xl:overscroll-contain xl:pb-4 xl:pt-6">
            <p className="text-sm font-semibold text-content-primary">
              Personaliza tu Mapa de Japón
            </p>

            <div className="mt-4 space-y-2.5">
              {missingInterestFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-surface-secondary"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <feature.icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-content-primary">
                      {feature.title}
                    </p>
                    <p className="text-xs leading-relaxed text-content-tertiary">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 hidden gap-4 xl:grid xl:grid-cols-2">
              {missingInterestDesktopDetails.map((section) => (
                <div
                  key={section.title}
                  className="rounded-[28px] border border-border-subtle bg-surface-secondary/55 px-5 py-5"
                >
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-content-muted">
                    {section.title}
                  </p>

                  <div className="mt-4 space-y-3">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-primary text-content-secondary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-sm leading-6 text-content-secondary">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border-subtle bg-surface-secondary/50 px-5 py-4 sm:px-6 xl:py-5">
            <p className="mb-3 hidden text-sm leading-6 text-content-secondary xl:block">
              Elige tus intereses aquí mismo y sigue dentro del Mapa de Japón con una ruta mucho más clara desde el inicio.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep("picker")}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-accent/25 focus:outline-none focus:ring-4 focus:ring-accent/20"
              >
                Elegir intereses
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-border-default bg-surface-primary px-5 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary hover:text-content-primary"
              >
                Cerrar por ahora
              </button>
            </div>
          </div>
        </div>

        <MissingInterestsVisualPanel
          currentSectionTitle={null}
          currentSectionIndex={0}
          totalSections={totalSections}
          selectedCount={selectedCount}
          step={step}
          onClose={onClose}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col xl:flex-row">
      <div className="relative order-2 flex min-h-0 flex-1 flex-col xl:order-1">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 hidden rounded-full p-1.5 text-content-muted transition-colors hover:bg-surface-tertiary hover:text-content-secondary xl:flex"
          aria-label="Cerrar modal de intereses"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 xl:pb-4 xl:pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("intro")}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-border-default bg-surface-secondary px-3.5 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary hover:text-content-primary sm:min-h-11 sm:px-4"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <div className="hidden rounded-full border border-accent/15 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-accent xl:inline-flex">
              {selectedCount} seleccionados
            </div>
          </div>

          <div className="mt-3 sm:mt-5">{renderPickerBody()}</div>

          {saveError || error ? (
            <div className="mt-5 rounded-2xl border border-red-500/18 bg-red-500/[0.05] px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {saveError ?? error}
            </div>
          ) : null}
        </div>

        <div className="border-t border-border-subtle bg-surface-secondary/50 px-4 py-3 sm:px-6 sm:py-4 xl:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="hidden sm:block">
              <p className="text-sm font-black text-content-primary">
                Guarda tus intereses para desbloquear tu ruta inicial
              </p>
              <p className="mt-1 text-sm leading-6 text-content-secondary">
                Puedes avanzar entre secciones y dejar al menos una selección para preparar el mapa.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  if (canGoBack) {
                    setCurrentSectionIndex((current) => current - 1);
                  }
                }}
                disabled={!canGoBack || saving}
                className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-border-default bg-surface-primary px-4 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11"
              >
                Anterior
              </button>

              <button
                type="button"
                onClick={() => {
                  if (canGoNext) {
                    setCurrentSectionIndex((current) => current + 1);
                    return;
                  }

                  void handleSave();
                }}
                disabled={(canGoNext && !currentSectionHasSelection) || (!canGoNext && !canSave)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-accent/25 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11"
              >
                {canGoNext ? "Siguiente sección" : saving ? "Guardando..." : "Guardar intereses"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MissingInterestsVisualPanel
        currentSectionTitle={currentSection?.title ?? null}
        currentSectionIndex={currentSectionIndex}
        totalSections={totalSections}
        selectedCount={selectedCount}
        step={step}
        onClose={onClose}
      />
    </div>
  );
}

export function GraphGateModal({
  open,
  variant,
  blockedContentLabel,
  onClose,
  onSaveInterests,
  onOpenHiragana,
  onOpenKatakana,
}: GraphGateModalProps) {
  useMiniDockBlocker(open);
  useModalPageLock(open);

  const missingInterests = variant === "missing-interests";
  const title = `Completa tus kanas para entrar a ${blockedContentLabel ?? "este contenido"}`;
  const description =
    "Puedes recorrer el tablero, pero para abrir vocabulario, gramática o kanjis necesitas completar Hiragana y Katakana, o aprobar sus exámenes iniciales.";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-vocabulary-overlay="true"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-4"
          onClick={onClose}
          onWheelCapture={stopModalEvent}
          onPointerDown={stopModalEvent}
          onPointerMove={stopModalEvent}
          onTouchMoveCapture={stopModalEvent}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 14 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={[
              "relative my-2 flex max-h-[calc(100dvh-24px)] w-full flex-col overflow-hidden rounded-[26px] bg-surface-primary shadow-[0_24px_64px_rgba(0,0,0,0.18)] ring-1 ring-border-subtle sm:my-4 sm:max-h-[calc(100dvh-32px)] sm:rounded-3xl",
              missingInterests ? "max-w-[460px] sm:max-w-[min(92rem,100%)]" : "max-w-4xl",
            ].join(" ")}
            onClick={(event) => event.stopPropagation()}
          >
            {missingInterests ? (
              <MissingInterestsSelector
                open={open}
                onClose={onClose}
                onSaveInterests={onSaveInterests}
              />
            ) : (
              <div className="overflow-y-auto overscroll-contain px-5 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                      <LockKeyhole className="h-3.5 w-3.5" />
                      Prerequisito
                    </span>

                    <h2 className="mt-4 max-w-[18ch] text-2xl font-black leading-tight text-content-primary dark:text-white sm:text-4xl">
                      {title}
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-content-secondary dark:text-white/66 sm:text-base">
                      {description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-secondary text-content-tertiary shadow-sm transition-colors hover:bg-surface-tertiary hover:text-content-primary"
                    aria-label="Cerrar modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-8 space-y-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <KanaShowcaseCard
                      title="Hiragana"
                      subtitle="Nodo shogi"
                      description="Refuerza lectura base, practica trazos y termina el examen inicial para abrir el resto del contenido."
                      tileCharacter="あ"
                      shape="shoji"
                      action={{
                        label: "Ir a Hiragana",
                        onClick: onOpenHiragana ?? onClose,
                      }}
                    />

                    <KanaShowcaseCard
                      title="Katakana"
                      subtitle="Nodo mahjong"
                      description="Completa la ruta de sonidos extranjeros y su examen para terminar de liberar vocabulario, gramática y kanjis."
                      tileCharacter="ア"
                      shape="mahjong"
                      action={{
                        label: "Ir a Katakana",
                        onClick: onOpenKatakana ?? onClose,
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-3 rounded-[26px] border border-[#E8C4BD] bg-[#FFF4F2] px-5 py-4 dark:border-[#50302E] dark:bg-[#1D1716] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-content-primary dark:text-white">
                        También puedes liberarlo aprobando los exámenes iniciales
                      </p>

                      <p className="mt-1 text-sm leading-6 text-content-secondary dark:text-white/66">
                        En cada tablero podrás practicar o presentar el examen para acelerar el desbloqueo completo de kana.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-accent/25 focus:outline-none focus:ring-4 focus:ring-accent/20"
                    >
                      Seguir explorando
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
