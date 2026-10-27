// Side and top boards for the fit visualizer, ported from v2's drawSide/drawTop.
import {BBMarker, Board, Grid} from '@/components/board/Board';
import {Fender, Frame, Ground, Wheel} from '@/components/board/BikeParts';
import {
  NS,
  SP,
  SideLine,
  TP,
  TopLine,
  polyPoints,
} from '@/components/board/svg';
import type {BikeColor} from '@/lib/fit/bikes';
import {dropEnds, footPoly, sat, type Solved, tyrePoly} from '@/lib/fit/solve';
import {add, f, mul, rad, sub, type Vec} from '@/lib/vec';

const X0 = -840,
  X1 = 1020;
const SIDE = {y0: -335, y1: 880};
const TOP = {y: 420};

export interface Drawn {
  G: Solved;
  color: BikeColor;
}

// rectangle of width w centred on the steering axis, a0..a1 mm above the head tube
function axRect(G: Solved, a0: number, a1: number, w: number): Vec[] {
  const n = mul(G.fw, w / 2),
    c0 = G.ax(a0),
    c1 = G.ax(a1);
  return [add(c0, n), add(c1, n), sub(c1, n), sub(c0, n)];
}

function BikeSide({G, color}: Drawn) {
  const {c, soft} = color;
  const s = G.s,
    K = G.K;
  const R_ = (dx: number, dy: number) => SP([K[0] + dx, K[1] + dy]);
  const tx = G.toeX,
    sole = 12;
  const nx = G.N[0],
    y = G.N[1];
  const D = dropEnds(s);
  const spacerTicks: number[] = [];
  for (let a = s.hs + 5; a < G.base; a += 5) spacerTicks.push(a);
  const Ab = add(G.A, mul(G.seatDir, -42)),
    SC: Vec = [G.A[0] - G.sO, G.A[1] - 42];

  return (
    <g opacity={0.9}>
      <Ground F={G} x0={X0} x1={X1} c={c} />
      {[G.RA, G.FA].map((ctr, i) => (
        <Wheel
          key={i}
          center={ctr}
          R={G.R}
          rim={G.g.bsd / 2}
          c={c}
          soft={soft}
        />
      ))}
      {s.fender > 0 && <Fender F={G} gap={s.fender} c={c} />}
      <Frame F={G} c={c} />

      {/* drivetrain + foot */}
      <circle
        cx={0}
        cy={0}
        r={G.ring}
        fill="none"
        stroke={c}
        strokeWidth={1.4}
        vectorEffect={NS}
        opacity={0.7}
      />
      <SideLine a={[0, 0]} b={G.P} c={c} w={4} />
      <path
        d={`M${SP([tx - 270, sole + 6])} L${SP([tx - 35, sole])} Q${SP([tx, sole])} ${SP([tx, sole + 28])} Q${SP([tx - 10, sole + 58])} ${SP([tx - 80, sole + 70])} L${SP([tx - 230, sole + 92])} Q${SP([tx - 270, sole + 92])} ${SP([tx - 272, sole + 50])} Z`}
        fill={soft}
        stroke={c}
        strokeWidth={1.6}
        vectorEffect={NS}
      />
      <circle
        cx={f(G.P[0])}
        cy={0}
        r={9}
        fill="var(--panel)"
        stroke={c}
        strokeWidth={2}
        vectorEffect={NS}
      />

      {/* headset, spacers, steerer */}
      <polygon
        points={polyPoints(axRect(G, 0, s.hs, 46), SP)}
        fill={soft}
        stroke={c}
        strokeWidth={1.2}
        vectorEffect={NS}
      />
      {G.base - s.hs > 0 && (
        <polygon
          points={polyPoints(axRect(G, s.hs, G.base, 36), SP)}
          fill={soft}
          stroke={c}
          strokeWidth={1.2}
          vectorEffect={NS}
        />
      )}
      {spacerTicks.map((a) => (
        <SideLine
          key={a}
          a={add(G.ax(a), mul(G.fw, -18))}
          b={add(G.ax(a), mul(G.fw, 18))}
          c={c}
          w={0.6}
          opacity={0.45}
        />
      ))}
      {s.stemType === 'std' ? (
        <>
          <polygon
            points={polyPoints(axRect(G, G.base, G.stemTop, 40), SP)}
            fill="var(--board)"
            stroke={c}
            strokeWidth={2}
            vectorEffect={NS}
          />
          {G.above > 0.5 && (
            <polygon
              points={polyPoints(
                axRect(G, G.stemTop, G.stemTop + G.above, 36),
                SP,
              )}
              fill={soft}
              stroke={c}
              strokeWidth={1.2}
              vectorEffect={NS}
            />
          )}
          <SideLine a={G.ax(G.base + s.stack / 2)} b={K} c={c} w={7} />
          {G.above < -0.5 && (
            <SideLine
              a={G.ax(s.hs + s.steerLen)}
              b={G.ax(G.stemTop)}
              c="var(--warn)"
              w={3}
              strokeDasharray="3 3"
            />
          )}
        </>
      ) : (
        <path
          d={`M${SP(G.ax(G.base))} L${SP(G.ax(G.base + s.gH * 0.62))} Q${SP(G.ax(G.base + s.gH))} ${SP(K)}`}
          fill="none"
          stroke={c}
          strokeWidth={7}
          strokeLinecap="round"
          vectorEffect={NS}
        />
      )}
      <circle
        cx={f(K[0])}
        cy={f(-K[1])}
        r={17}
        fill="var(--board)"
        stroke={c}
        strokeWidth={2}
        vectorEffect={NS}
      />

      {/* bars */}
      {s.barType === 'drop' ? (
        <>
          <path
            d={`M${R_(0, 0)} L${R_(s.dReach - 35, 0)} C${R_(s.dReach + 6, 0)} ${R_(s.dReach + 15, -s.dDrop * 0.3)} ${R_(s.dReach + 8, -s.dDrop * 0.55)} C${R_(s.dReach + 2, -s.dDrop * 0.85)} ${R_(D.bendX + 15, -s.dDrop)} ${R_(D.bendX, -s.dDrop)} L${R_(D.endX, -s.dDrop - 4)}`}
            fill="none"
            stroke={c}
            strokeWidth={3.2}
            strokeLinecap="round"
            vectorEffect={NS}
          />
          <path
            d={`M${R_(s.dReach - 24, 4)} L${R_(s.dReach + s.hoodExt, s.hoodUp)}`}
            stroke={c}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={0.55}
            vectorEffect={NS}
          />
          <path
            d={`M${R_(s.dReach + s.hoodExt - 4, s.hoodUp - 6)} Q${R_(s.dReach + 18, -s.dDrop * 0.25)} ${R_(s.dReach + 4, -s.dDrop * 0.66)}`}
            fill="none"
            stroke={c}
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect={NS}
          />
        </>
      ) : (
        <>
          <path
            d={`M${R_(0, 0)} C${R_(0, s.rRise * 0.6)} ${R_(-G.back * 0.4, s.rRise)} ${SP(G.hand)}`}
            fill="none"
            stroke={c}
            strokeWidth={3.2}
            strokeLinecap="round"
            vectorEffect={NS}
          />
          <ellipse
            cx={f(G.hand[0] - 12)}
            cy={f(-G.hand[1] + 4)}
            rx={42}
            ry={20}
            fill={soft}
            stroke={c}
            strokeWidth={1.6}
            vectorEffect={NS}
          />
        </>
      )}

      {/* seatpost + saddle */}
      <path
        d={`M${SP(add(G.ST, mul(G.seatDir, -60)))} L${SP(Ab)} L${SP(SC)}`}
        fill="none"
        stroke={c}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect={NS}
      />
      <path
        d={`M${SP([nx - 268, y + 6])} Q${SP([nx - 200, y - 8])} ${SP([nx - 120, y - 4])} L${SP([nx - 10, y - 4])} Q${SP([nx + 4, y - 6])} ${SP([nx - 4, y - 20])} L${SP([nx - 120, y - 30])} Q${SP([nx - 230, y - 36])} ${SP([nx - 266, y - 18])} Z`}
        fill={soft}
        stroke={c}
        strokeWidth={1.8}
        vectorEffect={NS}
      />

      {/* contact markers */}
      <circle
        cx={f(G.hand[0])}
        cy={f(-G.hand[1])}
        r={11}
        fill={c}
        stroke="var(--board)"
        strokeWidth={2}
        vectorEffect={NS}
      />
      <path d={`M${SP([nx, y])} l-12,-14 l24,0 z`} fill={c} />
    </g>
  );
}

