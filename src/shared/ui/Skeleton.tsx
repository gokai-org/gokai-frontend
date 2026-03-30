"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* ── Primitivas base ──────────────────────────────────── */

interface SkeletonBoxProps {
  className?: string;
  /** rounded-full, rounded-xl, etc. */
  rounded?: string;
}

/** Bloque pulsante genérico */
export function SkeletonBox({
  className = "",
  rounded = "rounded-lg",
}: SkeletonBoxProps) {
  return (
    <div className={`animate-pulse bg-skeleton-base ${rounded} ${className}`} />
  );
}

/** Línea de texto skeleton */
export function SkeletonLine({
  width = "w-full",
  height = "h-3",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-skeleton-base rounded ${height} ${width} ${className}`}
    />
  );
}

/* ── Tarjeta skeleton reutilizable ────────────────────── */

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface-elevated rounded-[24px] border border-border-subtle/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] p-6 min-h-[160px] flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start mb-5">
        <div className="h-[48px] w-[48px] rounded-[18px] bg-surface-tertiary animate-pulse" />
      </div>
      <div className="flex-1 flex flex-col justify-end mt-2">
        <div className="h-5 w-3/4 bg-skeleton-base rounded animate-pulse mb-2" />
        <div className="h-3.5 w-1/2 bg-surface-tertiary rounded animate-pulse" />
      </div>
    </div>
  );
}

/* ── Stat card skeleton (estilo StatsOverview) ───────── */

export function SkeletonStatCard() {
  return (
    <div className="bg-surface-elevated rounded-2xl p-5 shadow-sm border border-border-subtle animate-pulse w-full min-w-[150px] max-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-surface-tertiary" />
        <div className="w-12 h-5 rounded-full bg-surface-tertiary" />
      </div>
      <div className="h-7 w-20 bg-skeleton-base rounded mb-2" />
      <div className="h-3 w-24 bg-surface-tertiary rounded" />
    </div>
  );
}

/* ── Chart skeleton (para gráficas) ──────────────────── */

export function SkeletonChart({
  height = "h-[220px]",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface-elevated rounded-2xl p-6 shadow-sm border border-border-subtle animate-pulse ${className}`}
    >
      <div className="h-5 w-40 bg-skeleton-base rounded mb-2" />
      <div className="h-3 w-56 bg-surface-tertiary rounded mb-6" />
      <div
        className={`${height} bg-surface-secondary rounded-xl relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-skeleton-shine to-transparent skeleton-shimmer" />
      </div>
    </div>
  );
}

/* ── List item skeleton ───────────────────────────────── */

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-surface-tertiary shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-32 bg-skeleton-base rounded mb-1.5" />
        <div className="h-3 w-48 bg-surface-tertiary rounded" />
      </div>
      <div className="w-12 h-4 bg-surface-tertiary rounded shrink-0" />
    </div>
  );
}

/* ── Recent card skeleton (sidebar) ───────────────────── */

export function SkeletonRecentCard() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated border border-border-subtle animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-surface-tertiary shrink-0" />
      <div className="flex-1">
        <div className="h-3.5 w-24 bg-skeleton-base rounded mb-1.5" />
        <div className="h-2.5 w-16 bg-surface-tertiary rounded" />
      </div>
    </div>
  );
}

/* ── Sección completa de contenido ────────────────────── */

interface SkeletonSectionProps {
  /** Número de tarjetas a mostrar */
  cards?: number;
  /** Columnas de grid (default: responsive) */
  cols?: string;
  /** Mostrar header? */
  showHeader?: boolean;
  /** Título del header */
  title?: string;
}

export function SkeletonSection({
  cards = 8,
  cols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  showHeader = true,
  title,
}: SkeletonSectionProps) {
  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          {title ? (
            <h3 className="text-lg font-semibold text-content-primary">{title}</h3>
          ) : (
            <div className="h-5 w-28 bg-skeleton-base rounded animate-pulse" />
          )}
          <div className="h-4 w-20 bg-surface-tertiary rounded animate-pulse" />
        </div>
      )}
      <div className={`grid ${cols} gap-4`}>
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

/* ── Page-level loading (pantalla completa estilo dashboard) ── */

interface PageSkeletonProps {
  /** Mostrar banner hero */
  showBanner?: boolean;
  /** Número de secciones skeleton */
  sections?: number;
  /** Contenido custom del banner */
  bannerContent?: ReactNode;
  children?: ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function PageSkeleton({
  showBanner = false,
  sections = 2,
  bannerContent,
  children,
}: PageSkeletonProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {showBanner && (
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-8 md:p-10 bg-gradient-to-r from-surface-tertiary to-surface-secondary relative overflow-hidden animate-pulse"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-surface-primary/30 rounded-full -translate-y-1/2 translate-x-1/3" />
          {bannerContent ?? (
            <div className="relative z-10 space-y-3">
              <div className="h-4 w-40 bg-skeleton-base rounded" />
              <div className="h-9 w-64 bg-skeleton-base rounded" />
              <div className="h-3 w-80 bg-skeleton-base rounded" />
            </div>
          )}
        </motion.div>
      )}

      {children ??
        Array.from({ length: sections }).map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <SkeletonSection cards={i === 0 ? 7 : 4} />
          </motion.div>
        ))}
    </motion.div>
  );
}

/* ── Drawer / Panel loading ───────────────────────────── */

export function SkeletonDrawerContent() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Fake header */}
      <div className="space-y-3">
        <div className="h-6 w-48 bg-skeleton-base rounded" />
        <div className="h-4 w-72 bg-surface-tertiary rounded" />
      </div>

      {/* Fake content block */}
      <div className="rounded-2xl border border-border-subtle p-5 space-y-4">
        <div className="h-5 w-36 bg-skeleton-base rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-surface-tertiary rounded" />
          <div className="h-3 w-5/6 bg-surface-tertiary rounded" />
          <div className="h-3 w-4/6 bg-surface-tertiary rounded" />
        </div>
      </div>

      {/* Fake action area */}
      <div className="rounded-2xl border border-border-subtle p-5 space-y-3">
        <div className="h-5 w-28 bg-skeleton-base rounded" />
        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-surface-tertiary rounded-xl" />
          <div className="h-10 flex-1 bg-surface-tertiary rounded-xl" />
        </div>
      </div>

      {/* Fake secondary block */}
      <div className="rounded-2xl border border-border-subtle p-5 space-y-3">
        <div className="h-4 w-40 bg-surface-tertiary rounded" />
        <div className="h-20 w-full bg-surface-secondary rounded-xl" />
      </div>
    </div>
  );
}

/* ── Library full-page skeleton ───────────────────────── */

export function LibrarySkeleton() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Category filter pills */}
      <motion.div
        variants={itemVariants}
        className="flex gap-3 overflow-hidden"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-full bg-surface-tertiary animate-pulse shrink-0"
            style={{ width: `${80 + i * 12}px` }}
          />
        ))}
      </motion.div>

      {/* Main grid + sidebar */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Content area */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-20 bg-skeleton-base rounded animate-pulse" />
              <div className="h-4 w-24 bg-surface-tertiary rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-20 bg-skeleton-base rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRecentCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Second section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 bg-skeleton-base rounded animate-pulse" />
          <div className="h-4 w-28 bg-surface-tertiary rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Stats full-page skeleton ─────────────────────────── */

export function StatsSkeleton() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Stat cards row */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-4"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </motion.div>

      {/* Section header + 2 charts */}
      <motion.div variants={itemVariants} className="space-y-5">
        <div>
          <div className="h-6 w-48 bg-skeleton-base rounded animate-pulse mb-2" />
          <div className="h-3 w-72 bg-surface-tertiary rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </motion.div>

      {/* Section header + 3 charts */}
      <motion.div variants={itemVariants} className="space-y-5">
        <div>
          <div className="h-6 w-52 bg-skeleton-base rounded animate-pulse mb-2" />
          <div className="h-3 w-64 bg-surface-tertiary rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonChart height="h-[280px]" />
          <div className="bg-surface-elevated rounded-2xl p-6 shadow-sm border border-border-subtle animate-pulse">
            <div className="h-5 w-32 bg-skeleton-base rounded mb-2" />
            <div className="h-3 w-48 bg-surface-tertiary rounded mb-6" />
            <div className="h-[180px] w-[180px] mx-auto bg-surface-secondary rounded-full" />
          </div>
          <div className="bg-surface-elevated rounded-2xl p-6 shadow-sm border border-border-subtle animate-pulse">
            <div className="h-5 w-36 bg-skeleton-base rounded mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-surface-tertiary" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-skeleton-base rounded mb-1" />
                  <div className="h-3 w-48 bg-surface-tertiary rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Streak calendar */}
      <motion.div variants={itemVariants}>
        <SkeletonChart height="h-[120px]" />
      </motion.div>
    </motion.div>
  );
}
