"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPinned,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type {
  AdminVocabularyFormPayload,
  AdminVocabularyItem,
  AdminVocabularyLevel,
  AdminVocabularyRegionId,
  AdminVocabularySubtheme,
  AdminVocabularyTheme,
  AdminVocabularyWord,
} from "../types/vocabulary";
import {
  getVocabularyLevelLabel,
  isVocabularyRegionId,
  vocabularyRegionOptions,
} from "../utils/vocabulary";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ModalMode = "create" | "edit";

interface AdminVocabularyRecordModalProps {
  open: boolean;
  mode: ModalMode;
  level: AdminVocabularyLevel;
  item: AdminVocabularyItem | null;
  selectedTheme: AdminVocabularyTheme | null;
  selectedSubtheme: AdminVocabularySubtheme | null;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: AdminVocabularyFormPayload) => Promise<void>;
  onDelete: () => Promise<void>;
}

function isTheme(item: AdminVocabularyItem | null): item is AdminVocabularyTheme {
  return Boolean(item && "released" in item);
}

function isSubtheme(item: AdminVocabularyItem | null): item is AdminVocabularySubtheme {
  return Boolean(item && "themeId" in item && "kana" in item && !("released" in item));
}

function getTitle(level: AdminVocabularyLevel, mode: ModalMode) {
  const action = mode === "create" ? "Crear" : "Editar";
  const noun = level === "themes" ? "tema" : level === "subthemes" ? "subtema" : "palabra";
  return `${action} ${noun}`;
}

function splitMeanings(value: string) {
  return value
    .split(/[\n,]+/)
    .map((meaning) => meaning.trim())
    .filter(Boolean);
}

