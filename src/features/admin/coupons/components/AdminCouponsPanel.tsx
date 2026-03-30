"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Ticket } from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useToast } from "@/shared/ui/ToastProvider";
import { AdminCouponsHeader } from "./AdminCouponsHeader";
import { AdminCouponsFilters } from "./AdminCouponsFilters";
import { AdminCouponsTable } from "./AdminCouponsTable";
import { AdminCouponDetailModal } from "./AdminCouponDetailModal";
import { AdminCouponCreateModal } from "./AdminCouponCreateModal";
import { useAdminCoupons } from "../hooks/useAdminCoupons";
import {
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
} from "../services/api";
import { mapBackendCouponToAdmin } from "../utils/couponMappers";
import type { AdminCoupon, CreateCouponRequest, UpdateCouponRequest } from "../types/coupons";

export function AdminCouponsPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const toast = useToast();
  const [selectedCoupon, setSelectedCoupon] = useState<AdminCoupon | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    query,
    setQuery,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    statusFilter,
    setStatusFilter,
    summary,
    filteredCoupons,
    allCoupons,
    reloadCoupons,
    replaceCoupon,
    removeCoupon,
  } = useAdminCoupons();

  const cardPercentages = useMemo(() => {
    const total = summary.total;
    const toPercent = (value: number) =>
      total > 0 ? Math.round((value / total) * 100) : 0;

    return {
      active: toPercent(summary.active),
      expired: toPercent(summary.expired),
    };
  }, [summary.active, summary.expired, summary.total]);

  const handleOpenCoupon = useCallback((coupon: AdminCoupon) => {
    setModalError(null);
    setSelectedCoupon(coupon);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    if (isSaving || isDeleting) return;
    setIsDetailOpen(false);
    setModalError(null);
  }, [isSaving, isDeleting]);

  const handleSaveCoupon = useCallback(
    async (payload: UpdateCouponRequest) => {
      if (!selectedCoupon) return;

      setIsSaving(true);
      setModalError(null);

      try {
        await updateAdminCoupon(selectedCoupon.id, payload);
        await reloadCoupons();

        toast.success("Cupon actualizado correctamente.");
        setIsDetailOpen(false);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el cupon";

        setModalError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [reloadCoupons, selectedCoupon, toast],
  );

  const handleDeleteCoupon = useCallback(async () => {
    if (!selectedCoupon) return;

    setIsDeleting(true);
    setModalError(null);

    try {
      await deleteAdminCoupon(selectedCoupon.id);
      removeCoupon(selectedCoupon.id);

      toast.success("Cupon eliminado correctamente.");
      setIsDetailOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar el cupon";

      setModalError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [removeCoupon, selectedCoupon, toast]);

  const handleCreateCoupon = useCallback(
    async (payload: CreateCouponRequest) => {
      setIsCreating(true);
      setCreateError(null);

      try {
        await createAdminCoupon(payload);
        await reloadCoupons();

        toast.success("Cupon creado correctamente.");
        setIsCreateOpen(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo crear el cupon";

        setCreateError(message);
        toast.error(message);
      } finally {
        setIsCreating(false);
      }
    },
    [reloadCoupons, toast],
  );

  return (
    <AdminDashboardShell
      header={<AdminCouponsHeader totalCoupons={allCoupons.length} />}
      containerClassName="max-w-[1700px] px-2 sm:px-3 lg:px-4 xl:px-5"
    >
      <div className="space-y-6 pb-8">
        <AnimatedEntrance
          index={0}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <AdminMetricCard
              title="Cupones totales"
              value={String(summary.total)}
              hint="Total de cupones registrados"
              icon={<Ticket className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={0}
            />
            <AdminMetricCard
              title="Cupones activos"
              value={String(summary.active)}
              hint={`${cardPercentages.active}% del total`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              trend={cardPercentages.active}
              animationsEnabled={animationsEnabled}
              index={1}
            />
            <AdminMetricCard
              title="Cupones expirados"
              value={String(summary.expired)}
              hint={`${cardPercentages.expired}% del total`}
              icon={<Clock3 className="h-5 w-5" />}
              trend={cardPercentages.expired > 0 ? -cardPercentages.expired : 0}
              animationsEnabled={animationsEnabled}
              index={2}
            />
          </section>
        </AnimatedEntrance>

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            No se pudieron cargar los cupones del backend. {error}
          </div>
        )}

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminCouponsFilters
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onCreateClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={2}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminCouponsTable
            coupons={filteredCoupons}
            totalCoupons={allCoupons.length}
            loading={loading}
            refreshing={isRefreshing}
            lastUpdatedAt={lastUpdatedAt}
            onReload={reloadCoupons}
            onViewCoupon={handleOpenCoupon}
          />
        </AnimatedEntrance>
      </div>

      <AdminCouponDetailModal
        open={isDetailOpen}
        coupon={selectedCoupon}
        saving={isSaving}
        deleting={isDeleting}
        error={modalError}
        onClose={handleCloseDetail}
        onSave={handleSaveCoupon}
        onDelete={handleDeleteCoupon}
      />

      <AdminCouponCreateModal
        open={isCreateOpen}
        saving={isCreating}
        error={createError}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateCoupon}
      />
    </AdminDashboardShell>
  );
}
