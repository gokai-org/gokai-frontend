"use client";

import { BarChart3, RefreshCw, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";

import type {
  ReviewStrategiesRegister,
  ReviewStrategyKey,
} from "../types";
import {
  getReviewStrategyLabel,
  getReviewStrategyProbabilityEntries,
  getStrategyKeyFromIndex,
} from "../utils/reviewMappers";

interface ReviewStrategyPanelProps {
  strategyRegister?: ReviewStrategiesRegister | null;
  refreshing?: boolean;
  lastRefreshedAt?: string | null;
  onRefresh?: () => void;
}

function formatProbability(probability?: number) {
  if (typeof probability !== "number") {
    return "--";
  }

  return `${Math.round(probability * 100)}%`;
}

function formatReward(value?: number) {
  if (typeof value !== "number") {
    return "--";
  }

  return value.toFixed(2);
}

function formatRefreshTime(value?: string | null) {
  if (!value) {
    return "Sin refresco manual todavía";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Sin refresco manual todavía";
  }

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getHighestStrategyLabel(register?: ReviewStrategiesRegister | null) {
  if (!register) {
    return "Aún no hay estrategia dominante";
  }

  const strategyKey = getStrategyKeyFromIndex(register.highest_reward_strategy);
  return strategyKey ? getReviewStrategyLabel(strategyKey) : "Aún no hay estrategia dominante";
}

function StrategyMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-primary/70 px-3 py-2.5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-content-tertiary">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-content-primary">
        {value}
      </p>
    </div>
  );
}

function StrategyCard({
  strategy,
}: {
  strategy: {
    key: ReviewStrategyKey;
    label: string;
    probability?: number;
    avgReward?: number;
    evaluationCount?: number;
  };
}) {
  const width = typeof strategy.probability === "number"
    ? Math.max(8, Math.round(strategy.probability * 100))
    : 8;

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-content-primary">
            {strategy.label}
          </p>
          <p className="mt-1 text-xs font-medium text-content-tertiary">
            {strategy.key}
          </p>
        </div>
        <span className="rounded-full border border-accent/15 bg-accent/10 px-2.5 py-1 text-xs font-extrabold text-accent">
          {formatProbability(strategy.probability)}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-tertiary">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <StrategyMetric label="Reward" value={formatReward(strategy.avgReward)} />
        <StrategyMetric
          label="Evaluaciones"
          value={String(strategy.evaluationCount ?? 0)}
        />
      </div>
    </motion.article>
  );
}

export function ReviewStrategyPanel({
  strategyRegister,
  refreshing = false,
  lastRefreshedAt,
  onRefresh,
}: ReviewStrategyPanelProps) {
  const strategies = getReviewStrategyProbabilityEntries(strategyRegister);

  return (
    <section className="rounded-[28px] border border-border-subtle bg-surface-primary p-5 shadow-sm ring-1 ring-black/[0.02] dark:bg-[#161616] dark:ring-white/[0.04]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-accent">
            <BarChart3 className="h-4 w-4" />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
              Motor probabilístico
            </p>
          </div>
          <h2 className="mt-2 text-lg font-extrabold tracking-tight text-content-primary">
            Estrategias que están guiando los repasos
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-content-secondary">
            Estas recomendaciones cambian porque el recomendador reevalúa probabilidades en cada refresh.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold shadow-sm transition-all ${
            refreshing
              ? "cursor-wait bg-surface-secondary text-content-tertiary"
              : "bg-accent text-content-inverted hover:bg-accent-hover"
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refrescando" : "Refrescar recomendaciones"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/55 p-4">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-content-tertiary">
              Estrategia dominante
            </p>
          </div>
          <p className="mt-2 text-sm font-bold text-content-primary">
            {getHighestStrategyLabel(strategyRegister)}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/55 p-4">
          <div className="flex items-center gap-2 text-accent">
            <Target className="h-4 w-4" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-content-tertiary">
              Mejor reward
            </p>
          </div>
          <p className="mt-2 text-sm font-bold text-content-primary">
            {typeof strategyRegister?.highest_avg_reward === "number"
              ? strategyRegister.highest_avg_reward.toFixed(2)
              : "--"}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/55 p-4">
          <div className="flex items-center gap-2 text-accent">
            <RefreshCw className="h-4 w-4" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-content-tertiary">
              Último refresh
            </p>
          </div>
          <p className="mt-2 text-sm font-bold text-content-primary">
            {formatRefreshTime(lastRefreshedAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {strategies.length > 0 ? (
          strategies.map((strategy) => (
            <StrategyCard key={strategy.key} strategy={strategy} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-secondary/45 p-5 text-sm font-medium text-content-secondary md:col-span-2 xl:col-span-3">
            Refresca las recomendaciones para ver las probabilidades activas del recomendador de repasos.
          </div>
        )}
      </div>
    </section>
  );
}