export function AdminVocabularyRecordModal({
  open,
  mode,
  level,
  item,
  selectedTheme,
  selectedSubtheme,
  saving,
  deleting,
  error,
  onClose,
  onSave,
  onDelete,
}: AdminVocabularyRecordModalProps) {
  const [meaning, setMeaning] = useState("");
  const [kanji, setKanji] = useState("");
  const [kana, setKana] = useState("");
  const [region, setRegion] = useState<AdminVocabularyRegionId>("kanto");
  const [released, setReleased] = useState(false);
  const [hiragana, setHiragana] = useState("");
  const [icon, setIcon] = useState("");
  const [meaningsText, setMeaningsText] = useState("");
  const [prevSignature, setPrevSignature] = useState("");

  const signature = `${open}:${mode}:${level}:${item?.id ?? "new"}`;
  if (signature !== prevSignature) {
    setPrevSignature(signature);

    if (mode === "edit" && isTheme(item)) {
      setMeaning(item.meaning);
      setKanji(item.kanji);
      setKana(item.kana);
      setRegion(isVocabularyRegionId(item.region) ? item.region : "kanto");
      setReleased(item.released);
      setHiragana("");
      setIcon("");
      setMeaningsText("");
    } else if (mode === "edit" && isSubtheme(item)) {
      setMeaning(item.meaning);
      setKanji(item.kanji);
      setKana(item.kana);
      setRegion("kanto");
      setReleased(false);
      setHiragana("");
      setIcon("");
      setMeaningsText("");
    } else if (mode === "edit" && item) {
      const word = item as AdminVocabularyWord;
      setMeaning("");
      setKanji(word.kanji ?? "");
      setKana("");
      setRegion("kanto");
      setReleased(false);
      setHiragana(word.hiragana ?? "");
      setIcon(word.icon ?? "");
      setMeaningsText((word.meanings ?? []).join("\n"));
    } else {
      setMeaning("");
      setKanji("");
      setKana("");
      setRegion("kanto");
      setReleased(false);
      setHiragana("");
      setIcon("");
      setMeaningsText("");
    }
  }

  const contextLabel = useMemo(() => {
    if (level === "subthemes" && selectedTheme) {
      return `Tema padre: ${selectedTheme.meaning}`;
    }

    if (level === "words" && selectedSubtheme) {
      return `Subtema padre: ${selectedSubtheme.meaning}`;
    }

    return "Los temas se mostraran en el mapa segun su region.";
  }, [level, selectedSubtheme, selectedTheme]);

  const meanings = splitMeanings(meaningsText);
  const isValid =
    level === "themes"
      ? meaning.trim().length > 0 && kanji.trim().length > 0 && kana.trim().length > 0 && Boolean(region)
      : level === "subthemes"
        ? Boolean(selectedTheme) && meaning.trim().length > 0 && kanji.trim().length > 0 && kana.trim().length > 0
        : Boolean(selectedSubtheme) && kanji.trim().length > 0 && hiragana.trim().length > 0 && meanings.length > 0;

  const handleSave = async () => {
    if (level === "themes") {
      await onSave({
        meaning: meaning.trim(),
        kanji: kanji.trim(),
        kana: kana.trim(),
        region,
        released,
      });
      return;
    }

    if (level === "subthemes") {
      await onSave({
        themeId: selectedTheme?.id,
        meaning: meaning.trim(),
        kanji: kanji.trim(),
        kana: kana.trim(),
      });
      return;
    }

    await onSave({
      subthemeId: selectedSubtheme?.id,
      kanji: kanji.trim(),
      hiragana: hiragana.trim(),
      icon: icon.trim(),
      meanings,
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Esta accion eliminara el registro seleccionado. Deseas continuar?",
    );
    if (!confirmed) return;
    await onDelete();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-surface-primary shadow-2xl sm:rounded-[28px]"
            style={{ maxHeight: "min(94dvh, 760px)" }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-accent to-accent-hover px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-surface-primary/5" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-primary/15 backdrop-blur-sm">
                    {mode === "create" ? (
                      <Plus className="h-6 w-6 text-content-inverted" />
                    ) : (
                      <MapPinned className="h-6 w-6 text-content-inverted" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-content-inverted sm:text-2xl">
                      {getTitle(level, mode)}
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      {getVocabularyLevelLabel(level)} dentro del catalogo de vocabulario.
                    </p>
                    {mode === "edit" && item && (
                      <p className="mt-2 text-xs font-semibold text-white/80">
                        ID: {item.id}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-primary/10 text-white/70 transition-colors hover:bg-surface-primary/20 hover:text-content-inverted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
              <div className="mb-5 rounded-2xl border border-border-subtle bg-surface-secondary p-4 text-sm text-content-secondary">
                {contextLabel}
              </div>

              <div className="space-y-4">
                {level !== "words" ? (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                        Significado *
                      </label>
                      <input
                        type="text"
                        value={meaning}
                        onChange={(event) => setMeaning(event.target.value)}
                        className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          Kanji *
                        </label>
                        <input
                          type="text"
                          value={kanji}
                          onChange={(event) => setKanji(event.target.value)}
                          className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          Kana *
                        </label>
                        <input
                          type="text"
                          value={kana}
                          onChange={(event) => setKana(event.target.value)}
                          className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          Kanji *
                        </label>
                        <input
                          type="text"
                          value={kanji}
                          onChange={(event) => setKanji(event.target.value)}
                          className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          Hiragana *
                        </label>
                        <input
                          type="text"
                          value={hiragana}
                          onChange={(event) => setHiragana(event.target.value)}
                          className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                        Significados *
                      </label>
                      <textarea
                        value={meaningsText}
                        onChange={(event) => setMeaningsText(event.target.value)}
                        rows={4}
                        placeholder="Un significado por linea o separado por comas"
                        className="w-full resize-y rounded-xl border border-border-default bg-surface-primary px-4 py-3 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                        Icono o imagen
                      </label>
                      <input
                        type="text"
                        value={icon}
                        onChange={(event) => setIcon(event.target.value)}
                        placeholder="URL opcional"
                        className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                      />
                    </div>
                  </>
                )}

                {level === "themes" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                        Region del mapa *
                      </label>
                      <select
                        value={region}
                        onChange={(event) => setRegion(event.target.value as AdminVocabularyRegionId)}
                        className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                      >
                        {vocabularyRegionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm font-semibold text-content-secondary">
                      <input
                        type="checkbox"
                        checked={released}
                        onChange={(event) => setReleased(event.target.checked)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      Publicado
                    </label>
                  </div>
                )}

                {error && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {error}
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
                  <div>
                    {mode === "edit" && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving || deleting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-border-default px-4 py-2.5 text-sm font-semibold text-content-secondary transition-colors hover:bg-surface-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || deleting || !isValid}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Guardar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}