function BikeTop({G, color, steer}: Drawn & {steer: number}) {
  const {c, soft} = color;
  const s = G.s,
    K = G.K,
    rr = G.R;
  const ty = tyrePoly(G, steer);
  const sx = G.ax(
    G.base + (s.stemType === 'std' ? s.stack / 2 : s.gH * 0.6),
  )[0];
  const kx = K[0];
  const nx = G.N[0];
  return (
    <g opacity={0.9}>
      <rect
        x={f(G.RA[0] - rr)}
        y={f(-s.tyreW / 2)}
        width={f(2 * rr)}
        height={f(s.tyreW)}
        rx={f(s.tyreW / 2)}
        fill={soft}
        stroke={c}
        strokeWidth={2}
        vectorEffect={NS}
      />
      <TopLine a={[0, -38]} b={[G.RA[0], -64]} c={c} w={2} />
      <TopLine a={[0, 38]} b={[G.RA[0], 64]} c={c} w={2} />
      <rect
        x={f(G.ST[0])}
        y={-14}
        width={f(G.T[0] - G.ST[0])}
        height={28}
        rx={6}
        fill={soft}
        stroke={c}
        strokeWidth={1.6}
        vectorEffect={NS}
      />
      <circle
        cx={f(G.T[0])}
        cy={0}
        r={22}
        fill="none"
        stroke={c}
        strokeWidth={2}
        vectorEffect={NS}
      />

      {/* front tyre (chord at toe height), rotated */}
      <polygon
        points={polyPoints(ty, TP)}
        fill={soft}
        stroke={c}
        strokeWidth={2}
        vectorEffect={NS}
      />
      <circle cx={f(G.pivot[0])} cy={0} r={6} fill={c} />

      {/* feet */}
      {([1, -1] as const).map((side) => {
        const fp = footPoly(G, side),
          hit = sat(ty, fp);
        const col = hit ? 'var(--warn)' : c;
        return (
          <g key={side}>
            <polygon
              points={polyPoints(fp, TP)}
              fill={hit ? 'var(--warn-soft)' : soft}
              stroke={col}
              strokeWidth={hit ? 2.6 : 1.6}
              vectorEffect={NS}
            />
            <TopLine
              a={[0, side * 30]}
              b={[G.P[0], side * (s.q / 2)]}
              c={c}
              w={3.5}
            />
            <line
              x1={f(G.P[0])}
              x2={f(G.P[0])}
              y1={f((side * s.q) / 2)}
              y2={f(side * (s.q / 2 + 100))}
              stroke={col}
              strokeWidth={2.4}
              vectorEffect={NS}
            />
          </g>
        );
      })}

      {/* stem and bars turn with the steering */}
      <g transform={`rotate(${f(steer)} ${f(sx)} 0)`}>
        <rect
          x={f(Math.min(sx, kx))}
          y={-17}
          width={f(Math.abs(kx - sx))}
          height={34}
          rx={8}
          fill="var(--board)"
          stroke={c}
          strokeWidth={2}
          vectorEffect={NS}
        />
        {s.barType === 'drop'
          ? ([1, -1] as const).map((sd) => {
              const W = s.dW / 2,
                r = s.dReach,
                D = dropEnds(s),
                sb = (W - 75) * Math.tan(rad(s.dSweep || 0));
              return (
                <g key={sd}>
                  <path
                    d={`M${f(kx)},0 L${f(kx)},${f(sd * 60)} L${f(kx - sb)},${f(sd * (W - 75))} C${f(kx - sb)},${f(sd * (W - 25))} ${f(kx + r - 35)},${f(sd * W)} ${f(kx + r)},${f(sd * W)} Q${f(kx + r + 6)},${f((sd * (W + D.bendW)) / 2)} ${f(kx + D.bendX)},${f(sd * D.bendW)} L${f(kx + D.endX)},${f(sd * D.endW)}`}
                    fill="none"
                    stroke={c}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect={NS}
                  />
                  <rect
                    x={f(kx + r - 24)}
                    y={f(sd * W - 14)}
                    width={f(s.hoodExt + 28)}
                    height={28}
                    rx={12}
                    fill={soft}
                    stroke={c}
                    strokeWidth={1.6}
                    vectorEffect={NS}
                  />
                  <circle cx={f(G.hand[0])} cy={f(sd * W)} r={10} fill={c} />
                </g>
              );
            })
          : ([1, -1] as const).map((sd) => {
              const W = s.rW / 2;
              const gy = sd * (W - s.rInboard);
              return (
                <g key={sd}>
                  <path
                    d={`M${f(kx)},0 L${f(kx)},${f(sd * 110)} L${f(kx - G.back * ((W - 110) / Math.max(1, W - 110 - s.rInboard)))},${f(sd * W)}`}
                    fill="none"
                    stroke={c}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect={NS}
                  />
                  <rect
                    x={f(G.hand[0] - 50)}
                    y={f(gy - 34)}
                    width={80}
                    height={68}
                    rx={24}
                    fill={soft}
                    stroke={c}
                    strokeWidth={1.6}
                    vectorEffect={NS}
                    transform={`rotate(${f(-sd * s.rSweep)} ${f(G.hand[0])} ${f(gy)})`}
                  />
                  <circle cx={f(G.hand[0])} cy={f(gy)} r={10} fill={c} />
                </g>
              );
            })}
      </g>

      {/* saddle */}
      <path
        d={`M${f(nx)},0 C${f(nx)},-20 ${f(nx - 110)},-24 ${f(nx - 150)},-46 C${f(nx - 200)},-74 ${f(nx - 262)},-76 ${f(nx - 268)},-50 L${f(nx - 268)},50 C${f(nx - 262)},76 ${f(nx - 200)},74 ${f(nx - 150)},46 C${f(nx - 110)},24 ${f(nx)},20 ${f(nx)},0 Z`}
        fill={soft}
        stroke={c}
        strokeWidth={1.8}
        vectorEffect={NS}
      />
    </g>
  );
}

