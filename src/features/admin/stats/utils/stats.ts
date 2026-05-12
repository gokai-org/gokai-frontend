import type {
  AdminMonthlyMetric,
  AdminStatSnapshot,
  AdminStatsResponse,
  AdminStatsSeriesKey,
  AdminStatsTimelinePoint,
} from "../types/stats";

type MetricKind = "count" | "minutes" | "tokens" | "percent";

interface AdminSeriesMeta {
  label: string;
  color: string;
  kind: MetricKind;
}

export const ADMIN_STATS_ACCENT_COLORS = {
  brandRed: "var(--accent)",
  royalBlue: "#4D78D6",
  deepPurple: "#7656D6",
  warmGold: "#C9922E",
  teal: "#2D8F85",
  steelBlue: "#3E6288",
  emberRed: "#C95A58",
} as const;

const monthShortFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
});

const monthLongFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

const compactFormatter = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("es-ES");

export const ADMIN_STATS_META: Record<AdminStatsSeriesKey, AdminSeriesMeta> = {
  newUsers: {
    label: "Nuevos usuarios",
    color: ADMIN_STATS_ACCENT_COLORS.brandRed,
    kind: "count",
  },
  newSubscriptions: {
    label: "Nuevas suscripciones",
    color: ADMIN_STATS_ACCENT_COLORS.warmGold,
    kind: "count",
  },
  canceledSubscriptions: {
    label: "Cancelaciones",
    color: ADMIN_STATS_ACCENT_COLORS.emberRed,
    kind: "count",
  },
  couponsRedeemed: {
    label: "Cupones canjeados",
    color: ADMIN_STATS_ACCENT_COLORS.royalBlue,
    kind: "count",
  },
  practiceMinutes: {
    label: "Minutos de practica",
    color: ADMIN_STATS_ACCENT_COLORS.teal,
    kind: "minutes",
  },
  chatbotTokens: {
    label: "Tokens del chatbot",
    color: ADMIN_STATS_ACCENT_COLORS.steelBlue,
    kind: "tokens",
  },
};

const seriesKeys = Object.keys(ADMIN_STATS_META) as AdminStatsSeriesKey[];

function parseMonth(month: string) {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return new Date(month);
  }

  return new Date(Date.UTC(year, monthIndex, 1));
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getMonthLabel(month: string) {
  return capitalize(monthShortFormatter.format(parseMonth(month)).replace(".", ""));
}

function getFullMonthLabel(month: string) {
  return capitalize(monthLongFormatter.format(parseMonth(month)));
}

function getMetricValue(series: AdminMonthlyMetric[], month: string) {
  return series.find((entry) => entry.month === month)?.value ?? 0;
}

function normalizeToIndex(value: number, maxValue: number) {
  if (maxValue <= 0) return 0;
  return Number(((value / maxValue) * 100).toFixed(1));
}

export function buildAdminStatsTimeline(
  stats: AdminStatsResponse | null,
): AdminStatsTimelinePoint[] {
  if (!stats) return [];

  const months = Array.from(
    new Set(seriesKeys.flatMap((key) => stats[key].map((entry) => entry.month))),
  ).sort((left, right) => left.localeCompare(right));

  const maxValues = seriesKeys.reduce<Record<AdminStatsSeriesKey, number>>(
    (acc, key) => {
      acc[key] = Math.max(0, ...stats[key].map((entry) => entry.value));
      return acc;
    },
    {
      newUsers: 0,
      newSubscriptions: 0,
      canceledSubscriptions: 0,
      couponsRedeemed: 0,
      practiceMinutes: 0,
      chatbotTokens: 0,
    },
  );

  return months.map((month) => {
    const newUsers = getMetricValue(stats.newUsers, month);
    const newSubscriptions = getMetricValue(stats.newSubscriptions, month);
    const canceledSubscriptions = getMetricValue(
      stats.canceledSubscriptions,
      month,
    );
    const couponsRedeemed = getMetricValue(stats.couponsRedeemed, month);
    const practiceMinutes = getMetricValue(stats.practiceMinutes, month);
    const chatbotTokens = getMetricValue(stats.chatbotTokens, month);

    const subscriptionConversion =
      newUsers > 0
        ? Number(((newSubscriptions / newUsers) * 100).toFixed(1))
        : 0;
    const cancellationPressure =
      newSubscriptions > 0
        ? Number(((canceledSubscriptions / newSubscriptions) * 100).toFixed(1))
        : 0;
    const couponPressure =
      newSubscriptions > 0
        ? Number(((couponsRedeemed / newSubscriptions) * 100).toFixed(1))
        : 0;

    return {
      month,
      monthLabel: getMonthLabel(month),
      fullMonthLabel: getFullMonthLabel(month),
      newUsers,
      newSubscriptions,
      canceledSubscriptions,
      couponsRedeemed,
      practiceMinutes,
      chatbotTokens,
      netSubscriptions: newSubscriptions - canceledSubscriptions,
      subscriptionConversion,
      cancellationPressure,
      couponPressure,
      newUsersIndex: normalizeToIndex(newUsers, maxValues.newUsers),
      newSubscriptionsIndex: normalizeToIndex(
        newSubscriptions,
        maxValues.newSubscriptions,
      ),
      canceledSubscriptionsIndex: normalizeToIndex(
        canceledSubscriptions,
        maxValues.canceledSubscriptions,
      ),
      couponsRedeemedIndex: normalizeToIndex(
        couponsRedeemed,
        maxValues.couponsRedeemed,
      ),
      practiceMinutesIndex: normalizeToIndex(
        practiceMinutes,
        maxValues.practiceMinutes,
      ),
      chatbotTokensIndex: normalizeToIndex(chatbotTokens, maxValues.chatbotTokens),
    };
  });
}

export function getAdminStatSnapshot(
  series: AdminMonthlyMetric[],
): AdminStatSnapshot {
  const current = series.at(-1)?.value ?? 0;
  const previous = series.length > 1 ? series.at(-2)?.value ?? 0 : null;
  const total = series.reduce((sum, entry) => sum + entry.value, 0);

  let trend: number | null = null;
  if (previous !== null && previous > 0) {
    trend = Math.round(((current - previous) / previous) * 100);
  }

  return {
    current,
    previous,
    total,
    trend,
  };
}

export function formatAdminStatValue(
  value: number,
  kind: MetricKind,
  compact = true,
) {
  if (kind === "percent") {
    return `${integerFormatter.format(Number(value.toFixed(1)))}%`;
  }

  if (kind === "minutes") {
    if (compact && value >= 120) {
      const hours = value / 60;
      return `${hours.toFixed(hours >= 10 ? 0 : 1)} h`;
    }

    return `${integerFormatter.format(value)} min`;
  }

  if (kind === "tokens") {
    return compact
      ? compactFormatter.format(value)
      : integerFormatter.format(value);
  }

  return compact ? compactFormatter.format(value) : integerFormatter.format(value);
}