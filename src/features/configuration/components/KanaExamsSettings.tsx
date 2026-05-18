"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { getCurrentUser } from "@/features/auth/services/api";
import type { User } from "@/features/auth/types";
import { KanaExamModal } from "@/features/kana/components/quiz";
import { getKanaProgress } from "@/features/kana/api/kanaApi";
import type {
  KanaExamResult,
  KanaType,
  UserKanaProgressDetailedResponse,
} from "@/features/kana/types";
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { useToast } from "@/shared/ui/ToastProvider";
import { SettingsSection } from "./SettingsSection";

const HIRAGANA_EXAM_UNLOCK_POINTS = 350;
const KATAKANA_EXAM_UNLOCK_POINTS = 705;

type KanaExamCardTone = "available" | "locked" | "done";

type KanaExamCardConfig = {
  kanaType: KanaType;
  title: string;
  symbol: string;
  description: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
};

const KANA_EXAM_CARD_CONFIG: Record<KanaType, KanaExamCardConfig> = {
  hiragana: {
    kanaType: "hiragana",
    title: "Examen de Hiragana",
    symbol: "あ",
    description: "Valida tu base fonética con la misma evaluación inicial del onboarding.",
    accent: "#7B3F8A",
    accentSoft: "rgba(123,63,138,0.1)",
    accentBorder: "rgba(123,63,138,0.18)",
  },
  katakana: {
    kanaType: "katakana",
    title: "Examen de Katakana",
    symbol: "ア",
    description: "Desbloquéalo al aprobar Hiragana o al completar todos tus hiragana.",
    accent: "#1B5078",
    accentSoft: "rgba(27,80,120,0.1)",
    accentBorder: "rgba(27,80,120,0.18)",
  },
};

function getAttemptCopy(kanaType: KanaType, result?: KanaExamResult) {
  const label = kanaType === "katakana" ? "Katakana" : "Hiragana";

  if (!result) {
    return null;
  }

  if (result.passed) {
    return `Aprobado con ${result.score}%.`;
  }

  return `Ultimo intento en ${label}: ${result.score}%.`;
}

function getProgressCopy(items: UserKanaProgressDetailedResponse[]) {
  if (items.length === 0) {
    return "Aun no hay progreso registrado.";
  }

  const completedCount = items.filter((item) => item.completed).length;
  return `${completedCount}/${items.length} completados`;
}

function getButtonLabel(available: boolean, result?: KanaExamResult) {
  if (!available) {
    return "Bloqueado";
  }

  if (!result) {
    return "Iniciar examen";
  }

  return result.passed ? "Repetir examen" : "Reintentar examen";
}