// Bikes are listed top-first, so draw them in reverse; the staged copy goes on top.
export function SideBoard({
  bikes,
  staged,
}: {
  bikes: Drawn[];
  staged: Drawn | null;
}) {
  return (
    <Board
      tag="Side"
      label="Side view of the shown bikes"
      viewBox={[X0, -SIDE.y1, X1 - X0, SIDE.y1 - SIDE.y0]}
    >
      {(scale) => (
        <>
          <Grid x0={X0} x1={X1} y0={SIDE.y0} y1={SIDE.y1} flip scale={scale} />
          <BBMarker scale={scale} />
          {[...bikes].reverse().map((b) => (
            <BikeSide key={b.G.id} {...b} />
          ))}
          {staged && (
            <g className="staged">
              <BikeSide {...staged} />
            </g>
          )}
        </>
      )}
    </Board>
  );
}

export function TopBoard({
  bikes,
  staged,
  steer,
  onSteer,
}: {
  bikes: Drawn[];
  staged: Drawn | null;
  steer: number;
  onSteer: (v: number) => void;
}) {
  return (
    <Board
      tag="Top"
      label="Top view of cockpits, wheels and feet"
      viewBox={[X0, -TOP.y, X1 - X0, 2 * TOP.y]}
      overlay={
        <div className="overlay">
          <label htmlFor="steer">
            Steer <span className="num">{steer}°</span>
          </label>
          <input
            type="range"
            id="steer"
            min={0}
            max={45}
            step={1}
            value={steer}
            onChange={(e) => onSteer(+e.target.value)}
          />
        </div>
      }
    >
      {(scale) => (
        <>
          <Grid
            x0={X0}
            x1={X1}
            y0={-TOP.y}
            y1={TOP.y}
            flip={false}
            scale={scale}
          />
          <line
            x1={X0}
            x2={X1}
            y1={0}
            y2={0}
            stroke="var(--ink)"
            strokeWidth={1}
            vectorEffect={NS}
            opacity={0.35}
            strokeDasharray="2 4"
          />
          {[...bikes].reverse().map((b) => (
            <BikeTop key={b.G.id} {...b} steer={steer} />
          ))}
          {staged && (
            <g className="staged">
              <BikeTop {...staged} steer={steer} />
            </g>
          )}
        </>
      )}
    </Board>
  );
}
