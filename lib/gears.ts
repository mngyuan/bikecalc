import {
  type BikeID,
  getBike,
  CASSETTE_DB,
  type CassetteID,
  isInternallyGearedHub,
  isSprocketCassette,
  TIRE_DB,
  type TireID,
} from './data';

export const DEFAULT_CADENCE_RPM = 80;
export const CHAIN_PITCH_MM = 12.7; // 1/2" bicycle chain
export const CRANK_LENGTH_MM = 170;

export const tireDiameter = (width: number, bsd: number) => bsd + 2 * width;
export const tireCircumference = (width: number, bsd: number) =>
  Math.PI * tireDiameter(width, bsd);

// Pitch-circle radius of a sprocket or chainring
export const pitchRadius = (teeth: number) =>
  CHAIN_PITCH_MM / (2 * Math.sin(Math.PI / teeth));

export interface GearConfig {
  tireID: TireID | 'custom';
  width: number; // ETRTO width, mm
  bsd: number; // ETRTO bead seat diameter, mm
  chainrings: number[];
  cassetteID: CassetteID | 'custom';
  sprockets: number[];
  // Internally geared hub ratios, gear 1 first; null for a derailleur cassette.
  // Kept here rather than looked up by cassetteID, so a custom hub keeps them.
  ratios: number[] | null;
}

export function configFromBike(id: BikeID): GearConfig | null {
  const d = getBike(id).drivetrain;
  if (!d) return null;
  const [width, bsd] = TIRE_DB[d.tire].ETRTOSize;
  const cassette = CASSETTE_DB[d.cassette];
  return {
    tireID: d.tire,
    width,
    bsd,
    chainrings: [...d.chainringTeeth],
    cassetteID: d.cassette,
    sprockets: isSprocketCassette(cassette)
      ? [...cassette.sprockets]
      : [...(d.sprockets ?? [])],
    ratios: isInternallyGearedHub(cassette) ? [...cassette.ratios] : null,
  };
}

const sameList = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((n, i) => n === b[i]);

// True when the config is exactly the bike's stock spec
export function isStock(cfg: GearConfig, id: BikeID | 'custom'): boolean {
  if (id === 'custom') return false;
  const stock = configFromBike(id);
  return (
    !!stock &&
    cfg.tireID === stock.tireID &&
    cfg.width === stock.width &&
    cfg.bsd === stock.bsd &&
    cfg.cassetteID === stock.cassetteID &&
    sameList(cfg.chainrings, stock.chainrings) &&
    sameList(cfg.sprockets, stock.sprockets) &&
    sameList(cfg.ratios ?? [], stock.ratios ?? [])
  );
}

// Hub ratios for an internally geared hub, gear 1 first; null for a cassette
export const hubRatios = (cfg: GearConfig): readonly number[] | null =>
  cfg.ratios;

// A gear is a chainring, a sprocket and (with a hub) a hub gear, by index
export interface GearSel {
  ring: number;
  sprocket: number;
  hub: number;
}

export function defaultSel(cfg: GearConfig): GearSel {
  const hub = hubRatios(cfg);
  return hub
    ? {ring: 0, sprocket: 0, hub: Math.floor(hub.length / 2)}
    : {ring: 0, sprocket: Math.floor(cfg.sprockets.length / 2), hub: 0};
}

export function clampSel(sel: GearSel, cfg: GearConfig): GearSel {
  const hub = hubRatios(cfg);
  const c = (n: number, len: number) => Math.max(0, Math.min(n, len - 1));
  return {
    ring: c(sel.ring, cfg.chainrings.length),
    sprocket: c(sel.sprocket, cfg.sprockets.length),
    hub: hub ? c(sel.hub, hub.length) : 0,
  };
}

export const sameSel = (a: GearSel | null, b: GearSel | null) =>
  !!a &&
  !!b &&
  a.ring === b.ring &&
  a.sprocket === b.sprocket &&
  a.hub === b.hub;

// Wheel turns per crank turn. Hub ratios are output over input speed, so
// they multiply the chain ratio (v1 divided by them, inverting the hub).
export function gearRatio(cfg: GearConfig, sel: GearSel): number {
  const ring = cfg.chainrings[sel.ring],
    sprocket = cfg.sprockets[sel.sprocket];
  const hub = hubRatios(cfg);
  const hubRatio = hub ? hub[sel.hub] : 1;
  if (!(ring > 0) || !(sprocket > 0) || !(hubRatio > 0)) return NaN;
  return (ring / sprocket) * hubRatio;
}

export type MetricKey = 'gearInches' | 'development' | 'speed';

export interface Metric {
  label: string;
  unit: string;
  range: [number, number]; // colour scale, easy to hard
  value: (ratio: number, cfg: GearConfig, cadence: number) => number;
  format: (n: number) => string;
}

export const METRICS: Record<MetricKey, Metric> = {
  gearInches: {
    label: 'Gear inches',
    unit: 'in',
    range: [20, 120],
    value: (ratio, cfg) => (tireDiameter(cfg.width, cfg.bsd) / 25.4) * ratio,
    format: (n) => Math.round(n).toString(),
  },
  development: {
    label: 'Development',
    unit: 'm',
    range: [1, 10],
    value: (ratio, cfg) =>
      (tireCircumference(cfg.width, cfg.bsd) * ratio) / 1000,
    format: (n) => n.toFixed(1),
  },
  speed: {
    label: 'Speed',
    unit: 'km/h',
    range: [1, 50],
    value: (ratio, cfg, cadence) =>
      (((tireCircumference(cfg.width, cfg.bsd) * ratio) / 1000) *
        cadence *
        60) /
      1000,
    format: (n) => n.toFixed(1),
  },
};

export function allGears(cfg: GearConfig): GearSel[] {
  const hub = hubRatios(cfg);
  const out: GearSel[] = [];
  cfg.chainrings.forEach((_, ring) =>
    cfg.sprockets.forEach((_, sprocket) => {
      if (hub) hub.forEach((_, h) => out.push({ring, sprocket, hub: h}));
      else out.push({ring, sprocket, hub: 0});
    }),
  );
  return out;
}

// Lowest and highest ratio across all gears, and the spread between them
export function gearRange(cfg: GearConfig) {
  const ratios = allGears(cfg)
    .map((g) => gearRatio(cfg, g))
    .filter(Number.isFinite);
  if (!ratios.length) return null;
  const lo = Math.min(...ratios),
    hi = Math.max(...ratios);
  return {lo, hi, spread: hi / lo};
}
