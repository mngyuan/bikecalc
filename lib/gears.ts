import {
  type BikeID,
  CASSETTE_DB,
  type CassetteID,
  type DrivetrainID,
  drivetrainIDs,
  type FrameID,
  frameSizeOf,
  getBike,
  getDrivetrain,
  isInternallyGearedHub,
  isSprocketCassette,
  REFERENCE_FRAME,
  stockSetup,
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
  // Frame drawn, and the size; null draws REFERENCE_FRAME
  frameID: FrameID | null;
  frameSize: string;
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

type TireFields = Pick<GearConfig, 'tireID' | 'width' | 'bsd'>;
type DriveFields = Pick<
  GearConfig,
  'chainrings' | 'cassetteID' | 'sprockets' | 'ratios'
>;

export function tireFields(id: TireID): TireFields {
  const [width, bsd] = TIRE_DB[id].ETRTOSize;
  return {tireID: id, width, bsd};
}

export function drivetrainFields(id: DrivetrainID): DriveFields {
  const d = getDrivetrain(id);
  const cassette = CASSETTE_DB[d.cassette];
  return {
    chainrings: [...d.chainringTeeth],
    cassetteID: d.cassette,
    sprockets: isSprocketCassette(cassette)
      ? [...cassette.sprockets]
      : [...(d.sprockets ?? [])],
    ratios: isInternallyGearedHub(cassette) ? [...cassette.ratios] : null,
  };
}

export function configFromBike(id: BikeID): GearConfig {
  const b = getBike(id);
  return {
    frameID: b.frame?.id ?? null,
    frameSize: b.frame?.size ?? '',
    ...tireFields(b.tires[0]),
    ...drivetrainFields(b.drivetrains[0]),
  };
}

// The frame size drawn for a config
export const frameOf = (cfg: GearConfig) =>
  cfg.frameID
    ? frameSizeOf(cfg.frameID, cfg.frameSize)
    : frameSizeOf(REFERENCE_FRAME.frame, REFERENCE_FRAME.size);

// The crank length drawn: the stock length for the frame size when known
export const crankOf = (cfg: GearConfig) =>
  (cfg.frameID && stockSetup(cfg.frameID, cfg.frameSize)?.size.crank) ||
  CRANK_LENGTH_MM;

// The catalog tire on a wheel size whose width is closest to `width`
export function tireForWheel(bsd: number, width: number): TireID | null {
  let best: TireID | null = null;
  for (const id of Object.keys(TIRE_DB) as TireID[]) {
    const [w, d] = TIRE_DB[id].ETRTOSize;
    if (d !== bsd) continue;
    if (
      !best ||
      Math.abs(w - width) < Math.abs(TIRE_DB[best].ETRTOSize[0] - width)
    )
      best = id;
  }
  return best;
}

// Tire fields for a frame taking `wheels` (the size it's built for first):
// the current tire if it fits, otherwise the closest catalog tire for the
// built-for size, otherwise the same width marked custom.
export function fitTire(
  cfg: GearConfig,
  wheels: readonly number[],
): TireFields {
  if (wheels.includes(cfg.bsd))
    return {tireID: cfg.tireID, width: cfg.width, bsd: cfg.bsd};
  const bsd = wheels[0];
  const id = tireForWheel(bsd, cfg.width);
  return id ? tireFields(id) : {tireID: 'custom', width: cfg.width, bsd};
}

const sameList = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((n, i) => n === b[i]);

const sameDrive = (a: DriveFields, b: DriveFields) =>
  a.cassetteID === b.cassetteID &&
  sameList(a.chainrings, b.chainrings) &&
  sameList(a.sprockets, b.sprockets) &&
  sameList(a.ratios ?? [], b.ratios ?? []);

// The catalog drivetrain the config matches, if any
export const matchDrivetrain = (cfg: GearConfig): DrivetrainID | 'custom' =>
  drivetrainIDs.find((id) => sameDrive(cfg, drivetrainFields(id))) ?? 'custom';

// True when the config is one of the bike's stock options: its frame in any
// size, one of its tires and one of its drivetrains
export function isStock(cfg: GearConfig, id: BikeID | 'custom'): boolean {
  if (id === 'custom') return false;
  const b = getBike(id);
  const frameOK = b.frame
    ? cfg.frameID === b.frame.id
    : cfg.frameID === null && cfg.frameSize === '';
  const tireOK = b.tires.some((t) => {
    const f = tireFields(t);
    return cfg.tireID === t && cfg.width === f.width && cfg.bsd === f.bsd;
  });
  const driveOK = b.drivetrains.some((d) =>
    sameDrive(cfg, drivetrainFields(d)),
  );
  return frameOK && tireOK && driveOK;
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
