"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Eye, FolderOpen } from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useToast } from "@/shared/ui/ToastProvider";
import { AdminSupportHeader } from "./AdminSupportHeader";
import { AdminSupportFilters } from "./AdminSupportFilters";
import { AdminSupportTicketTable } from "./AdminSupportTicketTable";
import { AdminSupportTicketDetailModal } from "./AdminSupportTicketDetailModal";
import { useAdminSupportTickets } from "../hooks/useAdminSupportTickets";
import { saveAdminSupportTicketReply } from "../services/api";
import { mapBackendTicketToAdminTicket } from "../utils/supportTicketMappers";
import type { AdminSupportTicket, AdminTicketStatus } from "../types/tickets";

export function AdminSupportPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const toast = useToast();
  const [selectedTicket, setSelectedTicket] =
    useState<AdminSupportTicket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSavingTicket, setIsSavingTicket] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const {
    query,
    setQuery,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    summary,
    filteredTickets,
    allTickets,
    reloadTickets,
    replaceTicket,
  } = useAdminSupportTickets();

  const cardPercentages = useMemo(() => {
    const total = summary.total;
    const toPercent = (value: number) =>
      total > 0 ? Math.round((value / total) * 100) : 0;

    return {
      open: toPercent(summary.open),
      inProgress: toPercent(summary.inProgress),
      resolved: toPercent(summary.resolved),
      closed: toPercent(summary.closed),
    };
  }, [summary.closed, summary.inProgress, summary.open, summary.resolved, summary.total]);

  const handleOpenTicket = useCallback((ticket: AdminSupportTicket) => {
    setDetailError(null);
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    if (isSavingTicket) return;
    setIsDetailOpen(false);
    setDetailError(null);
  }, [isSavingTicket]);

  const handleSaveTicket = useCallback(
    async (payload: { status: AdminTicketStatus; note: string | null }) => {
      if (!selectedTicket) return;

      setIsSavingTicket(true);
      setDetailError(null);

      try {
        const updated = await saveAdminSupportTicketReply(selectedTicket.id, {
          status: payload.status,
          note: payload.note,
        });

        const mapped = mapBackendTicketToAdminTicket(updated);
        replaceTicket(mapped);
        setSelectedTicket(mapped);

        toast.success("Ticket actualizado correctamente.");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el ticket";

        setDetailError(message);
        toast.error(message);
      } finally {
        setIsSavingTicket(false);
      }
    },
    [replaceTicket, selectedTicket, toast],
  );

  return (
    <AdminDashboardShell
      header={<AdminSupportHeader totalTickets={allTickets.length} />}
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
              title="Tickets abiertos"
              value={String(summary.open)}
              hint={`${cardPercentages.open}% del total`}
              icon={<FolderOpen className="h-5 w-5" />}
              trend={cardPercentages.open}
              animationsEnabled={animationsEnabled}
              index={0}
            />
            <AdminMetricCard
              title="Tickets en progreso"
              value={String(summary.inProgress)}
              hint={`${cardPercentages.inProgress}% del total`}
              icon={<Eye className="h-5 w-5" />}
              trend={cardPercentages.inProgress}
              animationsEnabled={animationsEnabled}
              index={1}
            />
            <AdminMetricCard
              title="Tickets resueltos"
              value={String(summary.resolved)}
              hint={`${cardPercentages.resolved}% del total`}
              icon={<Clock3 className="h-5 w-5" />}
              trend={cardPercentages.resolved}
              animationsEnabled={animationsEnabled}
              index={2}
            />
            <AdminMetricCard
              title="Tickets cerrados"
              value={String(summary.closed)}
              hint={`${cardPercentages.closed}% del total`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              trend={cardPercentages.closed}
              animationsEnabled={animationsEnabled}
              index={3}
            />
          </section>
        </AnimatedEntrance>

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            No se pudieron cargar los tickets del backend. {error}
          </div>
        )}

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminSupportFilters
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={2}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminSupportTicketTable
            tickets={filteredTickets}
            totalTickets={allTickets.length}
            loading={loading}
            refreshing={isRefreshing}
            lastUpdatedAt={lastUpdatedAt}
            onReload={reloadTickets}
            onViewTicket={handleOpenTicket}
          />
        </AnimatedEntrance>
      </div>

      <AdminSupportTicketDetailModal
        open={isDetailOpen}
        ticket={selectedTicket}
        saving={isSavingTicket}
        error={detailError}
        onClose={handleCloseDetail}
        onSave={handleSaveTicket}
      />
    </AdminDashboardShell>
  );
}
