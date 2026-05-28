export function getString(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function getInt(
  value: string | string[] | undefined,
  fallback: number
): number {
  const raw = getString(value, "");
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

