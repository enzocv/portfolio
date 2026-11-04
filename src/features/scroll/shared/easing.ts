/** Utilidades puras para interpolar valores a partir del progreso de scroll. */

export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

/** Progreso local (0 → 1) de `p` dentro del tramo [start, end]. */
export const segment = (p: number, start: number, end: number): number =>
  clamp((p - start) / (end - start));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const smoothstep = (start: number, end: number, t: number): number => {
  const x = clamp((t - start) / (end - start));
  return x * x * (3 - 2 * x);
};
