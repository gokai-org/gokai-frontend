"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  ListChecks,
  Shapes,
} from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useToast } from "@/shared/ui/ToastProvider";
import { useAdminGrammarLessons } from "../hooks/useAdminGrammarLessons";
import { getAdminGrammarLesson, updateAdminGrammarLesson } from "../services/api";
import type { AdminGrammarLesson } from "../types/grammar";
import { AdminLessonsFilters } from "./AdminLessonsFilters";
import { AdminLessonsHeader } from "./AdminLessonsHeader";
import { AdminLessonsModal } from "./AdminLessonsModal";
import { AdminLessonsTable } from "./AdminLessonsTable";

type ModalState = {
  open: boolean;
  item: AdminGrammarLesson | null;
};

const initialModalState: ModalState = {
  open: false,
  item: null,
};

export function AdminLessonsPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } = useAnimationPreferences();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(initialModalState);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const {
    filteredLessons,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    query,
    setQuery,
    summary,
    reload,
  } = useAdminGrammarLessons();

  const sectionSummary = useMemo(
    () => [
      {
        label: "Lecciones",
        value: String(summary.totalLessons),
        icon: BookOpen,
      },
      {
        label: "Bloques tabla",
        value: String(summary.tableSections),
        icon: Shapes,
      },
      {
        label: "Ejercicios",
        value: String(summary.examItems),
        icon: ListChecks,
      },
      {
        label: "Con descripción",
        value: String(summary.withDescription),
        icon: FileText,
      },
    ],
    [summary],
  );

  const handleOpenEdit = useCallback(
    async (lessonId: string) => {
      setPendingEditId(lessonId);
      setModalError(null);

      try {
        const detail = await getAdminGrammarLesson(lessonId);
        setModal({ open: true, item: detail });
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar la lección";
        setModalError(message);
        toast.error(message);
      } finally {
        setPendingEditId(null);
      }
    },
    [toast],
  );

  const handleCloseModal = useCallback(() => {
    if (isSaving) return;
    setModal(initialModalState);
    setModalError(null);
  }, [isSaving]);

  const handleSave = useCallback(
    async (payload: AdminGrammarLesson) => {
      setIsSaving(true);
      setModalError(null);

      try {
        await updateAdminGrammarLesson(payload.id, payload);
        await reload();
        setModal({ open: true, item: payload });
        toast.success("Lección de gramática actualizada correctamente.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo guardar la lección";
        setModalError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [reload, toast],
  );

  return (
    <AdminDashboardShell
      header={<AdminLessonsHeader totalLessons={summary.totalLessons} />}
      containerClassName="max-w-[1700px] px-2 sm:px-3 lg:px-4 xl:px-5"
    >
      <div className="space-y-5 pb-8">
        <AnimatedEntrance disabled={!animationsEnabled} index={0}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {sectionSummary.map(({ label, value, icon: Icon }, index) => (
              <AdminMetricCard
                key={label}
                title={label}
                value={value}
                icon={<Icon className="h-5 w-5" />}
                animationsEnabled={animationsEnabled}
                index={index}
              />
            ))}
          </div>
        </AnimatedEntrance>

        <AnimatedEntrance
          disabled={!animationsEnabled}
          index={heavyAnimationsEnabled ? 1 : 0}
        >
          <AdminLessonsFilters
            query={query}
            onQueryChange={setQuery}
            onRefresh={() => void reload()}
            isRefreshing={isRefreshing}
            totalResults={filteredLessons.length}
            lastUpdatedAt={lastUpdatedAt}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          disabled={!animationsEnabled}
          index={heavyAnimationsEnabled ? 2 : 1}
        >
          <AdminLessonsTable
            items={filteredLessons}
            loading={loading}
            error={error}
            pendingEditId={pendingEditId}
            onEditItem={handleOpenEdit}
          />
        </AnimatedEntrance>
      </div>

      <AdminLessonsModal
        open={modal.open}
        lesson={modal.item}
        saving={isSaving}
        error={modalError}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </AdminDashboardShell>
  );
}
