// Side-view frame pieces shared by the fit and gear drawings (from v2's drawSide).
import type {ReactNode, Ref} from 'react';
import type {FramePoints} from '@/lib/frame';
import {add, f, len, mul, sub, type Vec} from '@/lib/vec';
import {NS, SP, SideLine} from './svg';

export function Ground({
  F,
  x0,
  x1,
  c,
}: {
  F: FramePoints;
  x0: number;
  x1: number;
  c: string;
}) {
  const y = f(-(F.g.drop - F.R));
  return (
    <line
      x1={x0}
      x2={x1}
      y1={y}
      y2={y}
      stroke={c}
      strokeWidth={1.2}
      strokeDasharray="6 5"
      vectorEffect={NS}
      opacity={0.7}
    />
  );
}

// Tyre, rim and hub, drawn about the wheel's own centre. Children are drawn in
// a group around that centre, under the hub, so rotating `spinRef` with a
// plain rotate() turns them with the wheel.
export function Wheel({
  center,
  R,
  rim,
  c,
  soft,
  fillOpacity = 0.35,
  spinRef,
  children,
}: {
  center: Vec;
  R: number;
  rim: number;
  c: string;
  soft: string;
  fillOpacity?: number;
  spinRef?: Ref<SVGGElement>;
  children?: ReactNode;
}) {
  return (
    <g transform={`translate(${f(center[0])} ${f(-center[1])})`}>
      <circle
        r={f(R)}
        fill={soft}
        fillOpacity={fillOpacity}
        stroke={c}
        strokeWidth={2.4}
        vectorEffect={NS}
      />
      <circle
        r={f(rim)}
        fill="none"
        stroke={c}
        strokeWidth={1}
        vectorEffect={NS}
        opacity={0.6}
      />
      {children && <g ref={spinRef}>{children}</g>}
      <circle r={12} fill={c} />
    </g>
  );
}

export function Fender({F, gap, c}: {F: FramePoints; gap: number; c: string}) {
  const r = F.R + gap;
  const a0 = (100 * Math.PI) / 180,
    a1 = (215 * Math.PI) / 180;
  const p0: Vec = [F.FA[0] + r * Math.cos(a0), F.FA[1] + r * Math.sin(a0)];
  const p1: Vec = [F.FA[0] + r * Math.cos(a1), F.FA[1] + r * Math.sin(a1)];
  return (
    <path
      d={`M${SP(p0)} A${f(r)} ${f(r)} 0 0 0 ${SP(p1)}`}
      fill="none"
      stroke={c}
      strokeWidth={1.6}
      vectorEffect={NS}
      strokeDasharray="2 3"
    />
  );
}

// Tubes, head tube and fork
export function Frame({F, c}: {F: FramePoints; c: string}) {
  const {g, T, B, ST, RA, FA, dn, seatDir} = F;
  const ts = Math.tan((g.tt * Math.PI) / 180);
  // where a top tube sloping at tt from the seat tube top meets the head tube
  const tj =
    (T[1] - ST[1] - (T[0] - ST[0]) * ts) / (Math.sin(F.h) + Math.cos(F.h) * ts);
  const TTf = add(T, mul(dn, Math.max(0, tj)));
  const DTf = add(T, mul(dn, g.ht - 22));
  const SSs = add(ST, mul(seatDir, -35));
  const crown = add(B, mul(dn, 14));
  const ctl = add(crown, mul(dn, len(sub(FA, crown)) * 0.8));
  return (
    <g>
      <SideLine a={[0, 0]} b={RA} c={c} w={3} />
      <SideLine a={SSs} b={RA} c={c} w={2.4} />
      <SideLine a={[0, 0]} b={ST} c={c} w={3.2} />
      <SideLine a={ST} b={TTf} c={c} w={3.2} />
      <SideLine a={[0, 0]} b={DTf} c={c} w={3.6} />
      <SideLine a={T} b={B} c={c} w={7} />
      <path
        d={`M${SP(crown)} Q${SP(ctl)} ${SP(FA)}`}
        fill="none"
        stroke={c}
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect={NS}
      />
    </g>
  );
}
