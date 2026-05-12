"use client";

import { useMemo } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  CircleHelp,
  CreditCard,
  Gauge,
  Gift,
  RefreshCw,
  TicketPercent,
  TrendingDown,
  UsersRound,
} from "lucide-react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useAdminStats } from "../hooks/useAdminStats";
import type { AdminStatsSeriesKey, AdminStatsTimelinePoint } from "../types/stats";
import {
  ADMIN_STATS_META,
  ADMIN_STATS_ACCENT_COLORS,
  buildAdminStatsTimeline,
  formatAdminStatValue,
  getAdminStatSnapshot,
} from "../utils/stats";

const chartFontFamily =
  'var(--font-sans), var(--font-montserrat), "Montserrat", sans-serif';

const axisPrimaryTick = {
  fontSize: 12,
  fill: "var(--text-tertiary)",
  fontWeight: 600,
  fontFamily: chartFontFamily,
};

const axisSecondaryTick = {
  fontSize: 11,
  fill: "var(--text-muted)",
  fontFamily: chartFontFamily,
};

type ChartPayloadItem = {
  color?: string;
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  payload?: AdminStatsTimelinePoint;
};

interface ChartCardProps {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
  legend?: React.ReactNode;
  helpContent?: {
    title?: string;
    description: string;
    points: string[];
    source?: string;
  };
}

interface MetricTooltipProps {
  active?: boolean;
  payload?: ChartPayloadItem[];
  label?: string;
  title?: string;
}

