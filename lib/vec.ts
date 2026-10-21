// 2D helpers for the drawings. Bike coordinates are mm with the bottom
// bracket at the origin, x forward and y up.

export type Vec = readonly [number, number];

export const rad = (d: number) => (d * Math.PI) / 180;
export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
export const len = (a: Vec) => Math.hypot(a[0], a[1]);

// rotate p about c by th radians
export const rot = (p: Vec, c: Vec, th: number): Vec => {
  const s = Math.sin(th),
    co = Math.cos(th),
    x = p[0] - c[0],
    y = p[1] - c[1];
  return [c[0] + x * co - y * s, c[1] + x * s + y * co];
};

// round to 0.1 mm for SVG output
export const f = (n: number) => Math.round(n * 10) / 10;

// signed, rounded readout: +12, −3, ±0
export const sgn = (n: number) => {
  const r = Math.round(n);
  return (r > 0 ? '+' : r < 0 ? '−' : '±') + Math.abs(r);
};
