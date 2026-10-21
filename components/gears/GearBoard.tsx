// Side view for the gear calculator: frame, wheels and drivetrain to scale on
// the drafting board, with the chain on the selected gear. Cranks turn at the
// cadence and wheels at cadence × gear ratio (both clockwise: the bike faces right).
import {type Ref, useEffect, useRef, useState, useSyncExternalStore} from 'react';
import {Board, Grid} from '@/components/board/Board';
import {Frame, Ground} from '@/components/board/BikeParts';
import {NS, SP} from '@/components/board/svg';
import type {FrameSize} from '@/lib/data';
import {solveFrame} from '@/lib/frame';
import {CRANK_LENGTH_MM, type GearConfig, type GearSel, gearRatio, hubRatios, pitchRadius} from '@/lib/gears';
import {add, f, len, mul, sub, type Vec} from '@/lib/vec';

const X0 = -840,
  X1 = 1020,
  Y0 = -335,
  Y1 = 640;
const FRAME = 'var(--frame)',
  FRAME_SOFT = 'var(--frame-soft)',
  DRIVE = 'var(--drive)';
const HUB_SHELL_R = 46;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const subscribeReducedMotion = (cb: () => void) => {
  const m = matchMedia(REDUCED_MOTION);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, () => matchMedia(REDUCED_MOTION).matches, () => false);
}

