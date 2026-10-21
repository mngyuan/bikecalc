// Stems and handlebars for the fit visualizer. Keys are stored in saved fit
// settings, so rename a key only together with a migration in lib/fit/state.ts.
// Lengths in mm, angles in degrees.

export interface StandardStem {
  label: string;
  stemType: 'std';
  len: number; // extension, steerer centre to bar clamp centre
  ang: number; // rise from square-on to the steerer; negative points down
  stack: number; // height of the clamp on the steerer
}

export interface Gooseneck {
  label: string;
  stemType: 'goose';
  gH: number; // stem base to bar centre, along the steerer
  gE: number; // forward distance from steerer centre to bar centre
  gMin: number; // least steerer the stem needs to clamp safely
  gMax: number; // most steerer that fits inside the stem
}

export type Stem = StandardStem | Gooseneck;

export interface DropBar {
  label: string;
  barType: 'drop';
  dW: number; // width at the hoods, centre to centre
  dReach: number; // clamp centre to the furthest-forward point of the bend
  dDrop: number; // tops down to the drops
  dFlare: number; // drops lean outward, seen from the front
  dOut: number; // drop ends kick outward, seen from above
  dSweep: number; // tops sweep back towards the rider
  hoodExt: number; // palm position ahead of the bar reach
  hoodUp: number; // palm height above the bar centre
}

export interface RiserBar {
  label: string;
  barType: 'riser';
  rW: number; // width, end to end
  rRise: number; // grips above the stem clamp
  rSweep: number; // grip backsweep
  rInboard: number; // bar end to palm centre
}

export type Bar = DropBar | RiserBar;

export const STEM_DB = {
  redshift80: {label: 'Redshift ShockStop 80 / +30°', stemType: 'std', len: 80, ang: 30, stack: 40},
  stock100: {label: 'Alterr stock 100 / +17° (flip for −17°)', stemType: 'std', len: 100, ang: 17, stack: 40},
  happy90: {label: 'VO Happy Stem 90 / +45°', stemType: 'std', len: 90, ang: 45, stack: 40},
  happy110: {label: 'VO Happy Stem 110 / +45°', stemType: 'std', len: 110, ang: 45, stack: 40},
  mcr100: {label: 'Nitto MCR65 100 / +35°', stemType: 'std', len: 100, ang: 35, stack: 47},
  mcr120: {label: 'Nitto MCR65 120 / +35°', stemType: 'std', len: 120, ang: 35, stack: 47},
  vo90_17: {label: 'VO Threadless 90 / +17°', stemType: 'std', len: 90, ang: 17, stack: 40},
  cigne70: {label: 'Cigne 70 (145 tall)', stemType: 'goose', gH: 145, gE: 70, gMin: 55, gMax: 100},
  cigne90: {label: 'Cigne 90 (145 tall)', stemType: 'goose', gH: 145, gE: 90, gMin: 55, gMax: 100},
  ld40: {label: 'Crust LD 40 (135 tall)', stemType: 'goose', gH: 135, gE: 40, gMin: 40, gMax: 60},
  ld90: {label: 'Crust LD 90 (135 tall)', stemType: 'goose', gH: 135, gE: 90, gMin: 32, gMax: 32},
  sst: {label: 'Crust SST (80 tall, 30 reach)', stemType: 'goose', gH: 80, gE: 30, gMin: 50, gMax: 60},
} as const satisfies Record<string, Stem>;

export const BAR_DB = {
  cowbell44: {label: 'Salsa Cowbell 44', barType: 'drop', dW: 440, dReach: 68, dDrop: 115, dFlare: 12, dOut: 12, dSweep: 0, hoodExt: 35, hoodUp: 30},
  venturemax44: {label: 'Ritchey VentureMax 44', barType: 'drop', dW: 440, dReach: 76, dDrop: 102, dFlare: 24, dOut: 6, dSweep: 6, hoodExt: 35, hoodUp: 30},
  riser650: {label: 'Alterr stock riser 640 / 80 + GP3', barType: 'riser', rW: 640, rRise: 80, rSweep: 9, rInboard: 25},
} as const satisfies Record<string, Bar>;

export type StemID = keyof typeof STEM_DB;
export type BarID = keyof typeof BAR_DB;
