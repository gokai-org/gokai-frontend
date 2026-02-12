export function normalizeBearerToken(raw: string) {
  let t = raw.trim();

  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }

  if (t.toLowerCase().startsWith("bearer ")) {
    t = t.slice(7).trim();
  }

  const eqIndex = t.indexOf("=");
  if (eqIndex > 0 && (t.startsWith("token=") || t.startsWith("accessToken="))) {
    t = t.slice(eqIndex + 1).trim();
  }

  return t;
}