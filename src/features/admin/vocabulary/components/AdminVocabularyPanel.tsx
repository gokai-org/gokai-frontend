"use client";

import { useCallback, useMemo, useState } from "react";
import { BookMarked, CheckCircle2, Layers3, MapPinned } from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useToast } from "@/shared/ui/ToastProvider";
import { useAdminVocabulary } from "../hooks/useAdminVocabulary";
import {
  createAdminVocabularySubtheme,
  createAdminVocabularyTheme,
  createAdminVocabularyWord,
  deleteAdminVocabularySubtheme,
  deleteAdminVocabularyTheme,
  deleteAdminVocabularyWord,
  updateAdminVocabularySubtheme,
  updateAdminVocabularyTheme,
  updateAdminVocabularyWord,
} from "../services/api";
import type {
  AdminVocabularyFormPayload,
  AdminVocabularyItem,
  AdminVocabularyLevel,
} from "../types/vocabulary";
import { AdminVocabularyFilters } from "./AdminVocabularyFilters";
import { AdminVocabularyHeader } from "./AdminVocabularyHeader";
import { AdminVocabularyRecordModal } from "./AdminVocabularyRecordModal";
import { AdminVocabularyTable } from "./AdminVocabularyTable";

type ModalState = {
  open: boolean;
  mode: "create" | "edit";
  level: AdminVocabularyLevel;
  item: AdminVocabularyItem | null;
};

const initialModalState: ModalState = {
  open: false,
  mode: "create",
  level: "themes",
  item: null,
};

export function AdminVocabularyPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } = useAnimationPreferences();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(initialModalState);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const {
    level,
    query,
    setQuery,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    themes,
    selectedTheme,
    selectedSubtheme,
    filteredItems,
    activeItems,
    summary,
    reload,
    loadSubthemes,
    loadWords,
    goToThemes,
    goToSubthemes,
  } = useAdminVocabulary();

  const mappedPercent = useMemo(
    () =>
      summary.themes > 0
        ? Math.round((summary.mappedThemes / summary.themes) * 100)
        : 0,
    [summary.mappedThemes, summary.themes],
  );

  const openCreateModal = useCallback(() => {
    setModalError(null);
    setModal({ open: true, mode: "create", level, item: null });
  }, [level]);

  const openEditModal = useCallback(
    (item: AdminVocabularyItem) => {
      setModalError(null);
      setModal({ open: true, mode: "edit", level, item });
    },
    [level],
  );

  const closeModal = useCallback(() => {
    if (isSaving || isDeleting) return;
    setModal(initialModalState);
    setModalError(null);
  }, [isDeleting, isSaving]);

  const handleOpenItem = useCallback(
    (item: AdminVocabularyItem) => {
      if (level === "themes" && "released" in item) {
        void loadSubthemes(item);
        return;
      }

      if (level === "subthemes" && "themeId" in item && "kana" in item) {
        void loadWords(item);
      }
    },
    [level, loadSubthemes, loadWords],
  );

  const handleSave = useCallback(
    async (payload: AdminVocabularyFormPayload) => {
      setIsSaving(true);
      setModalError(null);

      try {
        if (modal.level === "themes") {
          if (modal.mode === "edit" && modal.item) {
            await updateAdminVocabularyTheme(modal.item.id, payload);
          } else {
            await createAdminVocabularyTheme(payload);
          }
        } else if (modal.level === "subthemes") {
          if (modal.mode === "edit" && modal.item) {
            await updateAdminVocabularySubtheme(modal.item.id, payload);
          } else {
            await createAdminVocabularySubtheme(payload);
          }
        } else if (modal.mode === "edit" && modal.item) {
          await updateAdminVocabularyWord(modal.item.id, payload);
        } else {
          await createAdminVocabularyWord(payload);
        }

        await reload();
        toast.success(
          modal.mode === "create"
            ? "Registro creado correctamente."
            : "Registro actualizado correctamente.",
        );
        setModal(initialModalState);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo guardar el registro";
        setModalError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [modal, reload, toast],
  );

  const handleDelete = useCallback(async () => {
    if (!modal.item) return;

    setIsDeleting(true);
    setModalError(null);

    try {
      if (modal.level === "themes") {
        await deleteAdminVocabularyTheme(modal.item.id);
      } else if (modal.level === "subthemes") {
        await deleteAdminVocabularySubtheme(modal.item.id);
      } else {
        await deleteAdminVocabularyWord(modal.item.id);
      }

      await reload();
      toast.success("Registro eliminado correctamente.");
      setModal(initialModalState);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el registro";
      setModalError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [modal.item, modal.level, reload, toast]);

  return (
    <AdminDashboardShell
      header={<AdminVocabularyHeader totalThemes={themes.length} />}
      containerClassName="max-w-[1700px] px-2 sm:px-3 lg:px-4 xl:px-5"
    >
      <div className="space-y-6 pb-8">
        <AnimatedEntrance
          index={0}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <AdminMetricCard
              title="Temas"
              value={String(summary.themes)}
              hint="Intereses disponibles"
              icon={<BookMarked className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={0}
            />
            <AdminMetricCard
              title="Publicados"
              value={String(summary.releasedThemes)}
              hint="Visibles para usuarios"
              icon={<CheckCircle2 className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={1}
            />
            <AdminMetricCard
              title="Con region"
              value={String(summary.mappedThemes)}
              hint={`${mappedPercent}% con region del mapa`}
              icon={<MapPinned className="h-5 w-5" />}
              trend={mappedPercent}
              animationsEnabled={animationsEnabled}
              index={2}
            />
            <AdminMetricCard
              title="Nivel actual"
              value={String(activeItems.length)}
              hint={level === "themes" ? "Temas" : level === "subthemes" ? "Subtemas" : "Palabras"}
              icon={<Layers3 className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={3}
            />
          </section>
        </AnimatedEntrance>

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            No se pudo cargar el vocabulario. {error}
          </div>
        )}

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminVocabularyFilters
            level={level}
            query={query}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            onQueryChange={setQuery}
            onCreateClick={openCreateModal}
            onThemesClick={goToThemes}
            onSubthemesClick={goToSubthemes}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={2}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminVocabularyTable
            level={level}
            items={filteredItems}
            totalItems={activeItems.length}
            loading={loading}
            refreshing={isRefreshing}
            lastUpdatedAt={lastUpdatedAt}
            onReload={reload}
            onOpenItem={handleOpenItem}
            onEditItem={openEditModal}
          />
        </AnimatedEntrance>
      </div>

      <AdminVocabularyRecordModal
        open={modal.open}
        mode={modal.mode}
        level={modal.level}
        item={modal.item}
        selectedTheme={selectedTheme}
        selectedSubtheme={selectedSubtheme}
        saving={isSaving}
        deleting={isDeleting}
        error={modalError}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </AdminDashboardShell>
  );
}