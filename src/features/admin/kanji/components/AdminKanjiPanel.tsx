"use client";

import { useCallback, useState } from "react";
import { BookOpenText, Languages, ScanText, Sigma } from "lucide-react";
import { KANJI_CONTENT_API_CACHE_KEY } from "@/features/kanji";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { invalidateApiCache } from "@/shared/lib/api/client";
import { clearCache, LIBRARY_CONTENT_CACHE_KEY } from "@/shared/lib/progressBootstrapCache";
import { useToast } from "@/shared/ui/ToastProvider";
import { useAdminKanji } from "../hooks/useAdminKanji";
import {
  createAdminKanji,
  deleteAdminKanji,
  getAdminKanji,
  reorderAdminKanjis,
  updateAdminKanji,
} from "../services/api";
import type { AdminKanjiPayload, AdminKanjiRecord } from "../types/kanji";
import { AdminKanjiFilters } from "./AdminKanjiFilters";
import { AdminKanjiHeader } from "./AdminKanjiHeader";
import { AdminKanjiRecordModal } from "./AdminKanjiRecordModal";
import { AdminKanjiTable } from "./AdminKanjiTable";

type ModalState = {
  open: boolean;
  mode: "create" | "edit";
  item: AdminKanjiRecord | null;
};

const initialModalState: ModalState = {
  open: false,
  mode: "create",
  item: null,
};

function invalidateFrontendKanjiCatalogCaches() {
  invalidateApiCache(KANJI_CONTENT_API_CACHE_KEY);
  invalidateApiCache("/api/content/kanji");
  clearCache(LIBRARY_CONTENT_CACHE_KEY);
}

