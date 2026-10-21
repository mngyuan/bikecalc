import {type ReactNode, memo, useEffect, useRef, useState} from 'react';
import {NS} from './svg';

export interface Extent {
  x0: number;
  x1: number;
  y0: number; // in drawing units: for a flipped side view, mm below the BB
  y1: number;
}

// A drafting board: an SVG in mm with a grid. Children get the current
// px-per-mm scale so labels and markers can stay a constant screen size.
export function Board({
  tag,
  label,
  viewBox,
  overlay,
  children,
}: {
  tag: string;
  label: string;
  viewBox: [number, number, number, number];
  overlay?: ReactNode;
  children: (scale: number) => ReactNode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(900);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width || 900));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = width / viewBox[2];
  return (
    <div className="board">
      <span className="tag">{tag}</span>
      {overlay}
      <svg ref={ref} viewBox={viewBox.join(' ')} role="img" aria-label={label}>
        {children(scale)}
      </svg>
    </div>
  );
}

// mm grid: 1 cm minor, 5 cm and 10 cm major, labelled in cm.
// For the side view (flip) y0..y1 are bike heights; otherwise svg y.
export const Grid = memo(function Grid({
  x0,
  x1,
  y0,
  y1,
  flip,
  scale,
}: Extent & {flip: boolean; scale: number}) {
  const fs = 10.5 / scale;
  const lines: ReactNode[] = [];
  const cls = (n: number) => (n % 100 === 0 ? 'g3' : n % 50 === 0 ? 'g2' : 'g1');
  for (let x = Math.ceil(x0 / 10) * 10; x <= x1; x += 10) {
    const c = cls(x);
    if (c === 'g1' && scale < 0.35) continue;
    lines.push(<line key={`x${x}`} className={c} x1={x} x2={x} y1={-y1} y2={-y0} vectorEffect={NS} strokeWidth={1} />);
  }
  for (let y = Math.ceil(y0 / 10) * 10; y <= y1; y += 10) {
    const c = cls(y);
    if (c === 'g1' && scale < 0.35) continue;
    const sy = flip ? -y : y;
    lines.push(<line key={`y${y}`} className={c} x1={x0} x2={x1} y1={sy} y2={sy} vectorEffect={NS} strokeWidth={1} />);
  }
  const step = scale < 0.3 ? 200 : 100;
  const labels: ReactNode[] = [];
  for (let x = Math.ceil(x0 / step) * step; x <= x1 - 40; x += step) {
    labels.push(
      <text key={`lx${x}`} className="glabel" x={x + 3 / scale} y={-y0 - 4 / scale} fontSize={fs}>
        {x / 10} cm
      </text>,
    );
  }
  for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
    if (Math.abs(y - y0) < 30) continue;
    const sy = flip ? -y : y;
    labels.push(
      <text key={`ly${y}`} className="glabel" x={x0 + 4 / scale} y={sy - 3 / scale} fontSize={fs}>
        {(flip ? y : -y) / 10}
      </text>,
    );
  }
  return (
    <g aria-hidden="true">
      {lines}
      {labels}
    </g>
  );
});

export function BBMarker({scale}: {scale: number}) {
  return (
    <g aria-hidden="true">
      <g stroke="var(--ink)" strokeWidth={1} vectorEffect={NS} opacity={0.5}>
        <line x1={-30} x2={30} y1={0} y2={0} vectorEffect={NS} />
        <line x1={0} x2={0} y1={-30} y2={30} vectorEffect={NS} />
      </g>
      <text className="glabel" x={8 / scale} y={-8 / scale} fontSize={10.5 / scale}>
        BB
      </text>
    </g>
  );
}
