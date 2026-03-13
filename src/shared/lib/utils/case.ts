export function toCamelCase(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(toCamelCase);
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
        toCamelCase(value),
      ]),
    );
  }

  return input;
}
