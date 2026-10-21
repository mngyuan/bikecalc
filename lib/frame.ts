import type {FrameSize} from './data';
import {add, mul, rad, type Vec} from './vec';

// Key points of a frame, shared by the fit and gear drawings.
// R is the outer wheel radius (rim bead seat / 2 + tyre height).
export interface FramePoints {
  g: FrameSize;
  h: number; // head angle, radians
  up: Vec; // unit vector up the steering axis
  dn: Vec; // unit vector down the steering axis
  fw: Vec; // unit vector perpendicular to the steering axis, forward
  T: Vec; // top of the head tube (stack, reach)
  B: Vec; // bottom of the head tube
  R: number;
  FA: Vec; // front axle
  RA: Vec; // rear axle
  ax: (a: number) => Vec; // point a mm above T along the steering axis
  seatDir: Vec; // unit vector up the seat tube
  ST: Vec; // top of the seat tube
}

export function solveFrame(g: FrameSize, R: number): FramePoints {
  const h = rad(g.hta),
    sa = rad(g.sta);
  const up: Vec = [-Math.cos(h), Math.sin(h)];
  const dn: Vec = [Math.cos(h), -Math.sin(h)];
  const fw: Vec = [Math.sin(h), Math.cos(h)];
  const T: Vec = [g.reach, g.stack];
  const B = add(T, mul(dn, g.ht));
  // distance down the steering axis to where the offset fork meets axle height
  const t = (g.stack + g.off * Math.cos(h) - g.drop) / Math.sin(h);
  const FA = add(add(T, mul(dn, t)), mul(fw, g.off));
  const RA: Vec = [-g.cs, g.drop];
  const seatDir: Vec = [-Math.cos(sa), Math.sin(sa)];
  return {
    g,
    h,
    up,
    dn,
    fw,
    T,
    B,
    R,
    FA,
    RA,
    ax: (a) => add(T, mul(up, a)),
    seatDir,
    ST: mul(seatDir, g.st),
  };
}