function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-secondary/60 px-3 py-1 text-xs font-semibold text-content-secondary">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function ChartHelpPopover({
  title,
  description,
  points,
  source,
}: NonNullable<ChartCardProps["helpContent"]>) {
  return (
    <div className="group relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={`Explicacion de ${title ?? "la grafica"}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-secondary/70 text-content-tertiary transition hover:border-accent/30 hover:text-accent focus-visible:border-accent focus-visible:text-accent focus-visible:outline-none"
      >
        <CircleHelp className="h-4 w-4" />
      </button>

      <div className="pointer-events-none absolute left-0 top-full z-20 mt-3 w-80 max-w-[calc(100vw-3rem)] translate-y-2 rounded-2xl border border-border-default bg-surface-primary p-4 opacity-0 shadow-2xl transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 md:w-[24rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-content-muted">
          {title ?? "Como leer esta grafica"}
        </p>
        <p className="mt-2 text-sm text-content-secondary">{description}</p>
        <div className="mt-3 space-y-2">
          {points.map((point, index) => (
            <p key={`${title ?? "chart"}-${index}`} className="text-sm text-content-primary">
              {point}
            </p>
          ))}
        </div>
        {source ? (
          <p className="mt-3 border-t border-border-subtle pt-3 text-xs text-content-tertiary">
            {source}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, badge, children, legend, helpContent }: ChartCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border-default bg-surface-primary p-5 font-sans shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
              {helpContent ? <ChartHelpPopover {...helpContent} /> : null}
            </div>
            <p className="mt-1 text-sm text-content-tertiary">{subtitle}</p>
          </div>
          {badge ? (
            <span className="rounded-full border border-border-subtle bg-surface-secondary/70 px-3 py-1 text-xs font-semibold text-content-secondary">
              {badge}
            </span>
          ) : null}
        </div>
        <div className="mt-5 h-[320px]">{children}</div>
        {legend ? <div className="mt-4 flex flex-wrap gap-2">{legend}</div> : null}
      </div>
    </section>
  );
}

function MetricTooltip({ active, payload, label, title }: MetricTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-primary px-4 py-3 font-sans shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-content-muted">
        {title ?? label}
      </p>
      {label && title ? (
        <p className="mt-1 text-sm font-semibold text-content-primary">{label}</p>
      ) : null}
      <div className="mt-3 space-y-2">
        {payload.map((item) => {
          const rawKey = String(item.dataKey ?? "");
          const value = typeof item.value === "number" ? item.value : Number(item.value ?? 0);
          const meta = rawKey in ADMIN_STATS_META
            ? ADMIN_STATS_META[rawKey as AdminStatsSeriesKey]
            : null;

          const formattedValue =
            rawKey === "netSubscriptions"
              ? formatAdminStatValue(value, "count")
              : rawKey === "subscriptionConversion" ||
                  rawKey === "cancellationPressure" ||
                  rawKey === "couponPressure"
                ? formatAdminStatValue(value, "percent")
                : formatAdminStatValue(value, meta?.kind ?? "count");

          return (
            <div key={rawKey} className="flex items-center justify-between gap-6 text-sm">
              <span className="inline-flex items-center gap-2 text-content-secondary">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color ?? meta?.color ?? "var(--accent)" }}
                />
                {meta?.label ?? item.name ?? rawKey}
              </span>
              <span className="font-semibold text-content-primary">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PulseTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ChartPayloadItem[];
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const keys = Object.keys(ADMIN_STATS_META) as AdminStatsSeriesKey[];

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-primary px-4 py-3 font-sans shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-content-muted">
        Pulso relativo
      </p>
      <p className="mt-1 text-sm font-semibold text-content-primary">
        {point.fullMonthLabel}
      </p>
      <div className="mt-3 space-y-2">
        {keys.map((key) => {
          const meta = ADMIN_STATS_META[key];

          return (
            <div key={key} className="flex items-center justify-between gap-6 text-sm">
              <span className="inline-flex items-center gap-2 text-content-secondary">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.label}
              </span>
              <span className="font-semibold text-content-primary">
                {formatAdminStatValue(point[key], meta.kind)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingStatsLayout() {
  return (
    <div className="space-y-6 pb-8">
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="min-h-[156px] animate-pulse rounded-2xl border border-border-subtle bg-surface-primary p-5 shadow-sm"
          >
            <div className="h-10 w-10 rounded-xl bg-surface-secondary" />
            <div className="mt-6 h-7 w-20 rounded bg-surface-secondary" />
            <div className="mt-3 h-3 w-28 rounded bg-surface-secondary" />
            <div className="mt-2 h-3 w-24 rounded bg-surface-secondary" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-[408px] animate-pulse rounded-[28px] border border-border-default bg-surface-primary p-5 shadow-sm"
          >
            <div className="h-5 w-48 rounded bg-surface-secondary" />
            <div className="mt-2 h-4 w-64 rounded bg-surface-secondary" />
            <div className="mt-8 h-[280px] rounded-2xl bg-surface-secondary" />
          </div>
        ))}
      </section>
    </div>
  );
}

export function AdminStatsPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const { stats, loading, isRefreshing, error, lastUpdatedAt, reloadStats } =
    useAdminStats();

  const timeline = useMemo(() => buildAdminStatsTimeline(stats), [stats]);
  const lastPoint = timeline.at(-1) ?? null;

  const metricCards = useMemo(() => {
    if (!stats) return [];

    const definitions: Array<{
      key: AdminStatsSeriesKey;
      title: string;
      icon: React.ReactNode;
    }> = [
      {
        key: "newUsers",
        title: "Nuevos usuarios",
        icon: <UsersRound className="h-5 w-5" />,
      },
      {
        key: "newSubscriptions",
        title: "Altas premium",
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        key: "canceledSubscriptions",
        title: "Bajas premium",
        icon: <TrendingDown className="h-5 w-5" />,
      },
      {
        key: "couponsRedeemed",
        title: "Cupones canjeados",
        icon: <TicketPercent className="h-5 w-5" />,
      },
      {
        key: "practiceMinutes",
        title: "Practica total",
        icon: <Activity className="h-5 w-5" />,
      },
      {
        key: "chatbotTokens",
        title: "Tokens consumidos",
        icon: <Bot className="h-5 w-5" />,
      },
    ];

    return definitions.map(({ key, title, icon }) => {
      const snapshot = getAdminStatSnapshot(stats[key]);
      const meta = ADMIN_STATS_META[key];

      return {
        key,
        title,
        icon,
        value: formatAdminStatValue(snapshot.current, meta.kind),
        hint: `Acumulado 12m ${formatAdminStatValue(snapshot.total, meta.kind)}`,
        trend: snapshot.trend ?? undefined,
      };
    });
  }, [stats]);

  const headerRightContent = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <span className="rounded-full border border-border-subtle bg-surface-primary/80 px-3 py-1 text-xs font-semibold text-content-secondary">
        Ultimos 12 meses
      </span>
      {lastUpdatedAt ? (
        <span className="rounded-full border border-border-subtle bg-surface-primary/80 px-3 py-1 text-xs font-semibold text-content-secondary">
          Actualizado {lastUpdatedAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => void reloadStats()}
        disabled={loading || isRefreshing}
        className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-primary px-4 py-2 text-sm font-semibold text-content-primary transition hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          className={["h-4 w-4", isRefreshing ? "animate-spin" : ""].join(" ")}
        />
        {isRefreshing ? "Actualizando" : "Actualizar"}
      </button>
    </div>
  );

  return (
    <AdminDashboardShell
      header={
        <AdminPageHeader
          icon={
            <BarChart3
              className="h-7 w-7 text-content-inverted"
              strokeWidth={2.5}
            />
          }
          title="Estadisticas"
          japaneseText="統計"
          subtitle="Resumen ejecutivo de crecimiento, conversion, engagement y promocion"
          rightContent={headerRightContent}
        />
      }
      containerClassName="max-w-[1720px] px-2 sm:px-3 lg:px-4 xl:px-5"
    >
      {loading ? (
        <LoadingStatsLayout />
      ) : (
        <div className="space-y-6 pb-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No se pudieron cargar las estadisticas del backend. {error}
            </div>
          ) : null}

          <AnimatedEntrance
            index={0}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <section className="grid grid-cols-2 gap-4 xl:grid-cols-6">
              {metricCards.map((card, index) => (
                <AdminMetricCard
                  key={card.key}
                  title={card.title}
                  value={card.value}
                  hint={card.hint}
                  icon={card.icon}
                  trend={card.trend}
                  animationsEnabled={animationsEnabled}
                  index={index}
                />
              ))}
            </section>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={1}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
              <ChartCard
                title="Pulso relativo del negocio"
                subtitle="Comparacion normalizada entre adquisicion, engagement y monetizacion"
                helpContent={{
                  title: "Como leer el pulso relativo",
                  description:
                    "Esta grafica compara el ritmo de las seis metricas en una misma escala visual de 0 a 100.",
                  points: [
                    "Cada linea se normaliza respecto a su propio maximo de los ultimos 12 meses, asi que aqui importa la forma de la tendencia y no el volumen absoluto.",
                    "Si una linea sube, significa que esa metrica esta cerca de su mejor mes del periodo; si baja, esta perdiendo fuerza relativa.",
                    "Sirve para detectar si crecimiento, conversion, promociones, engagement o uso de chatbot se estan moviendo juntos o se estan desacoplando.",
                  ],
                  source:
                    "Fuente: /admin/api/stats -> /users/stats/admin. Campos usados: newUsers, newSubscriptions, canceledSubscriptions, couponsRedeemed, practiceMinutes y chatbotTokens.",
                }}
                badge={lastPoint?.fullMonthLabel ?? "Sin datos"}
                legend={
                  <>
                    {(Object.keys(ADMIN_STATS_META) as AdminStatsSeriesKey[]).map((key) => (
                      <LegendPill
                        key={key}
                        color={ADMIN_STATS_META[key].color}
                        label={ADMIN_STATS_META[key].label}
                      />
                    ))}
                  </>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-secondary)"
                    />
                    <XAxis
                      dataKey="monthLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={axisPrimaryTick}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={34}
                      domain={[0, 100]}
                      tick={axisSecondaryTick}
                      tickFormatter={(value: number) => `${value}`}
                    />
                    <Tooltip content={<PulseTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="newUsersIndex"
                      stroke={ADMIN_STATS_META.newUsers.color}
                      strokeWidth={2.6}
                      dot={false}
                      activeDot={{ r: 5 }}
                      animationDuration={animationsEnabled ? 900 : 0}
                    />
                    <Line
                      type="monotone"
                      dataKey="newSubscriptionsIndex"
                      stroke={ADMIN_STATS_META.newSubscriptions.color}
                      strokeWidth={2.4}
                      dot={false}
                      activeDot={{ r: 5 }}
                      animationDuration={animationsEnabled ? 980 : 0}
                    />
                    <Line
                      type="monotone"
                      dataKey="canceledSubscriptionsIndex"
                      stroke={ADMIN_STATS_META.canceledSubscriptions.color}
                      strokeWidth={2.2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      animationDuration={animationsEnabled ? 1040 : 0}
                    />
                    <Line
                      type="monotone"
                      dataKey="couponsRedeemedIndex"
                      stroke={ADMIN_STATS_META.couponsRedeemed.color}
                      strokeWidth={2.2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      animationDuration={animationsEnabled ? 1100 : 0}
                    />
                    <Line
                      type="monotone"
                      dataKey="practiceMinutesIndex"
                      stroke={ADMIN_STATS_META.practiceMinutes.color}
                      strokeWidth={2.2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      animationDuration={animationsEnabled ? 1160 : 0}
                    />
                    <Line
                      type="monotone"
                      dataKey="chatbotTokensIndex"
                      stroke={ADMIN_STATS_META.chatbotTokens.color}
                      strokeWidth={2.2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      animationDuration={animationsEnabled ? 1220 : 0}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Balance premium"
                subtitle="Altas, bajas y saldo neto por mes"
                helpContent={{
                  title: "Como leer el balance premium",
                  description:
                    "Muestra el equilibrio mensual entre lo que entra a premium y lo que se pierde por cancelacion.",
                  points: [
                    "Las barras doradas son nuevas suscripciones premium creadas ese mes.",
                    "Las barras rojas son suscripciones premium canceladas ese mismo mes.",
                    "La linea teal es el saldo neto: nuevas suscripciones menos cancelaciones. Si queda arriba de cero, el premium cerro creciendo ese mes.",
                  ],
                  source:
                    "Fuente: /users/stats/admin. Campos usados: newSubscriptions, canceledSubscriptions y el derivado netSubscriptions = newSubscriptions - canceledSubscriptions.",
                }}
                badge={
                  lastPoint
                    ? `Neto ${formatAdminStatValue(lastPoint.netSubscriptions, "count")}`
                    : "Sin datos"
                }
                legend={
                  <>
                    <LegendPill
                      color={ADMIN_STATS_META.newSubscriptions.color}
                      label="Altas premium"
                    />
                    <LegendPill
                      color={ADMIN_STATS_META.canceledSubscriptions.color}
                      label="Bajas premium"
                    />
                    <LegendPill
                      color={ADMIN_STATS_ACCENT_COLORS.teal}
                      label="Saldo neto"
                    />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeline}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-secondary)"
                    />
                    <XAxis
                      dataKey="monthLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={axisPrimaryTick}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      tick={axisSecondaryTick}
                    />
                    <Tooltip content={<MetricTooltip title="Balance premium" />} />
                    <Bar
                      dataKey="newSubscriptions"
                      name="Altas premium"
                      fill={ADMIN_STATS_META.newSubscriptions.color}
                      radius={[10, 10, 0, 0]}
                      barSize={18}
                      animationDuration={animationsEnabled ? 900 : 0}
                    />
                    <Bar
                      dataKey="canceledSubscriptions"
                      name="Bajas premium"
                      fill={ADMIN_STATS_META.canceledSubscriptions.color}
                      radius={[10, 10, 0, 0]}
                      barSize={18}
                      animationDuration={animationsEnabled ? 1050 : 0}
                    />
                    <Line
                      type="monotone"
                      dataKey="netSubscriptions"
                      name="Saldo neto"
                      stroke={ADMIN_STATS_ACCENT_COLORS.teal}
                      strokeWidth={3}
                      dot={{ r: 4, fill: ADMIN_STATS_ACCENT_COLORS.teal }}
                      activeDot={{ r: 6 }}
                      animationDuration={animationsEnabled ? 1200 : 0}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={2}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <section className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="Adquisicion y conversion"
                subtitle="Entradas nuevas contra capacidad de convertir a premium"
                helpContent={{
                  title: "Como leer adquisicion y conversion",
                  description:
                    "Relaciona el volumen de nuevos usuarios con el porcentaje que logra convertirse a premium.",
                  points: [
                    "El area roja representa cuantos usuarios nuevos entraron a la plataforma cada mes.",
                    "La linea morada representa la conversion a premium, calculada como nuevas suscripciones dividido entre nuevos usuarios por 100.",
                    "Si suben usuarios pero cae la conversion, estas atrayendo mas gente pero convirtiendo peor. Si suben ambos, el crecimiento tiene mejor calidad.",
                  ],
                  source:
                    "Fuente: /users/stats/admin. Campos usados: newUsers y newSubscriptions. Derivado: subscriptionConversion = newSubscriptions / newUsers * 100.",
                }}
                badge={
                  lastPoint
                    ? `${formatAdminStatValue(lastPoint.subscriptionConversion, "percent")}`
                    : "Sin datos"
                }
                legend={
                  <>
                    <LegendPill
                      color={ADMIN_STATS_META.newUsers.color}
                      label="Nuevos usuarios"
                    />
                    <LegendPill
                      color={ADMIN_STATS_ACCENT_COLORS.deepPurple}
                      label="Conversion a premium"
                    />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeline}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-secondary)"
                    />
                    <XAxis
                      dataKey="monthLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={axisPrimaryTick}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      tick={axisSecondaryTick}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tick={axisSecondaryTick}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <Tooltip content={<MetricTooltip title="Adquisicion y conversion" />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="newUsers"
                      name="Nuevos usuarios"
                      stroke={ADMIN_STATS_META.newUsers.color}
                      fill={ADMIN_STATS_META.newUsers.color}
                      fillOpacity={0.12}
                      strokeWidth={2.6}
                      animationDuration={animationsEnabled ? 900 : 0}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="subscriptionConversion"
                      name="Conversion a premium"
                      stroke={ADMIN_STATS_ACCENT_COLORS.deepPurple}
                      strokeWidth={3}
                      dot={{ r: 4, fill: ADMIN_STATS_ACCENT_COLORS.deepPurple }}
                      activeDot={{ r: 6 }}
                      animationDuration={animationsEnabled ? 1100 : 0}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Motor de engagement"
                subtitle="Tiempo de practica y consumo del chatbot en una misma lectura"
                helpContent={{
                  title: "Como leer el motor de engagement",
                  description:
                    "Cruza dos senales de uso real del producto: tiempo de estudio y uso de la IA conversacional.",
                  points: [
                    "El area teal muestra los minutos de practica registrados por mes.",
                    "La linea azul acero muestra los tokens consumidos en el chatbot por mes.",
                    "Si ambas curvas suben juntas, hay mas actividad y apoyo de IA. Si una se dispara sola, puedes investigar si el uso esta desbalanceado.",
                  ],
                  source:
                    "Fuente: /users/stats/admin. Campos usados: practiceMinutes y chatbotTokens.",
                }}
                badge={
                  lastPoint
                    ? `${formatAdminStatValue(lastPoint.practiceMinutes, "minutes")} / ${formatAdminStatValue(lastPoint.chatbotTokens, "tokens")}`
                    : "Sin datos"
                }
                legend={
                  <>
                    <LegendPill
                      color={ADMIN_STATS_META.practiceMinutes.color}
                      label="Minutos de practica"
                    />
                    <LegendPill
                      color={ADMIN_STATS_META.chatbotTokens.color}
                      label="Tokens del chatbot"
                    />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeline}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-secondary)"
                    />
                    <XAxis
                      dataKey="monthLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={axisPrimaryTick}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      width={42}
                      tick={axisSecondaryTick}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tick={axisSecondaryTick}
                      tickFormatter={(value: number) => formatAdminStatValue(value, "tokens")}
                    />
                    <Tooltip content={<MetricTooltip title="Motor de engagement" />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="practiceMinutes"
                      name="Minutos de practica"
                      stroke={ADMIN_STATS_META.practiceMinutes.color}
                      fill={ADMIN_STATS_META.practiceMinutes.color}
                      fillOpacity={0.14}
                      strokeWidth={2.5}
                      animationDuration={animationsEnabled ? 900 : 0}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="chatbotTokens"
                      name="Tokens del chatbot"
                      stroke={ADMIN_STATS_META.chatbotTokens.color}
                      strokeWidth={2.8}
                      dot={{ r: 4, fill: ADMIN_STATS_META.chatbotTokens.color }}
                      activeDot={{ r: 6 }}
                      animationDuration={animationsEnabled ? 1100 : 0}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={3}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <section className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="Uso promocional"
                subtitle="Cupones canjeados con lectura de presion promocional sobre premium"
                helpContent={{
                  title: "Como leer el uso promocional",
                  description:
                    "Mide cuanto del movimiento premium esta apoyado en cupones y promociones.",
                  points: [
                    "La barra azul muestra cuantos cupones fueron canjeados por mes.",
                    "La linea dorada representa la presion promocional, calculada como cupones canjeados dividido entre nuevas suscripciones por 100.",
                    "Si la presion promocional sube demasiado, significa que una porcion mayor del crecimiento premium depende de descuentos o codigos.",
                  ],
                  source:
                    "Fuente: /users/stats/admin. Campos usados: couponsRedeemed y newSubscriptions. Derivado: couponPressure = couponsRedeemed / newSubscriptions * 100.",
                }}
                badge={
                  lastPoint
                    ? `${formatAdminStatValue(lastPoint.couponPressure, "percent")}`
                    : "Sin datos"
                }
                legend={
                  <>
                    <LegendPill
                      color={ADMIN_STATS_META.couponsRedeemed.color}
                      label="Cupones canjeados"
                    />
                    <LegendPill
                      color={ADMIN_STATS_ACCENT_COLORS.warmGold}
                      label="Presion promocional"
                    />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeline}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-secondary)"
                    />
                    <XAxis
                      dataKey="monthLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={axisPrimaryTick}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      tick={axisSecondaryTick}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      tick={axisSecondaryTick}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <Tooltip content={<MetricTooltip title="Uso promocional" />} />
                    <Bar
                      yAxisId="left"
                      dataKey="couponsRedeemed"
                      name="Cupones canjeados"
                      fill={ADMIN_STATS_META.couponsRedeemed.color}
                      radius={[10, 10, 0, 0]}
                      barSize={22}
                      animationDuration={animationsEnabled ? 900 : 0}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="couponPressure"
                      name="Presion promocional"
                      stroke={ADMIN_STATS_ACCENT_COLORS.warmGold}
                      strokeWidth={3}
                      dot={{ r: 4, fill: ADMIN_STATS_ACCENT_COLORS.warmGold }}
                      activeDot={{ r: 6 }}
                      animationDuration={animationsEnabled ? 1100 : 0}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Tension de churn"
                subtitle="Peso relativo de las cancelaciones sobre las altas premium"
                helpContent={{
                  title: "Como leer la tension de churn",
                  description:
                    "Expone la presion de cancelacion y la compara con la ganancia neta de premium para entender salud de retencion.",
                  points: [
                    "El area roja representa la presion de churn, calculada como cancelaciones dividido entre nuevas suscripciones por 100.",
                    "La linea teal vuelve a mostrar el saldo neto premium del mes.",
                    "Si la presion de churn sube y el saldo neto cae, la retencion esta debilitando el crecimiento premium aunque sigan entrando altas nuevas.",
                  ],
                  source:
                    "Fuente: /users/stats/admin. Campos usados: canceledSubscriptions y newSubscriptions. Derivados: cancellationPressure y netSubscriptions.",
                }}
                badge={
                  lastPoint
                    ? `${formatAdminStatValue(lastPoint.cancellationPressure, "percent")}`
                    : "Sin datos"
                }
                legend={
                  <>
                    <LegendPill
                      color={ADMIN_STATS_ACCENT_COLORS.emberRed}
                      label="Presion de churn"
                    />
                    <LegendPill
                      color={ADMIN_STATS_ACCENT_COLORS.teal}
                      label="Saldo neto"
                    />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeline}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-secondary)"
                    />
                    <XAxis
                      dataKey="monthLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={axisPrimaryTick}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      tick={axisSecondaryTick}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      tick={axisSecondaryTick}
                    />
                    <Tooltip content={<MetricTooltip title="Tension de churn" />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="cancellationPressure"
                      name="Presion de churn"
                      stroke={ADMIN_STATS_ACCENT_COLORS.emberRed}
                      fill={ADMIN_STATS_ACCENT_COLORS.emberRed}
                      fillOpacity={0.14}
                      strokeWidth={2.6}
                      animationDuration={animationsEnabled ? 900 : 0}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="netSubscriptions"
                      name="Saldo neto"
                      stroke={ADMIN_STATS_ACCENT_COLORS.teal}
                      strokeWidth={3}
                      dot={{ r: 4, fill: ADMIN_STATS_ACCENT_COLORS.teal }}
                      activeDot={{ r: 6 }}
                      animationDuration={animationsEnabled ? 1100 : 0}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>
          </AnimatedEntrance>

          {timeline.length > 0 ? (
            <AnimatedEntrance
              index={4}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Gauge className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-content-primary">
                        Conversion actual
                      </p>
                      <p className="text-xs text-content-tertiary">
                        Premium sobre nuevos usuarios
                      </p>
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-content-primary">
                    {formatAdminStatValue(lastPoint?.subscriptionConversion ?? 0, "percent")}
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-content-primary">
                        Cupones por alta
                      </p>
                      <p className="text-xs text-content-tertiary">
                        Sensibilidad del crecimiento a promociones
                      </p>
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-content-primary">
                    {formatAdminStatValue(lastPoint?.couponPressure ?? 0, "percent")}
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-content-primary">
                        Saldo neto premium
                      </p>
                      <p className="text-xs text-content-tertiary">
                        Balance del ultimo mes observado
                      </p>
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-content-primary">
                    {formatAdminStatValue(lastPoint?.netSubscriptions ?? 0, "count")}
                  </p>
                </div>
              </section>
            </AnimatedEntrance>
          ) : null}
        </div>
      )}
    </AdminDashboardShell>
  );
}
