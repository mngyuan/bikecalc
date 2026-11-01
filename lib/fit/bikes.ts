import {
  type Frame,
  type FrameID,
  type FrameSize,
  frameIDs,
  frameSizeOf,
  getFrame,
  isFrameID,
} from '../data';

// Bikes the fit visualizer can show: every catalog frame.
export type FitBikeID = FrameID;
export const FIT_BIKES = frameIDs;
export const isFitBike = isFrameID;

export const geometryOf = (id: FitBikeID): Frame => getFrame(id);
export const frameSize = (id: FitBikeID, size: string): FrameSize =>
  frameSizeOf(id, size);

export const bikeName = (id: FitBikeID) => getFrame(id).name;
export const bikeShort = (id: FitBikeID) => {
  const f = getFrame(id);
  return f.short ?? f.name;
};
export const bikeYear = (id: FitBikeID) => getFrame(id).year;

// Colour slots in app.css, given out in the order bikes were added, so a
// bike keeps its colour whichever others are shown. Bikes past the last
// validated slot get a neutral colour; their names still label them everywhere.
const SLOTS = ['--b1', '--b2', '--b3', '--b4'] as const;

export interface BikeColor {
  c: string; // stroke
  soft: string; // translucent fill
  chip: string; // card header background
}

export function colorOf(id: FitBikeID, added: readonly FitBikeID[]): BikeColor {
  const i = added.indexOf(id);
  const slot = i >= 0 && i < SLOTS.length ? SLOTS[i] : '--bx';
  return {
    c: `var(${slot})`,
    soft: `var(${slot}-soft)`,
    chip: `var(${slot}-chip)`,
  };
}

export const STAGED_COLOR: BikeColor = {
  c: 'var(--staged)',
  soft: 'var(--staged-soft)',
  chip: 'var(--staged-soft)',
};
