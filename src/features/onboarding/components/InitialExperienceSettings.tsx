"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Languages,
  Loader2,
  Moon,
  Sparkles,
  Sun,
  Type,
} from "lucide-react";
import {
  getUserSettings,
  updateSettingsSection,
} from "@/features/configuration/services/api";
import type { UserSettings } from "@/features/configuration/types";
import { DEFAULT_SETTINGS } from "@/features/configuration/types";
import { useTheme } from "@/shared/hooks/useTheme";
import { useTypography } from "@/shared/hooks/useTypography";
import type { FontSize, JapaneseFont } from "@/shared/hooks/useTypography";

type InitialExperienceSettingsProps = {
  onBack: () => void;
  onComplete: () => void;
};

type SettingStep = "appearance" | "japaneseFont" | "fontSize";
type AppearanceMode = "Claro" | "Oscuro";

const SETTING_STEPS: SettingStep[] = ["appearance", "japaneseFont", "fontSize"];
const FONT_SIZE_OPTIONS: FontSize[] = ["Pequeño", "Mediano", "Grande", "Muy grande"];
const JAPANESE_FONT_OPTIONS: JapaneseFont[] = [
  "Noto Sans JP",
  "Hiragino",
  "Yu Gothic",
  "Meiryo",
];

function mergeWithDefaults(remote: UserSettings | null): UserSettings {
  if (!remote) return DEFAULT_SETTINGS;

  return {
    general: { ...DEFAULT_SETTINGS.general, ...remote.general },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...remote.notifications },
    appearance: { ...DEFAULT_SETTINGS.appearance, ...remote.appearance },
    learning: { ...DEFAULT_SETTINGS.learning, ...remote.learning },
    accessibility: { ...DEFAULT_SETTINGS.accessibility, ...remote.accessibility },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...remote.privacy },
  };
}

function ChoiceCard({
  selected,
  title,
  description,
  icon: Icon,
  children,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.018 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative min-h-[148px] overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 ${
        selected
          ? "border-accent bg-accent text-content-inverted shadow-[0_22px_56px_rgba(153,51,49,0.24)]"
          : "border-border-default bg-surface-primary/88 text-content-primary shadow-[0_16px_42px_rgba(0,0,0,0.06)] hover:border-accent/35 hover:shadow-[0_22px_56px_rgba(153,51,49,0.10)]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/14 via-transparent to-transparent opacity-80" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              selected ? "bg-white/16" : "bg-accent-subtle"
            }`}
          >
            {Icon ? (
              <Icon
                className={`h-5 w-5 ${
                  selected ? "text-content-inverted" : "text-accent"
                }`}
              />
            ) : (
              <Sparkles
                className={`h-5 w-5 ${
                  selected ? "text-content-inverted" : "text-accent"
                }`}
              />
            )}
          </div>
          <motion.span
            initial={false}
            animate={{ scale: selected ? 1 : 0.8, opacity: selected ? 1 : 0 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/18"
          >
            <Check className="h-4 w-4" />
          </motion.span>
        </div>

        <div>
          <h3 className="text-lg font-extrabold leading-tight">{title}</h3>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              selected ? "text-white/78" : "text-content-tertiary"
            }`}
          >
            {description}
          </p>
          {children}
        </div>
      </div>
    </motion.button>
  );
}

