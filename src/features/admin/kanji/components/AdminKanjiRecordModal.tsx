"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Languages,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { KanjiStrokePlayer } from "@/features/kanji/components/KanjiStrokePlayer";
import type { AdminKanjiPayload, AdminKanjiRecord } from "../types/kanji";
import { parseKanjiStrokeSvg, splitKanjiLines } from "../utils/kanji";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ModalMode = "create" | "edit";

interface AdminKanjiRecordModalProps {
  open: boolean;
  mode: ModalMode;
  item: AdminKanjiRecord | null;
  currentOrderPosition?: number | null;
  totalOrderPositions: number;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: AdminKanjiPayload) => Promise<void>;
  onDelete: () => Promise<void>;
}

function getTitle(mode: ModalMode) {
  return mode === "create" ? "Crear kanji" : "Editar kanji";
}

export function AdminKanjiRecordModal({
  open,
  mode,
  item,
  currentOrderPosition,
  totalOrderPositions,
  saving,
  deleting,
  error,
  onClose,
  onSave,
  onDelete,
}: AdminKanjiRecordModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [symbol, setSymbol] = useState("");
  const [readingsText, setReadingsText] = useState("");
  const [meaningsText, setMeaningsText] = useState("");
  const [pointsToUnlock, setPointsToUnlock] = useState("30");
  const [learnOrderText, setLearnOrderText] = useState("");
  const [viewBox, setViewBox] = useState("");
  const [strokes, setStrokes] = useState<string[]>([]);
  const [svgFileName, setSvgFileName] = useState("");
  const [svgError, setSvgError] = useState<string | null>(null);

  const signature = `${open}:${mode}:${item?.id ?? "new"}`;

  useEffect(() => {
    if (!open) {
      return;
    }

    setSymbol(item?.symbol ?? "");
    setReadingsText((item?.readings ?? []).join("\n"));
    setMeaningsText((item?.meanings ?? []).join("\n"));
    setPointsToUnlock(String(item?.pointsToUnlock ?? 30));
    setLearnOrderText(
      mode === "edit" && typeof currentOrderPosition === "number"
        ? String(currentOrderPosition)
        : "",
    );
    setViewBox(item?.viewBox ?? "");
    setStrokes(item?.strokes ?? []);
    setSvgFileName("");
    setSvgError(null);
  }, [currentOrderPosition, item, mode, open, signature]);

  const readings = useMemo(() => splitKanjiLines(readingsText), [readingsText]);
  const meanings = useMemo(() => splitKanjiLines(meaningsText), [meaningsText]);
  const parsedPoints = Number.parseInt(pointsToUnlock.trim(), 10);
  const trimmedLearnOrder = learnOrderText.trim();
  const parsedOrderPosition =
    trimmedLearnOrder.length > 0
      ? Number.parseInt(trimmedLearnOrder, 10)
      : null;
  const resolvedLearnOrder =
    mode === "edit" &&
    parsedOrderPosition !== null &&
    Number.isFinite(parsedOrderPosition)
      ? parsedOrderPosition - 1
      : undefined;
  const hasStrokeData = viewBox.trim().length > 0 && strokes.length > 0;
  const hasValidOrderPosition =
    mode !== "edit" ||
    parsedOrderPosition === null ||
    (Number.isFinite(parsedOrderPosition) &&
      parsedOrderPosition >= 1 &&
      parsedOrderPosition <= totalOrderPositions);
  const isValid =
    symbol.trim().length === 1 &&
    readings.length > 0 &&
    meanings.length > 0 &&
    Number.isFinite(parsedPoints) &&
    parsedPoints > 0 &&
    hasValidOrderPosition &&
    hasStrokeData;

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleSvgFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setSvgError(null);
    setSvgFileName(file.name);

    try {
      const svgMarkup = await file.text();
      const parsedSvg = parseKanjiStrokeSvg(svgMarkup);
      setViewBox(parsedSvg.viewBox);
      setStrokes(parsedSvg.strokes);
      setSvgError(null);
    } catch (err) {
      setViewBox("");
      setStrokes([]);
      setSvgError(err instanceof Error ? err.message : "No se pudo leer el SVG.");
    } finally {
      event.currentTarget.value = "";
    }
  };

  const handleSave = async () => {
    await onSave({
      symbol: symbol.trim(),
      readings,
      meanings,
      pointsToUnlock: parsedPoints,
      learnOrder: resolvedLearnOrder,
      viewBox: viewBox.trim(),
      strokes,
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Esta accion eliminara el kanji seleccionado. Deseas continuar?",
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
            className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-surface-primary shadow-2xl sm:rounded-[28px]"
            style={{ maxHeight: "min(94dvh, 820px)" }}
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
                    <Languages className="h-6 w-6 text-content-inverted" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-content-inverted sm:text-2xl">
                      {getTitle(mode)}
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      Configura simbolo, lecturas, significados, puntos y trazos.
                    </p>
                    {mode === "edit" && item && (
                      <p className="mt-2 text-xs font-semibold text-white/80">ID: {item.id}</p>
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
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border-subtle bg-surface-secondary p-4 text-sm text-content-secondary">
                    Sube un SVG desde el dispositivo para reemplazar los trazos. El parser extrae viewBox y todos los path del archivo.
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                        Simbolo *
                      </label>
                      <input
                        type="text"
                        value={symbol}
                        onChange={(event) => setSymbol(event.target.value)}
                        maxLength={1}
                        className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-2xl text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                        Puntos para desbloquear *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={pointsToUnlock}
                        onChange={(event) => setPointsToUnlock(event.target.value)}
                        className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                      />
                    </div>
                  </div>

                  {mode === "edit" ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                        Posicion en la lista
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={totalOrderPositions}
                        value={learnOrderText}
                        onChange={(event) => setLearnOrderText(event.target.value)}
                        className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                      />
                      <p className="mt-1.5 text-xs text-content-tertiary">
                        Posicion actual: {currentOrderPosition ?? "-"} de {totalOrderPositions}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-content-secondary">
                      El nuevo kanji se agregara al final en la posicion {totalOrderPositions}.
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                      Lecturas *
                    </label>
                    <textarea
                      value={readingsText}
                      onChange={(event) => setReadingsText(event.target.value)}
                      rows={4}
                      placeholder="Una lectura por linea o separadas por comas"
                      className="w-full resize-y rounded-xl border border-border-default bg-surface-primary px-4 py-3 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                    />
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

                  <div className="rounded-2xl border border-border-default bg-surface-primary p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-content-primary">Trazos SVG</p>
                        <p className="text-xs text-content-tertiary">
                          {svgFileName || "Sube un SVG con paths directos para el orden de escritura."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".svg,image/svg+xml"
                          onChange={handleSvgFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={handleUploadClick}
                          className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-surface-secondary px-4 py-2.5 text-sm font-semibold text-content-secondary transition-colors hover:border-accent/30 hover:text-accent"
                        >
                          <Upload className="h-4 w-4" />
                          {hasStrokeData ? "Reemplazar SVG" : "Subir SVG"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-border-subtle bg-surface-secondary px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          ViewBox
                        </p>
                        <p className="mt-1 text-sm text-content-primary">{viewBox || "Sin cargar"}</p>
                      </div>
                      <div className="rounded-xl border border-border-subtle bg-surface-secondary px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          Numero de trazos
                        </p>
                        <p className="mt-1 text-sm text-content-primary">{strokes.length}</p>
                      </div>
                    </div>
                  </div>

                  {(svgError || error) && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" /> {svgError ?? error}
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
                        disabled={!isValid || saving || deleting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : mode === "create" ? (
                          "Crear kanji"
                        ) : (
                          "Guardar cambios"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-content-primary">Vista previa de trazos</h3>
                    <p className="mt-1 text-xs text-content-tertiary">
                      Se renderizan exactamente los strokes que se enviaran al backend.
                    </p>
                    <div className="mt-4 flex min-h-[340px] items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface-secondary p-4">
                      {hasStrokeData ? (
                        <KanjiStrokePlayer
                          viewBox={viewBox}
                          strokes={strokes}
                          showNumbers
                          numberMode="all"
                          size={320}
                        />
                      ) : (
                        <p className="max-w-[240px] text-center text-sm text-content-tertiary">
                          Sube un SVG para generar la vista previa del orden de trazos.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-content-primary">Resumen</h3>
                    <div className="mt-3 space-y-3 text-sm text-content-secondary">
                      <div className="flex items-center justify-between gap-3">
                        <span>Lecturas</span>
                        <span className="font-semibold text-content-primary">{readings.length}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Significados</span>
                        <span className="font-semibold text-content-primary">{meanings.length}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Trazos</span>
                        <span className="font-semibold text-content-primary">{strokes.length}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Posicion destino</span>
                        <span className="font-semibold text-content-primary">
                          {mode === "edit"
                            ? `${parsedOrderPosition ?? currentOrderPosition ?? "-"} de ${totalOrderPositions}`
                            : `Final (${totalOrderPositions})`}
                        </span>
                      </div>
                    </div>
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