function KanaExamCard({
  config,
  progressLabel,
  helperText,
  detailText,
  tone,
  buttonLabel,
  disabled,
  busy,
  onStart,
}: {
  config: KanaExamCardConfig;
  progressLabel: string;
  helperText: string;
  detailText: string | null;
  tone: KanaExamCardTone;
  buttonLabel: string;
  disabled: boolean;
  busy: boolean;
  onStart: () => void;
}) {
  const toneClasses =
    tone === "done"
      ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
      : tone === "locked"
        ? "bg-slate-500/10 text-content-secondary ring-border-subtle"
        : "bg-accent/10 text-accent ring-accent/20";

  return (
    <div
      className="rounded-2xl border bg-surface-primary p-4 shadow-sm"
      style={{
        borderColor: config.accentBorder,
        background: `linear-gradient(180deg, ${config.accentSoft}, transparent 40%)`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-sm" style={{ backgroundColor: config.accent }}>
            {config.symbol}
          </div>
          <h4 className="mt-3 text-base font-semibold text-content-primary">
            {config.title}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-content-secondary">
            {config.description}
          </p>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ring-1 ${toneClasses}`}>
          {tone === "done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
          {tone === "locked" ? <LockKeyhole className="h-3.5 w-3.5" /> : null}
          {tone === "done" ? "Listo" : tone === "locked" ? "Bloqueado" : "Disponible"}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-3">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-content-muted">
          Progreso actual
        </p>
        <p className="mt-2 text-sm font-semibold text-content-primary">
          {progressLabel}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-content-secondary">
          {helperText}
        </p>
        {detailText ? (
          <p className="mt-2 text-xs font-medium text-content-muted">
            {detailText}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={disabled || busy}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: disabled ? "#94A3B8" : config.accent }}
      >
        {busy ? "Preparando..." : buttonLabel}
      </button>
    </div>
  );
}

export function KanaExamsSettings({ user }: { user: User | null }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [userKanaPoints, setUserKanaPoints] = useState(
    typeof user?.kanaPoints === "number" ? user.kanaPoints : 0,
  );
  const [progressItems, setProgressItems] = useState<
    UserKanaProgressDetailedResponse[]
  >([]);
  const [activeKanaExamType, setActiveKanaExamType] = useState<KanaType | null>(null);
  const [results, setResults] = useState<Partial<Record<KanaType, KanaExamResult>>>({});

  const readStatusSnapshot = useCallback(async () => {
    const [currentUser, currentProgress] = await Promise.all([
      getCurrentUser().catch(() => user),
      getKanaProgress().catch(() => []),
    ]);

    return {
      kanaPoints:
        typeof currentUser?.kanaPoints === "number" ? currentUser.kanaPoints : 0,
      progressItems: Array.isArray(currentProgress) ? currentProgress : [],
    };
  }, [user]);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    const snapshot = await readStatusSnapshot();
    setUserKanaPoints(snapshot.kanaPoints);
    setProgressItems(snapshot.progressItems);
    setLoading(false);
  }, [readStatusSnapshot]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialStatus = async () => {
      const snapshot = await readStatusSnapshot();

      if (cancelled) {
        return;
      }

      setUserKanaPoints(snapshot.kanaPoints);
      setProgressItems(snapshot.progressItems);
      setLoading(false);
    };

    void loadInitialStatus();

    return () => {
      cancelled = true;
    };
  }, [readStatusSnapshot]);

  const hiraganaItems = useMemo(
    () => progressItems.filter((item) => item.kanaType === "hiragana"),
    [progressItems],
  );
  const katakanaItems = useMemo(
    () => progressItems.filter((item) => item.kanaType === "katakana"),
    [progressItems],
  );

  const allHiraganaCompleted = useMemo(
    () => hiraganaItems.length > 0 && hiraganaItems.every((item) => item.completed),
    [hiraganaItems],
  );
  const allKatakanaCompleted = useMemo(
    () => katakanaItems.length > 0 && katakanaItems.every((item) => item.completed),
    [katakanaItems],
  );

  const hasUnlockedKatakanaExam =
    results.hiragana?.passed === true ||
    userKanaPoints >= HIRAGANA_EXAM_UNLOCK_POINTS ||
    allHiraganaCompleted;

  const handleOpenExam = useCallback(
    (kanaType: KanaType) => {
      if (kanaType === "katakana" && !hasUnlockedKatakanaExam) {
        toast.info(
          "Primero aprueba el examen de Hiragana o completa todos los hiragana.",
        );
        return;
      }

      setActiveKanaExamType(kanaType);
    },
    [hasUnlockedKatakanaExam, toast],
  );

  const handleCloseExam = useCallback(
    (result?: KanaExamResult) => {
      const completedKanaType = activeKanaExamType;
      setActiveKanaExamType(null);

      if (!completedKanaType || !result) {
        return;
      }

      setResults((current) => ({
        ...current,
        [completedKanaType]: result,
      }));

      if (result.passed) {
        const nextKanaPoints =
          completedKanaType === "katakana"
            ? Math.max(userKanaPoints, KATAKANA_EXAM_UNLOCK_POINTS)
            : Math.max(userKanaPoints, HIRAGANA_EXAM_UNLOCK_POINTS);

        setUserKanaPoints(nextKanaPoints);
        dispatchMasteryProgressSync({ kanaPoints: nextKanaPoints });

        toast.success(
          completedKanaType === "hiragana"
            ? "Aprobaste Hiragana. Katakana ya quedo disponible."
            : "Aprobaste Katakana.",
        );
      } else {
        toast.info(
          result.message ||
            `No aprobaste ${completedKanaType === "hiragana" ? "Hiragana" : "Katakana"}. Puedes volver a intentarlo.`,
        );
      }

      void refreshStatus();
    },
    [activeKanaExamType, refreshStatus, toast, userKanaPoints],
  );

  const hiraganaDetail = getAttemptCopy("hiragana", results.hiragana);
  const katakanaDetail = getAttemptCopy("katakana", results.katakana);

  return (
    <>
      <SettingsSection
        title="Examenes de Kana"
        description="Usa la misma evaluacion inicial del onboarding para validar Hiragana y Katakana desde configuracion."
      >
        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/60 px-4 py-3">
          <p className="text-sm font-semibold text-content-primary">
            Estado de tus evaluaciones
          </p>
          <p className="mt-1 text-xs text-content-secondary">
            Katakana se habilita al aprobar Hiragana o al completar todos los hiragana.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <KanaExamCard
            config={KANA_EXAM_CARD_CONFIG.hiragana}
            progressLabel={getProgressCopy(hiraganaItems)}
            helperText={
              allHiraganaCompleted
                ? "Ya completaste todos los hiragana. Puedes usar el examen para validar o repetir tu nivel."
                : "Puedes presentarlo cuando quieras para validar Hiragana."
            }
            detailText={hiraganaDetail}
            tone={results.hiragana?.passed || allHiraganaCompleted ? "done" : "available"}
            buttonLabel={getButtonLabel(true, results.hiragana)}
            disabled={false}
            busy={activeKanaExamType === "hiragana"}
            onStart={() => handleOpenExam("hiragana")}
          />

          <KanaExamCard
            config={KANA_EXAM_CARD_CONFIG.katakana}
            progressLabel={getProgressCopy(katakanaItems)}
            helperText={
              hasUnlockedKatakanaExam
                ? allKatakanaCompleted
                  ? "Ya completaste todos los katakana. Puedes repetir el examen si quieres validar de nuevo."
                  : "Katakana ya esta disponible para tu evaluacion."
                : "Debes aprobar Hiragana o completar todos los hiragana antes de abrirlo."
            }
            detailText={katakanaDetail}
            tone={
              results.katakana?.passed || allKatakanaCompleted
                ? "done"
                : hasUnlockedKatakanaExam
                  ? "available"
                  : "locked"
            }
            buttonLabel={getButtonLabel(hasUnlockedKatakanaExam, results.katakana)}
            disabled={!hasUnlockedKatakanaExam}
            busy={activeKanaExamType === "katakana"}
            onStart={() => handleOpenExam("katakana")}
          />
        </div>
      </SettingsSection>

      {activeKanaExamType ? (
        <KanaExamModal
          kanaType={activeKanaExamType}
          onClose={handleCloseExam}
        />
      ) : null}
    </>
  );
}