export function AdminKanjiPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } = useAnimationPreferences();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(initialModalState);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const {
    query,
    setQuery,
    kanjis,
    filteredItems,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    summary,
    reload,
  } = useAdminKanji();

  const persistKanjiOrder = useCallback(
    async (orderedKanjis: AdminKanjiRecord[], movingId: string) => {
      setMovingItemId(movingId);
      try {
        await reorderAdminKanjis(
          orderedKanjis.map((entry, index) => ({
            id: entry.id,
            learnOrder: index,
          })),
        );

        invalidateFrontendKanjiCatalogCaches();
        await reload();
      } finally {
        setMovingItemId(null);
      }
    },
    [reload],
  );

  const hasNonOrderKanjiChanges = useCallback(
    (currentItem: AdminKanjiRecord, payload: AdminKanjiPayload) => {
      const normalizeList = (value: string[] | undefined) => JSON.stringify(value ?? []);

      return (
        currentItem.symbol !== payload.symbol ||
        normalizeList(currentItem.readings) !== normalizeList(payload.readings) ||
        normalizeList(currentItem.meanings) !== normalizeList(payload.meanings) ||
        currentItem.pointsToUnlock !== payload.pointsToUnlock ||
        (currentItem.viewBox ?? "") !== payload.viewBox ||
        normalizeList(currentItem.strokes) !== normalizeList(payload.strokes)
      );
    },
    [],
  );

  const openCreateModal = useCallback(() => {
    setModalError(null);
    setModal({ open: true, mode: "create", item: null });
  }, []);

  const openEditModal = useCallback(
    async (item: AdminKanjiRecord) => {
      setPendingEditId(item.id);
      setModalError(null);

      try {
        const detail = await getAdminKanji(item.id);
        setModal({ open: true, mode: "edit", item: detail });
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar el kanji";
        setModalError(message);
        toast.error(message);
      } finally {
        setPendingEditId(null);
      }
    },
    [toast],
  );

  const closeModal = useCallback(() => {
    if (isSaving || isDeleting) return;
    setModal(initialModalState);
    setModalError(null);
  }, [isDeleting, isSaving]);

  const handleSave = useCallback(
    async (payload: AdminKanjiPayload) => {
      setIsSaving(true);
      setModalError(null);

      try {
        if (modal.mode === "edit" && modal.item) {
          const { learnOrder, ...updatePayload } = payload;
          const currentIndex = kanjis.findIndex((entry) => entry.id === modal.item?.id);
          const shouldUpdateContent = hasNonOrderKanjiChanges(modal.item, payload);

          if (shouldUpdateContent) {
            await updateAdminKanji(modal.item.id, updatePayload);
          }

          if (
            typeof learnOrder === "number" &&
            currentIndex !== -1 &&
            learnOrder !== currentIndex
          ) {
            const reorderedKanjis = [...kanjis];
            const [movingKanji] = reorderedKanjis.splice(currentIndex, 1);
            const targetIndex = Math.max(0, Math.min(reorderedKanjis.length, learnOrder));
            reorderedKanjis.splice(targetIndex, 0, movingKanji);
            await persistKanjiOrder(reorderedKanjis, modal.item.id);
          } else {
            invalidateFrontendKanjiCatalogCaches();
            await reload();
          }
        } else {
          await createAdminKanji(payload);
          invalidateFrontendKanjiCatalogCaches();
          await reload();
        }

        toast.success(
          modal.mode === "create"
            ? "Kanji creado correctamente."
            : "Kanji actualizado correctamente.",
        );
        setModal(initialModalState);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo guardar el kanji";
        setModalError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [hasNonOrderKanjiChanges, kanjis, modal, persistKanjiOrder, reload, toast],
  );

  const handleDelete = useCallback(async () => {
    if (!modal.item) return;

    setIsDeleting(true);
    setModalError(null);

    try {
      await deleteAdminKanji(modal.item.id);
      invalidateFrontendKanjiCatalogCaches();
      await reload();
      toast.success("Kanji eliminado correctamente.");
      setModal(initialModalState);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el kanji";
      setModalError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [modal.item, reload, toast]);

  const handleReorderKanji = useCallback(
    async (
      draggedItemId: string,
      targetItemId: string,
      placement: "before" | "after",
    ) => {
      if (draggedItemId === targetItemId) {
        return;
      }

      const currentIndex = kanjis.findIndex((entry) => entry.id === draggedItemId);
      const targetIndex = kanjis.findIndex((entry) => entry.id === targetItemId);
      if (currentIndex === -1 || targetIndex === -1 || currentIndex === targetIndex) {
        return;
      }

      const reorderedKanjis = [...kanjis];
      const [movingKanji] = reorderedKanjis.splice(currentIndex, 1);
      const adjustedTargetIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
      const insertionIndex = placement === "before"
        ? adjustedTargetIndex
        : adjustedTargetIndex + 1;
      reorderedKanjis.splice(insertionIndex, 0, movingKanji);

      try {
        await persistKanjiOrder(reorderedKanjis, draggedItemId);
        toast.success("Orden de kanjis actualizado.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo actualizar el orden";
        toast.error(message);
      }
    },
    [kanjis, persistKanjiOrder, toast],
  );

  const currentOrderPosition =
    modal.mode === "edit" && modal.item
      ? kanjis.findIndex((entry) => entry.id === modal.item?.id) + 1 || null
      : null;

  return (
    <AdminDashboardShell
      header={<AdminKanjiHeader totalKanjis={kanjis.length} />}
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
              title="Kanjis"
              value={String(summary.total)}
              hint="Registros totales"
              icon={<Languages className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={0}
            />
            <AdminMetricCard
              title="Lecturas"
              value={String(summary.totalReadings)}
              hint="Total de lecturas registradas"
              icon={<BookOpenText className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={1}
            />
            <AdminMetricCard
              title="Significados"
              value={String(summary.totalMeanings)}
              hint="Total de significados cargados"
              icon={<ScanText className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={2}
            />
            <AdminMetricCard
              title="Promedio pts"
              value={String(summary.averagePoints)}
              hint="Valor expuesto por backend"
              icon={<Sigma className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={3}
            />
          </section>
        </AnimatedEntrance>

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            No se pudo cargar el catalogo de kanji. {error}
          </div>
        )}

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminKanjiFilters
            query={query}
            onQueryChange={setQuery}
            onCreateClick={openCreateModal}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={2}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminKanjiTable
            items={filteredItems}
            totalItems={kanjis.length}
            loading={loading}
            refreshing={isRefreshing}
            lastUpdatedAt={lastUpdatedAt}
            pendingEditId={pendingEditId}
            movingItemId={movingItemId}
            onReload={reload}
            onEditItem={openEditModal}
            onReorderItem={handleReorderKanji}
          />
        </AnimatedEntrance>
      </div>

      <AdminKanjiRecordModal
        open={modal.open}
        mode={modal.mode}
        item={modal.item}
        currentOrderPosition={currentOrderPosition}
        totalOrderPositions={modal.mode === "edit" ? kanjis.length : kanjis.length + 1}
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