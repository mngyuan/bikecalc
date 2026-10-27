import type {SVGProps} from 'react';
import {f, type Vec} from '@/lib/vec';

// Side view flips y so bike-up is screen-up; top view uses lateral as svg y.
export const SP = (p: Vec) => `${f(p[0])},${f(-p[1])}`;
export const TP = (p: Vec) => `${f(p[0])},${f(p[1])}`;
export const NS = 'non-scaling-stroke';

type LineProps = {a: Vec; b: Vec; c: string; w?: number} & Omit<
  SVGProps<SVGLineElement>,
  'stroke'
>;

export function SideLine({a, b, c, w = 2.4, ...rest}: LineProps) {
  return (
    <line
      x1={f(a[0])}
      y1={f(-a[1])}
      x2={f(b[0])}
      y2={f(-b[1])}
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
      vectorEffect={NS}
      {...rest}
    />
  );
}

export function TopLine({a, b, c, w = 2.4, ...rest}: LineProps) {
  return (
    <line
      x1={f(a[0])}
      y1={f(a[1])}
      x2={f(b[0])}
      y2={f(b[1])}
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
      vectorEffect={NS}
      {...rest}
    />
  );
}

export const polyPoints = (pts: Vec[], P: (p: Vec) => string) =>
  pts.map(P).join(' ');
