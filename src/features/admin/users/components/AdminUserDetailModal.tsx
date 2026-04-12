"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Crown,
  Loader2,
  Mail,
  Star,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import type { AdminUser, UpdateUserRequest } from "../types/users";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface AdminUserDetailModalProps {
  open: boolean;
  user: AdminUser | null;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: UpdateUserRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function AdminUserDetailModal({
  open,
  user,
  saving,
  deleting,
  error,
  onClose,
  onSave,
  onDelete,
}: AdminUserDetailModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }

  const hasChanges =
    user != null &&
    (firstName !== user.firstName || lastName !== user.lastName);

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <AnimatePresence>
      {open && user && (
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
            style={{ maxHeight: "min(94dvh, 840px)" }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-accent to-accent-hover px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-surface-primary/5" />
              <div className="absolute bottom-[-16px] left-[28%] h-20 w-20 rounded-full bg-surface-primary/5" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-primary/15 backdrop-blur-sm sm:h-14 sm:w-14">
                    <User className="h-6 w-6 text-content-inverted" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-content-inverted sm:text-2xl">
                      Detalle del usuario
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      Edita el nombre del usuario o eliminalo.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-white/80">
                      ID: {user.id}
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
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
                {/* Left column - Form */}
                <section className="space-y-5">
                  <div className="rounded-2xl border border-border-subtle bg-surface-secondary p-4 sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-content-primary">
                      Informacion del usuario
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm font-semibold text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          Apellido
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm font-semibold text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                          Correo electronico
                        </label>
                        <div className="w-full rounded-xl border border-border-default bg-surface-tertiary px-4 py-2.5 text-sm text-content-secondary">
                          {user.email}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                            Perfil
                          </label>
                          <div className="w-full rounded-xl border border-border-default bg-surface-tertiary px-4 py-2.5 text-sm text-content-secondary">
                            {user.profile}
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                            Fecha de nacimiento
                          </label>
                          <div className="w-full rounded-xl border border-border-default bg-surface-tertiary px-4 py-2.5 text-sm text-content-secondary">
                            {user.birthdate || "No registrada"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                            Puntos
                          </label>
                          <div className="w-full rounded-xl border border-border-default bg-surface-tertiary px-4 py-2.5 text-sm text-content-secondary">
                            {user.points}
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-content-tertiary">
                            Puntos kana
                          </label>
                          <div className="w-full rounded-xl border border-border-default bg-surface-tertiary px-4 py-2.5 text-sm text-content-secondary">
                            {user.kanaPoints}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Right column - Actions & Summary */}
                <section className="space-y-5">
                  <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-content-primary">
                      Acciones
                    </h3>

                    <div className="space-y-4">
                      {error && (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" /> {error}
                        </p>
                      )}

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onSave({
                              firstName: firstName.trim(),
                              lastName: lastName.trim(),
                            })
                          }
                          disabled={
                            saving || deleting || !hasChanges || !isValid
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Guardar cambios
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full rounded-xl border border-border-default px-4 py-2.5 text-sm font-semibold text-content-secondary transition-colors hover:bg-surface-secondary"
                        >
                          Cerrar
                        </button>
                        <button
                          type="button"
                          onClick={onDelete}
                          disabled={saving || deleting}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-2.5 text-xs font-semibold text-red-700 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Eliminando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar usuario
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border-subtle bg-surface-secondary p-4 sm:p-5">
                    <h4 className="text-sm font-bold text-content-primary">
                      Resumen rapido
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm text-content-secondary">
                      <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-accent" /> {user.email}
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-accent" /> {user.points}{" "}
                        puntos
                      </li>
                      <li className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-accent" />{" "}
                        {user.subscribed ? "Suscrito" : "Sin suscripcion"}
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />{" "}
                        {user.isGoogleUser ? "Google" : "Registro directo"}
                      </li>
                      <li className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent" /> Registro:{" "}
                        {user.createdAt}
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
