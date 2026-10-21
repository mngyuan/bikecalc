// Fit geometry solver, ported from Fit Visualizer v2. Bike coordinates are
// mm with the bottom bracket at the origin, x forward, y up.
import {solveFrame, type FramePoints} from '../frame';
import {add, mul, rad, rot, type Vec} from '../vec';
import {type FitBikeID, frameSize, geometryOf} from './bikes';
import type {BikeSettings, FitSettings} from './state';

export interface Solved extends FramePoints {
  id: FitBikeID;
  s: BikeSettings;
  base: number; // stem base, mm up the steering axis from the head tube top
  K: Vec; // bar clamp centre
  stemTop: number;
  above: number; // spacers above a standard stem (negative: steerer too short)
  insert: number | null; // steerer inside a gooseneck
  hand: Vec;
  handW: number;
  back: number; // riser backsweep pull
  A: Vec; // saddle clamp along the seat tube
  N: Vec; // saddle nose
  sH: number;
  sO: number;
  P: Vec; // pedal spindle, crank level and forward
  toeX: number;
  spindle: number; // tyre to pedal spindle, straight ahead
  clear: number; // toe clearance, straight ahead
  pivot: Vec; // steering axis at toe height
  yT: number; // height toe clearance is measured at
  half: (y: number) => number; // half chord of the front tyre at height y
  warns: string[];
  matched: boolean;
  bbH: number;
  ring: number;
  staged: boolean;
}

export const isMatched = (
  saved: FitSettings,
  id: FitBikeID,
  st: BikeSettings = saved.bike[id],
) => {
  const m = st.matchTo;
  return !!m && m !== id && saved.bikes.includes(m);
};

// Saddle nose of a saved bike, following saddle matches up to four deep.
export function noseOf(saved: FitSettings, id: FitBikeID, depth = 0): Vec {
  const s = saved.bike[id];
  if (isMatched(saved, id) && depth < 4 && s.matchTo) {
    return noseOf(saved, s.matchTo, depth + 1);
  }
  const g = frameSize(id, s.size),
    sa = rad(g.sta);
  const A = mul([-Math.cos(sa), Math.sin(sa)], s.sH);
  return [A[0] - s.sO + s.sN, A[1]];
}

export function solve(
  saved: FitSettings,
  id: FitBikeID,
  st: BikeSettings = saved.bike[id],
  staged = false,
): Solved {
  const s = st,
    g = frameSize(id, s.size);
  const F = solveFrame(g, g.bsd / 2 + s.tyreW);
  const {h, fw, T, FA, R, ax, seatDir} = F;
  const sa = rad(g.sta);
  const warns: string[] = [];

  // cockpit
  let base = s.hs + s.below,
    K: Vec,
    stemTop: number,
    above = 0,
    insert: number | null = null;
  if (s.stemType === 'std') {
    const a = rad(s.ang);
    K = add(ax(base + s.stack / 2 + s.len * Math.sin(a)), mul(fw, s.len * Math.cos(a)));
    stemTop = base + s.stack;
    above = s.steerLen - s.below - s.stack;
    if (above < -0.5) warns.push(`needs ${Math.round(-above)} mm more steerer`);
  } else {
    insert = s.steerLen - s.below;
    if (insert > s.gMax) {
      warns.push(`steerer ${Math.round(insert - s.gMax)} mm too long for this stem`);
      base = s.hs + s.steerLen - s.gMax;
      insert = s.gMax;
    }
    if (insert < s.gMin - 0.5) warns.push(`only ${Math.round(insert)} mm in stem (min ${s.gMin})`);
    K = add(ax(base + s.gH), mul(fw, s.gE));
    stemTop = base + s.gH;
  }

  // hands
  let hand: Vec,
    handW: number,
    back = 0;
  if (s.barType === 'drop') {
    hand = add(K, [s.dReach + s.hoodExt, s.hoodUp]);
    handW = s.dW;
  } else {
    back = Math.max(0, s.rW / 2 - s.rInboard - 110) * Math.tan(rad(s.rSweep));
    hand = add(K, [-back, s.rRise]);
    handW = s.rW - 2 * s.rInboard;
  }

  // saddle
  let sH = s.sH,
    sO = s.sO;
  const matched = isMatched(saved, id, s);
  if (matched && s.matchTo) {
    const n = noseOf(saved, s.matchTo, 1);
    sH = n[1] / Math.sin(sa);
    sO = mul(seatDir, sH)[0] + s.sN - n[0];
  }
  const A = mul(seatDir, sH);
  const N: Vec = [A[0] - sO + s.sN, A[1]];

  // feet / toe
  const yT = 25,
    P: Vec = [s.crank, 0],
    toeX = P[0] + s.toe;
  const half = (y: number) => Math.sqrt(Math.max(0, R * R - (FA[1] - y) ** 2));
  const spindle = FA[0] - half(0) - s.crank;
  const edge = FA[0] - half(yT) - s.fender;
  const clear = edge - toeX;
  const pivot: Vec = [T[0] + ((g.stack - yT) / Math.sin(h)) * Math.cos(h), 0];

  return {
    ...F,
    id,
    s,
    base,
    K,
    stemTop,
    above,
    insert,
    hand,
    handW,
    back,
    A,
    N,
    sH,
    sO,
    P,
    toeX,
    spindle,
    clear,
    pivot,
    yT,
    half,
    warns,
    matched,
    bbH: R - g.drop,
    ring: geometryOf(id).ring,
    staged,
  };
}

