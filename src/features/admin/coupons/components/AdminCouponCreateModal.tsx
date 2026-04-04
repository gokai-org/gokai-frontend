"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import type { CreateCouponRequest } from "../types/coupons";
import { DatePicker } from "@/shared/ui/DatePicker";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface AdminCouponCreateModalProps {
  open: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: (payload: CreateCouponRequest) => Promise<void>;
}

export function AdminCouponCreateModal({
  open,
  saving,
  error,
  onClose,
  onCreate,
}: AdminCouponCreateModalProps) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [months, setMonths] = useState(1);
  const [claimLimit, setClaimLimit] = useState(1);
  const [vigency, setVigency] = useState("");

  const isValid =
    code.trim().length > 0 &&
    months >= 1 &&
    claimLimit >= 1 &&
    vigency.length > 0;

  const handleCreate = async () => {
    await onCreate({
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      months,
      claimLimit,
      vigency,
    });

    setCode("");
    setDescription("");
    setMonths(1);
    setClaimLimit(1);
    setVigency("");
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
            className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-surface-primary shadow-2xl sm:rounded-[28px]"
            style={{ maxHeight: "min(94dvh, 700px)" }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-accent to-accent-hover px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-surface-primary/5" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-primary/15 backdrop-blur-sm">
                    <Plus className="h-6 w-6 text-content-inverted" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-content-inverted sm:text-2xl">
                      Crear nuevo cupon
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      Completa los datos para crear un cupon de suscripcion.
                    </p>
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                    Codigo *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={20}
                    placeholder="Ej: GOKAI2026"
                    className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm font-semibold tracking-wider text-content-primary uppercase outline-none transition-colors hover:border-border-default focus:border-accent/40 placeholder:font-normal placeholder:normal-case placeholder:tracking-normal"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                    Descripcion
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Descripcion opcional del cupon"
                    className="w-full resize-y rounded-xl border border-border-default bg-surface-primary px-4 py-3 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                      Meses de suscripcion *
                    </label>
                    <input
                      type="number"
                      value={months}
                      onChange={(e) =>
                        setMonths(Math.max(1, Number(e.target.value)))
                      }
                      min={1}
                      className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                      Limite de canjes *
                    </label>
                    <input
                      type="number"
                      value={claimLimit}
                      onChange={(e) =>
                        setClaimLimit(Math.max(1, Number(e.target.value)))
                      }
                      min={1}
                      className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                    Vigencia *
                  </label>
                  <DatePicker value={vigency} onChange={setVigency} />
                </div>

                {error && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {error}
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-border-default px-4 py-2.5 text-sm font-semibold text-content-secondary transition-colors hover:bg-surface-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={saving || !isValid}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Crear cupon
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
