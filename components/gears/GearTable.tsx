import type {CSSProperties, ReactNode} from 'react';
import {
  type GearConfig,
  type GearSel,
  gearRange,
  gearRatio,
  hubRatios,
  METRICS,
  type MetricKey,
  sameSel,
} from '@/lib/gears';

const fmtOr = (n: number, format: (n: number) => string) =>
  Number.isFinite(n) ? format(n) : '—';

// Heat-map table: chainrings down, sprockets across (smallest cog, the hardest
// gear, on the left). With a hub: chainring × sprocket down, hub gears across.
export function GearTable({
  cfg,
  metric,
  cadence,
  pinned,
  onHover,
  onPick,
}: {
  cfg: GearConfig;
  metric: MetricKey;
  cadence: number;
  pinned: GearSel;
  onHover: (s: GearSel | null) => void;
  onPick: (s: GearSel) => void;
}) {
  const m = METRICS[metric];
  const hub = hubRatios(cfg);
  const [lo, hi] = m.range;

  const cell = (s: GearSel, label: string) => {
    const v = m.value(gearRatio(cfg, s), cfg, cadence);
    const t = Number.isFinite(v)
      ? Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
      : 0;
    return (
      <td key={`${s.sprocket}-${s.hub}`}>
        <button
          type="button"
          className={`cell${t >= 0.76 ? ' hl' : ''}${t >= 0.5 ? ' hd' : ''}`}
          style={{'--t': `${Math.round(t * 100)}%`} as CSSProperties}
          aria-pressed={sameSel(s, pinned)}
          aria-label={`${label}: ${fmtOr(v, m.format)} ${m.unit}`}
          onPointerEnter={() => onHover(s)}
          onFocus={() => onHover(s)}
          onBlur={() => onHover(null)}
          onClick={() => onPick(s)}
        >
          {fmtOr(v, m.format)}
        </button>
      </td>
    );
  };

  let head: ReactNode, body: ReactNode;
  if (hub) {
    // highest hub gear first, matching the cassette layout
    const gears = hub.map((_, i) => i).reverse();
    head = gears.map((h) => (
      <th key={h} scope="col">
        <small>×{hub[h].toFixed(2)}</small>
        {h + 1}
      </th>
    ));
    body = cfg.chainrings.flatMap((ring, ri) =>
      cfg.sprockets.map((cog, si) => (
        <tr key={`${ri}-${si}`}>
          <th scope="row">
            {ring} × {cog}
          </th>
          {gears.map((h) =>
            cell(
              {ring: ri, sprocket: si, hub: h},
              `${ring} × ${cog}, hub gear ${h + 1}`,
            ),
          )}
        </tr>
      )),
    );
  } else {
    const n = cfg.sprockets.length;
    head = cfg.sprockets.map((cog, si) => (
      <th key={si} scope="col">
        <small>{n - si}</small>
        {cog}T
      </th>
    ));
    body = cfg.chainrings.map((ring, ri) => (
      <tr key={ri}>
        <th scope="row">{ring}T</th>
        {cfg.sprockets.map((cog, si) =>
          cell({ring: ri, sprocket: si, hub: 0}, `${ring} × ${cog}`),
        )}
      </tr>
    ));
  }

  return (
    <>
      <table className="gears" onPointerLeave={() => onHover(null)}>
        <thead>
          <tr>
            <th scope="col">{m.unit}</th>
            {head}
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
      <div className="legend" aria-hidden="true">
        <span>Easier</span>
        <span className="ramp" />
        <span>Harder</span>
        <span className="num">
          {lo}–{hi} {m.unit}
        </span>
      </div>
      <p className="note">{EXPLAIN[metric]}</p>
    </>
  );
}

const EXPLAIN: Record<MetricKey, string> = {
  gearInches:
    'Gear inches: the diameter of the wheel a bike with no gearing (1:1) would need to feel the same. Lower is easier to pedal.',
  development:
    'Development: how far the bike travels for one full turn of the pedals. Lower is easier to pedal.',
  speed:
    'Speed: how fast you would be traveling on flat ground pedaling at that cadence.',
};

export function GearHero({
  cfg,
  sel,
  metric,
  cadence,
}: {
  cfg: GearConfig;
  sel: GearSel;
  metric: MetricKey;
  cadence: number;
}) {
  const hub = hubRatios(cfg);
  const ratio = gearRatio(cfg, sel);
  const ring = cfg.chainrings[sel.ring],
    cog = cfg.sprockets[sel.sprocket];
  const gi = METRICS.gearInches.value(ratio, cfg, cadence),
    dev = METRICS.development.value(ratio, cfg, cadence),
    spd = METRICS.speed.value(ratio, cfg, cadence);
  const range = gearRange(cfg);
  const m = METRICS[metric];

  // Rings and sprockets are numbered from the last one, as in the table header
  const gear =
    `front ${cfg.chainrings.length - sel.ring} / rear ${cfg.sprockets.length - sel.sprocket}` +
    (hub ? ` / hub gear ${sel.hub + 1}` : '');
  const detail: Record<MetricKey, string> = {
    gearInches: `Feels like riding a ${fmtOr(gi, (n) => n.toFixed(2))}" tire on a 1:1 gear bike. If your shifters have gear indicators, they'd show ${gear}.`,
    development: `The bike travels ${fmtOr(dev, (n) => n.toFixed(2))}m per full pedal revolution.`,
    speed: `You would travel at ${fmtOr(spd, (n) => n.toFixed(2))} km/h at ${cadence} RPM cadence.`,
  };

  const bigNumber: Record<MetricKey, ReactNode> = {
    gearInches: (
      <span>
        {fmtOr(gi, (n) => n.toFixed(1))} <small>in</small>
      </span>
    ),
    development: (
      <span>
        {fmtOr(dev, (n) => n.toFixed(2))} <small>m</small>
      </span>
    ),
    speed: (
      <span>
        {fmtOr(spd, (n) => n.toFixed(1))} <small>km/h</small>
      </span>
    ),
  };

  return (
    <div className="hero">
      <div className="hero-body">
        <span className="eyebrow">
          Gear {ring}T × {cog}T{hub ? ` · hub gear ${sel.hub + 1}` : ''}
        </span>
        <div className="big">{bigNumber[metric]}</div>
        <p className="note">{detail[metric]}</p>
      </div>
      {range && (
        <div className="stats">
          <div>
            <span className="eyebrow">Lowest</span>
            <b>
              {m.format(m.value(range.lo, cfg, cadence))} {m.unit}
            </b>
          </div>
          <div>
            <span className="eyebrow">Highest</span>
            <b>
              {m.format(m.value(range.hi, cfg, cadence))} {m.unit}
            </b>
          </div>
          <div>
            <span className="eyebrow">Range</span>
            <b>{Math.round(range.spread * 100)}%</b>
          </div>
        </div>
      )}
    </div>
  );
}