/* ---------- toe strike (top view, at toe height) ---------- */

export function tyrePoly(G: Solved, steerDeg: number): Vec[] {
  const c = G.half(G.yT),
    hw = G.s.tyreW / 2 + (G.s.fender > 0 ? 10 : 0),
    x0 = G.FA[0] - c - G.s.fender,
    x1 = G.FA[0] + c;
  const pts: Vec[] = [
    [x0, -hw],
    [x1, -hw],
    [x1, hw],
    [x0, hw],
  ];
  return pts.map((p) => rot(p, G.pivot, rad(steerDeg)));
}

export function footPoly(G: Solved, side: 1 | -1): Vec[] {
  const lf = side * (G.s.q / 2 + 55),
    x1 = G.toeX,
    x0 = x1 - 270;
  return [
    [x0, lf - 52],
    [x1 - 18, lf - 52],
    [x1, lf - 30],
    [x1, lf + 30],
    [x1 - 18, lf + 52],
    [x0, lf + 52],
  ];
}

// separating axis test for convex polygons
export function sat(a: Vec[], b: Vec[]): boolean {
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length],
        n = [q[1] - p[1], p[0] - q[0]];
      let a0 = Infinity,
        a1 = -Infinity,
        b0 = Infinity,
        b1 = -Infinity;
      for (const v of a) {
        const d = v[0] * n[0] + v[1] * n[1];
        a0 = Math.min(a0, d);
        a1 = Math.max(a1, d);
      }
      for (const v of b) {
        const d = v[0] * n[0] + v[1] * n[1];
        b0 = Math.min(b0, d);
        b1 = Math.max(b1, d);
      }
      if (a1 < b0 || b1 < a0) return false;
    }
  }
  return true;
}

export function strikeAngle(G: Solved): number | null {
  for (let th = 0; th <= 60; th += 0.5) {
    const ty = tyrePoly(G, th);
    if (sat(ty, footPoly(G, 1)) || sat(ty, footPoly(G, -1))) return th;
  }
  return null;
}

/* drop section: flare widens the bar from hoods to the lower bend (front view);
   outsweep / flare-out kicks the drop extensions outward (top view) */
export function dropEnds(s: BikeSettings) {
  const W = s.dW / 2,
    ext = 110,
    bendW = W + s.dDrop * Math.tan(rad(s.dFlare)),
    o = rad(s.dOut || 0);
  const bendX = s.dReach - 50;
  return {bendW, bendX, endW: bendW + ext * Math.sin(o), endX: bendX - ext * Math.cos(o)};
}

// extra forward reach from hands at width wB vs wA, for a straight arm
export function widthGain(saved: FitSettings, wA: number, wB: number) {
  const a = saved.arm,
    sh = saved.shoulder / 2;
  const d = (w: number) => Math.sqrt(Math.max(0, a * a - (w / 2 - sh) ** 2));
  return d(wB) - d(wA);
}