function LivePreview({
  settings,
  compact = false,
}: {
  settings: UserSettings;
  compact?: boolean;
}) {
  return (
    <motion.div
      layout
      className={`rounded-2xl border border-border-default bg-surface-primary/88 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.07)] backdrop-blur-md ${
        compact ? "mt-4" : "mt-6"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Vista previa
          </p>
          <p className="mt-1 text-sm text-content-secondary">
            Cambios aplicados en tiempo real
          </p>
        </div>
        <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-bold text-accent">
          {settings.appearance.darkMode ? "Oscuro" : "Claro"}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-secondary p-5">
        <p className="jp-text text-4xl font-black leading-none text-content-primary">
          日本語
        </p>
        <p className="mt-3 text-base font-semibold text-content-primary">
          Aprende japonés a tu ritmo
        </p>
        <p className="mt-2 text-sm leading-relaxed text-content-secondary">
          Este texto refleja el tamaño seleccionado y la fuente japonesa que verás dentro de GOKAI.
        </p>
      </div>
    </motion.div>
  );
}

export function InitialExperienceSettings({
  onBack,
  onComplete,
}: InitialExperienceSettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [settingIndex, setSettingIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTheme } = useTheme();
  const { setFontSize, setJapaneseFont } = useTypography();

  const currentStep = SETTING_STEPS[settingIndex];
  const isLastStep = settingIndex === SETTING_STEPS.length - 1;
  const appearanceMode: AppearanceMode = settings.appearance.darkMode
    ? "Oscuro"
    : "Claro";

  useEffect(() => {
    let mounted = true;

    getUserSettings()
      .then((remote) => {
        if (!mounted) return;
        const merged = mergeWithDefaults(remote);
        setSettings(merged);
        setTheme(merged.appearance.darkMode ? "dark" : "light");
        setFontSize(merged.appearance.fontSize as FontSize);
        setJapaneseFont(merged.appearance.japaneseFont as JapaneseFont);
      })
      .catch(() => {
        if (mounted) {
          setError(
            "No pudimos cargar tu configuración actual. Puedes continuar con los valores recomendados.",
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [setFontSize, setJapaneseFont, setTheme]);

  const updateAppearance = (data: Partial<UserSettings["appearance"]>) => {
    setSettings((current) => ({
      ...current,
      appearance: { ...current.appearance, ...data },
    }));
  };

  const handleThemeChange = (mode: AppearanceMode) => {
    const darkMode = mode === "Oscuro";
    updateAppearance({ darkMode });
    setTheme(darkMode ? "dark" : "light");
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    updateAppearance({ fontSize });
    setFontSize(fontSize);
  };

  const handleJapaneseFontChange = (japaneseFont: JapaneseFont) => {
    updateAppearance({ japaneseFont });
    setJapaneseFont(japaneseFont);
  };

  const handlePrimaryAction = async () => {
    if (!isLastStep) {
      setSettingIndex((current) =>
        Math.min(current + 1, SETTING_STEPS.length - 1),
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateSettingsSection("appearance", {
        darkMode: settings.appearance.darkMode,
        fontSize: settings.appearance.fontSize,
        japaneseFont: settings.appearance.japaneseFont,
      });
      onComplete();
    } catch (saveError) {
      console.error("Error guardando configuración inicial:", saveError);
      setError("No se pudieron guardar tus preferencias. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSecondaryAction = () => {
    if (settingIndex === 0) {
      onBack();
      return;
    }

    setSettingIndex((current) => Math.max(current - 1, 0));
  };

  const stepContent = (() => {
    if (currentStep === "appearance") {
      return {
        eyebrow: "Configuración inicial",
        title: "Modo de apariencia",
        description: "Elige si quieres empezar con una interfaz clara u oscura.",
        body: (
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceCard
              selected={appearanceMode === "Claro"}
              title="Claro"
              description="Una vista luminosa para estudiar de día o con buena iluminación."
              icon={Sun}
              onClick={() => handleThemeChange("Claro")}
            />
            <ChoiceCard
              selected={appearanceMode === "Oscuro"}
              title="Oscuro"
              description="Un entorno más suave para sesiones largas o nocturnas."
              icon={Moon}
              onClick={() => handleThemeChange("Oscuro")}
            />
          </div>
        ),
      };
    }

    if (currentStep === "japaneseFont") {
      return {
        eyebrow: "Lectura japonesa",
        title: "Tipo de fuente japonesa",
        description:
          "Escoge cómo quieres ver kana, kanji y ejemplos dentro de GOKAI.",
        body: (
          <div className="grid gap-3 sm:grid-cols-2">
            {JAPANESE_FONT_OPTIONS.map((font) => (
              <ChoiceCard
                key={font}
                selected={settings.appearance.japaneseFont === font}
                title={font}
                description="Vista optimizada para caracteres japoneses."
                icon={Languages}
                onClick={() => handleJapaneseFontChange(font)}
              >
                <p className="jp-text mt-4 text-2xl font-bold">日本語</p>
              </ChoiceCard>
            ))}
          </div>
        ),
      };
    }

    return {
      eyebrow: "Legibilidad",
      title: "Tamaño de texto",
      description:
        "Ajusta el tamaño para que explicaciones, botones y ejemplos se lean cómodamente.",
      body: (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FONT_SIZE_OPTIONS.map((fontSize) => (
            <ChoiceCard
              key={fontSize}
              selected={settings.appearance.fontSize === fontSize}
              title={fontSize}
              description="Cambia la escala visual de la plataforma."
              icon={Type}
              onClick={() => handleFontSizeChange(fontSize)}
            />
          ))}
        </div>
      ),
    };
  })();

  return (
    <motion.section
      key="initial-settings"
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -48 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-[calc(100dvh-96px)] w-full max-w-6xl flex-1 items-center justify-center px-4 pb-8 sm:px-6 lg:px-8"
    >
      <div className="w-full">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto mb-5 max-w-3xl rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 42, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -42, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-5xl"
          >
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-surface-primary/80 px-4 py-2 text-xs font-bold text-accent shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                {stepContent.eyebrow} · {settingIndex + 1} de {SETTING_STEPS.length}
              </span>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-content-primary sm:text-4xl md:text-5xl">
                {stepContent.title}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-content-secondary sm:text-base">
                {stepContent.description}
              </p>
            </div>

            <div className="mt-8">{stepContent.body}</div>
            <LivePreview settings={settings} compact={currentStep !== "appearance"} />
          </motion.div>
        </AnimatePresence>

        <div className="mx-auto mt-7 flex max-w-5xl flex-col-reverse items-center justify-between gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleSecondaryAction}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-primary/70 hover:text-content-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            {settingIndex === 0 ? "Volver a intereses" : "Anterior"}
          </button>

          <div className="flex items-center gap-2">
            {SETTING_STEPS.map((settingStep, index) => (
              <span
                key={settingStep}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === settingIndex ? "w-8 bg-accent" : "w-2.5 bg-content-muted/30"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={saving || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent via-[#A83F3A] to-accent-hover px-6 py-3.5 text-sm font-bold text-content-inverted shadow-[0_18px_40px_rgba(153,51,49,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(153,51,49,0.26)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Guardando..." : isLastStep ? "Guardar y continuar" : "Continuar"}
            {!saving && !isLastStep ? <ChevronRight className="h-4 w-4" /> : null}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
