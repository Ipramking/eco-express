/**
 * Money helpers. All internal amounts are integer kobo. Formatting happens only
 * at the edge (UI / SDK boundary), never inside the scoring math.
 */

export const NAIRA = 100; // kobo per naira

export function naira(kobo: number): string {
  const n = Math.round(kobo / NAIRA);
  return "₦" + n.toLocaleString("en-NG");
}

export function nairaExact(kobo: number): string {
  const n = kobo / NAIRA;
  return (
    "₦" +
    n.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Percentile over a numeric array (linear interpolation). */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function median(values: number[]): number {
  return percentile(values, 0.5);
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Coefficient of variation: stddev / mean. Lower = more predictable. */
export function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  if (m === 0) return 0;
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance) / m;
}

export function daysBetween(a: string, b: string): number {
  return Math.abs(
    (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24)
  );
}

/** Clamp a number into [min, max]. */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
