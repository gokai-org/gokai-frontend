const BACKEND_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

type BackendDateFormat = "long" | "short";

const BACKEND_DATE_FORMATTERS: Record<BackendDateFormat, Intl.DateTimeFormat> = {
  long: new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  short: new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }),
};

function toUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

function getDatePrefix(value: string) {
  const match = value.trim().match(BACKEND_DATE_PREFIX);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
}

export function parseBackendCalendarDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return toUtcDate(
      value.getUTCFullYear(),
      value.getUTCMonth() + 1,
      value.getUTCDate(),
    );
  }

  if (typeof value === "string") {
    const prefix = getDatePrefix(value);
    if (prefix) {
      return toUtcDate(prefix.year, prefix.month, prefix.day);
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return toUtcDate(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth() + 1,
        parsed.getUTCDate(),
      );
    }
  }

  return null;
}

function toComparableDay(value: Date) {
  return value.getUTCFullYear() * 10000 + (value.getUTCMonth() + 1) * 100 + value.getUTCDate();
}

export function isBackendCalendarDateOnOrAfterToday(
  value: unknown,
  now: Date = new Date(),
) {
  const backendDate = parseBackendCalendarDate(value);
  if (!backendDate || Number.isNaN(now.getTime())) {
    return false;
  }

  const today = toUtcDate(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
  );

  return toComparableDay(backendDate) >= toComparableDay(today);
}

export function formatBackendCalendarDate(
  value: unknown,
  format: BackendDateFormat = "long",
) {
  const backendDate = parseBackendCalendarDate(value);
  if (!backendDate) {
    return null;
  }

  return BACKEND_DATE_FORMATTERS[format].format(backendDate);
}

export function toBackendCalendarInputDate(value: unknown) {
  const backendDate = parseBackendCalendarDate(value);
  if (!backendDate) {
    return "";
  }

  const year = backendDate.getUTCFullYear();
  const month = String(backendDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(backendDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}