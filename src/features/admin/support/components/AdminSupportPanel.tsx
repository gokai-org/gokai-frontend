"use client";

import { AlertTriangle, Clock3, Eye, FolderOpen } from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { AdminSupportHeader } from "./AdminSupportHeader";
import { AdminSupportFilters } from "./AdminSupportFilters";
import { AdminSupportTicketTable } from "./AdminSupportTicketTable";
import { useAdminSupportTickets } from "../hooks/useAdminSupportTickets";

export function AdminSupportPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const {
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    summary,
    filteredTickets,
    allTickets,
  } = useAdminSupportTickets();

  return (
    <AdminDashboardShell
      header={<AdminSupportHeader totalTickets={allTickets.length} />}
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
              hint="Necesitan seguimiento activo"
              icon={<FolderOpen className="h-5 w-5" />}
              trend={8}
              animationsEnabled={animationsEnabled}
              index={0}
            />
            <AdminMetricCard
              title="Tickets por revisar"
              value={String(summary.review)}
              hint="Pendientes de validacion final"
              icon={<Eye className="h-5 w-5" />}
              trend={5}
              animationsEnabled={animationsEnabled}
              index={1}
            />
            <AdminMetricCard
              title="Tickets pendientes"
              value={String(summary.pending)}
              hint="Esperando respuesta de equipo"
              icon={<Clock3 className="h-5 w-5" />}
              trend={-3}
              animationsEnabled={animationsEnabled}
              index={2}
            />
            <AdminMetricCard
              title="Prioridad alta"
              value={String(summary.highPriority)}
              hint="Casos criticos en bandeja"
              icon={<AlertTriangle className="h-5 w-5" />}
              trend={2}
              animationsEnabled={animationsEnabled}
              index={3}
            />
          </section>
        </AnimatedEntrance>

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
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
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
          />
        </AnimatedEntrance>
      </div>
    </AdminDashboardShell>
  );
}
