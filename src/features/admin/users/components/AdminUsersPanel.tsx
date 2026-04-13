"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Crown, Star, Users, UserX } from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useToast } from "@/shared/ui/ToastProvider";
import { AdminUsersHeader } from "./AdminUsersHeader";
import { AdminUsersFilters } from "./AdminUsersFilters";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminUserDetailModal } from "./AdminUserDetailModal";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { deleteAdminUser, getAdminUser, updateAdminUser } from "../services/api";
import { mapBackendUserToAdmin } from "../utils/userMappers";
import type { AdminUser, UpdateUserRequest } from "../types/users";

export function AdminUsersPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const toast = useToast();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const detailRequestRef = useRef(0);

  const {
    query,
    setQuery,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    hasGoogleData,
    statusFilter,
    setStatusFilter,
    summary,
    filteredUsers,
    allUsers,
    reloadUsers,
    replaceUser,
    removeUser,
  } = useAdminUsers();

  const cardPercentages = useMemo(() => {
    const total = summary.total;
    const toPercent = (value: number) =>
      total > 0 ? Math.round((value / total) * 100) : 0;

    return {
      subscribed: toPercent(summary.subscribed),
      free: toPercent(summary.free),
      google: toPercent(summary.google),
    };
  }, [summary.subscribed, summary.free, summary.google, summary.total]);

  const handleOpenUser = useCallback(
    (user: AdminUser) => {
      const requestId = detailRequestRef.current + 1;
      detailRequestRef.current = requestId;

      setModalError(null);
      setSelectedUser(user);
      setIsDetailOpen(true);
      setIsDetailLoading(true);

      void getAdminUser(user.id)
        .then((raw) => {
          if (detailRequestRef.current !== requestId) return;

          const mapped = mapBackendUserToAdmin(raw, user);
          replaceUser(mapped);
          setSelectedUser(mapped);
        })
        .catch((err) => {
          if (detailRequestRef.current !== requestId) return;

          setModalError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el detalle del usuario",
          );
        })
        .finally(() => {
          if (detailRequestRef.current === requestId) {
            setIsDetailLoading(false);
          }
        });
    },
    [replaceUser],
  );

  const handleCloseDetail = useCallback(() => {
    if (isSaving || isDeleting) return;
    detailRequestRef.current += 1;
    setIsDetailOpen(false);
    setIsDetailLoading(false);
    setModalError(null);
  }, [isSaving, isDeleting]);

  const handleSaveUser = useCallback(
    async (payload: UpdateUserRequest) => {
      if (!selectedUser) return;

      setIsSaving(true);
      setModalError(null);

      try {
        const raw = await updateAdminUser(selectedUser.id, payload);
        const mapped = mapBackendUserToAdmin(raw, selectedUser);
        replaceUser(mapped);
        setSelectedUser(mapped);

        toast.success("Usuario actualizado correctamente.");
        setIsDetailOpen(false);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el usuario";

        setModalError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [replaceUser, selectedUser, toast],
  );

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    setModalError(null);

    try {
      await deleteAdminUser(selectedUser.id);
      removeUser(selectedUser.id);

      toast.success("Usuario eliminado correctamente.");
      setIsDetailOpen(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el usuario";

      setModalError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [removeUser, selectedUser, toast]);

  return (
    <AdminDashboardShell
      header={<AdminUsersHeader totalUsers={allUsers.length} />}
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
              title="Usuarios totales"
              value={String(summary.total)}
              hint="Total de usuarios registrados"
              icon={<Users className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={0}
            />
            <AdminMetricCard
              title="Suscritos"
              value={String(summary.subscribed)}
              hint={`${cardPercentages.subscribed}% del total`}
              icon={<Crown className="h-5 w-5" />}
              trend={cardPercentages.subscribed}
              animationsEnabled={animationsEnabled}
              index={1}
            />
            <AdminMetricCard
              title="Gratis"
              value={String(summary.free)}
              hint={`${cardPercentages.free}% del total`}
              icon={<UserX className="h-5 w-5" />}
              trend={cardPercentages.free > 0 ? -cardPercentages.free : 0}
              animationsEnabled={animationsEnabled}
              index={2}
            />
            <AdminMetricCard
              title="Google"
              value={hasGoogleData ? String(summary.google) : "—"}
              hint={
                hasGoogleData
                  ? `${cardPercentages.google}% del total`
                  : "No disponible en el listado actual"
              }
              icon={<Star className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={3}
            />
          </section>
        </AnimatedEntrance>

        {!loading && error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            No se pudieron cargar los usuarios del backend. {error}
          </div>
        )}

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminUsersFilters
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            showGoogleFilter={hasGoogleData}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={2}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminUsersTable
            users={filteredUsers}
            totalUsers={allUsers.length}
            loading={loading}
            refreshing={isRefreshing}
            lastUpdatedAt={lastUpdatedAt}
            onReload={reloadUsers}
            onViewUser={handleOpenUser}
          />
        </AnimatedEntrance>
      </div>

      <AdminUserDetailModal
        key={`${selectedUser?.id ?? "empty"}-${isDetailOpen ? "open" : "closed"}`}
        open={isDetailOpen}
        user={selectedUser}
        detailLoading={isDetailLoading}
        saving={isSaving}
        deleting={isDeleting}
        error={modalError}
        onClose={handleCloseDetail}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
      />
    </AdminDashboardShell>
  );
}
