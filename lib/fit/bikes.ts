import {BIKE_DB, type BikeID, type FrameSize, type Geometry} from '../data';

// Bikes the fit visualizer can show: catalog entries that have geometry.
export type FitBikeID = {
  [K in BikeID]: (typeof BIKE_DB)[K] extends {geometry: unknown} ? K : never;
}[BikeID];

export const FIT_BIKES = (Object.keys(BIKE_DB) as BikeID[]).filter(
  (id): id is FitBikeID => 'geometry' in BIKE_DB[id],
);

export const isFitBike = (v: unknown): v is FitBikeID =>
  typeof v === 'string' && (FIT_BIKES as string[]).includes(v);

export const geometryOf = (id: FitBikeID): Geometry => BIKE_DB[id].geometry;

export function frameSize(id: FitBikeID, size: string): FrameSize {
  const geo = geometryOf(id);
  return geo.sizes[size] ?? geo.sizes[geo.defaultSize];
}

export const bikeName = (id: FitBikeID) => BIKE_DB[id].name;
export const bikeShort = (id: FitBikeID) => {
  const b: {name: string; short?: string} = BIKE_DB[id];
  return b.short ?? b.name;
};
export const bikeYear = (id: FitBikeID) => BIKE_DB[id].year;

// Colour slots in app.css, given out in catalog order so a bike keeps its
// colour whichever others are shown. Bikes past the last validated slot get
// a neutral colour; their names still label them everywhere.
const SLOTS = ['--b1', '--b2', '--b3', '--b4'] as const;

export interface BikeColor {
  c: string; // stroke
  soft: string; // translucent fill
  chip: string; // card header background
}

export function colorOf(id: FitBikeID): BikeColor {
  const i = FIT_BIKES.indexOf(id);
  const slot = i >= 0 && i < SLOTS.length ? SLOTS[i] : '--bx';
  return {c: `var(${slot})`, soft: `var(${slot}-soft)`, chip: `var(${slot}-chip)`};
}

export const STAGED_COLOR: BikeColor = {
  c: 'var(--staged)',
  soft: 'var(--staged-soft)',
  chip: 'var(--staged-soft)',
};