export function GearBoard({
  cfg,
  sel,
  frame,
  cadence,
  onCadence,
}: {
  cfg: GearConfig;
  sel: GearSel;
  frame: FrameSize;
  cadence: number;
  onCadence: (v: number) => void;
}) {
  const R = cfg.bsd / 2 + cfg.width;
  const F = solveFrame(frame, R);
  const ratio = gearRatio(cfg, sel);

  const reduced = usePrefersReducedMotion();
  const [userPlay, setUserPlay] = useState<boolean | null>(null);
  const playing = userPlay ?? !reduced;

  const crank = useRef<SVGGElement>(null),
    pedalA = useRef<SVGGElement>(null),
    pedalB = useRef<SVGGElement>(null),
    rear = useRef<SVGGElement>(null),
    front = useRef<SVGGElement>(null);
  const angle = useRef({crank: 0, wheel: 0});

  useEffect(() => {
    if (!playing || !Number.isFinite(ratio)) return;
    let raf = 0,
      last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const step = (cadence / 60) * 360 * dt;
      const a = angle.current;
      a.crank = (a.crank + step) % 360;
      a.wheel = (a.wheel + step * ratio) % 360;
      crank.current?.setAttribute('transform', `rotate(${a.crank})`);
      pedalA.current?.setAttribute('transform', `rotate(${-a.crank})`);
      pedalB.current?.setAttribute('transform', `rotate(${-a.crank})`);
      rear.current?.setAttribute('transform', `rotate(${a.wheel})`);
      front.current?.setAttribute('transform', `rotate(${a.wheel})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, cadence, ratio]);

  const ringTeeth = cfg.chainrings[sel.ring],
    cogTeeth = cfg.sprockets[sel.sprocket];
  const hub = hubRatios(cfg);
  const r1 = ringTeeth > 0 ? pitchRadius(ringTeeth) : 0,
    r2 = cogTeeth > 0 ? pitchRadius(cogTeeth) : 0;
  const chain = r1 && r2 ? chainLoop([0, 0], r1, F.RA, r2) : null;

  return (
    <Board
      tag="Side"
      label="Side view of the bike with the chain on the selected gear"
      viewBox={[X0, -Y1, X1 - X0, Y1 - Y0]}
      overlay={
        <div className="overlay">
          <label htmlFor="cadence">
            Cadence <span className="num">{cadence} rpm</span>
          </label>
          <input type="range" id="cadence" min={40} max={130} step={1} value={cadence} onChange={(e) => onCadence(+e.target.value)} />
          <button type="button" onClick={() => setUserPlay(!playing)}>
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>
      }
    >
      {(scale) => {
        const fs = 10.5 / scale;
        return (
          <>
            <Grid x0={X0} x1={X1} y0={Y0} y1={Y1} flip scale={scale} />
            <Ground F={F} x0={X0} x1={X1} c={FRAME} />
            <SpinWheel center={F.RA} R={R} rim={cfg.bsd / 2} spin={rear} />
            <SpinWheel center={F.FA} R={R} rim={cfg.bsd / 2} spin={front} />
            <Frame F={F} c={FRAME} />

            {/* hub, sprockets */}
            {hub && (
              <circle cx={f(F.RA[0])} cy={f(-F.RA[1])} r={HUB_SHELL_R} fill="var(--board)" stroke={FRAME} strokeWidth={1.2} vectorEffect={NS} />
            )}
            {cfg.sprockets.map((t, i) =>
              t > 0 ? (
                <circle
                  key={i}
                  cx={f(F.RA[0])}
                  cy={f(-F.RA[1])}
                  r={f(pitchRadius(t))}
                  fill="none"
                  stroke={i === sel.sprocket ? DRIVE : FRAME}
                  strokeWidth={i === sel.sprocket ? 2.2 : 0.9}
                  opacity={i === sel.sprocket ? 1 : 0.55}
                  vectorEffect={NS}
                />
              ) : null,
            )}
            {/* chainrings */}
            {cfg.chainrings.map((t, i) =>
              t > 0 ? (
                <circle
                  key={i}
                  cx={0}
                  cy={0}
                  r={f(pitchRadius(t))}
                  fill="none"
                  stroke={i === sel.ring ? DRIVE : FRAME}
                  strokeWidth={i === sel.ring ? 2.2 : 1}
                  opacity={i === sel.ring ? 1 : 0.55}
                  vectorEffect={NS}
                />
              ) : null,
            )}
            {chain && (
              <path d={`M${chain.map(SP).join(' L')} Z`} fill="none" stroke={DRIVE} strokeWidth={2.4} strokeLinejoin="round" vectorEffect={NS} />
            )}

            <Crank crank={crank} pedalA={pedalA} pedalB={pedalB} />

            {/* labels */}
            <g className="glabel" fontSize={fs} textAnchor="middle">
              {r1 > 0 && (
                <text x={0} y={f(-r1 - 6 / scale)}>
                  {ringTeeth}T
                </text>
              )}
              {r2 > 0 && (
                <text x={f(F.RA[0])} y={f(-F.RA[1] - Math.max(r2, hub ? HUB_SHELL_R : 0) - 6 / scale)}>
                  {cogTeeth}T{hub ? ` · hub gear ${sel.hub + 1} ×${hub[sel.hub].toFixed(2)}` : ''}
                </text>
              )}
              <text x={f(F.FA[0])} y={f(-(F.FA[1] + R) - 6 / scale)}>
                Ø {Math.round(2 * R)} mm
              </text>
            </g>
          </>
        );
      }}
    </Board>
  );
}

// Wheel drawn about its own centre so the inner group only needs rotate().
function SpinWheel({center, R, rim, spin}: {center: Vec; R: number; rim: number; spin: Ref<SVGGElement>}) {
  return (
    <g transform={`translate(${f(center[0])} ${f(-center[1])})`}>
      <circle r={f(R)} fill={FRAME_SOFT} stroke={FRAME} strokeWidth={2.4} vectorEffect={NS} />
      <circle r={f(rim)} fill="none" stroke={FRAME} strokeWidth={1} vectorEffect={NS} opacity={0.6} />
      <g ref={spin}>
        {/* valve and one spoke so the turning is visible */}
        <line x1={0} y1={0} x2={0} y2={f(-rim)} stroke={FRAME} strokeWidth={1} vectorEffect={NS} opacity={0.5} />
        <line x1={0} y1={f(-rim + 4)} x2={0} y2={f(-rim + 26)} stroke={FRAME} strokeWidth={4} strokeLinecap="round" vectorEffect={NS} />
      </g>
      <circle r={12} fill={FRAME} />
    </g>
  );
}

function Crank({crank, pedalA, pedalB}: {crank: Ref<SVGGElement>; pedalA: Ref<SVGGElement>; pedalB: Ref<SVGGElement>}) {
  const L = CRANK_LENGTH_MM;
  const pedal = (
    <rect x={-45} y={-9} width={90} height={18} rx={5} fill="var(--board)" stroke="var(--ink)" strokeWidth={1.8} vectorEffect={NS} />
  );
  return (
    <g ref={crank}>
      {/* far arm, behind */}
      <line x1={0} y1={0} x2={-L} y2={0} stroke="var(--ink)" strokeWidth={4} strokeLinecap="round" vectorEffect={NS} opacity={0.3} />
      <g transform={`translate(${-L} 0)`} opacity={0.35}>
        <g ref={pedalB}>{pedal}</g>
      </g>
      <line x1={0} y1={0} x2={L} y2={0} stroke="var(--ink)" strokeWidth={5} strokeLinecap="round" vectorEffect={NS} />
      <g transform={`translate(${L} 0)`}>
        <g ref={pedalA}>{pedal}</g>
      </g>
      <circle r={20} fill="var(--board)" stroke="var(--ink)" strokeWidth={2} vectorEffect={NS} />
    </g>
  );
}

/* chain: external tangents between ring and sprocket, wrapped round the far side of each */

const TAU = 2 * Math.PI;
const norm = (x: number) => ((x % TAU) + TAU) % TAU;

// points on a circle from angle a0 to a1, going the way that passes through `via`
function arc(c: Vec, r: number, a0: number, a1: number, via: number, n = 32): Vec[] {
  const ccw = norm(a1 - a0);
  const sweep = norm(via - a0) < ccw ? ccw : ccw - TAU;
  return Array.from({length: n + 1}, (_, i) => {
    const a = a0 + (sweep * i) / n;
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)] as Vec;
  });
}

export function chainLoop(c1: Vec, r1: number, c2: Vec, r2: number): Vec[] | null {
  const d = len(sub(c2, c1));
  if (d <= Math.abs(r1 - r2)) return null;
  const u = mul(sub(c2, c1), 1 / d);
  const base = Math.atan2(u[1], u[0]);
  const phi = Math.acos((r1 - r2) / d);
  // the two outer tangents share their normal on both circles; take the upper first
  const [aU, aD] = Math.sin(base + phi) > Math.sin(base - phi) ? [base + phi, base - phi] : [base - phi, base + phi];
  const top = add(c1, mul([Math.cos(aU), Math.sin(aU)], r1));
  return [top, ...arc(c2, r2, aU, aD, base), ...arc(c1, r1, aD, aU, base + Math.PI)];
}
