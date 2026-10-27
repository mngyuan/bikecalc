import type {CassetteID} from './cassettes';
import type {TireID} from './tires';

// One catalog for both tools. A bike can carry a stock drivetrain (used by
// the gear calculator), a frame geometry (used by the fit visualizer), or
// both. When the gear calculator shows a bike with geometry, it draws that
// frame; otherwise it falls back to REFERENCE_FRAME.

export interface Drivetrain {
  tire: TireID;
  chainringTeeth: readonly number[];
  cassette: CassetteID;
  // Needs to be separately specified for internally geared hubs
  sprockets?: readonly number[];
}

// One frame size. Lengths in mm, angles in degrees.
export interface FrameSize {
  label: string;
  stack: number;
  reach: number;
  hta: number; // head tube angle
  sta: number; // seat tube angle
  ht: number; // head tube length
  drop: number; // bottom bracket drop below the axle line
  cs: number; // chainstay length
  off: number; // fork offset
  st: number; // seat tube length, BB centre to top
  tt: number; // top tube slope, degrees
  bsd: number; // bead seat diameter of the wheels the frame is built for
}

export interface Geometry {
  source: string;
  defaultSize: string;
  sizes: Record<string, FrameSize>;
  ring: number; // chainring radius drawn in the fit view when no drivetrain is known
}

export interface Bike {
  name: string;
  short?: string; // compact label for pills and table headers
  year?: string;
  drivetrain?: Drivetrain;
  geometry?: Geometry;
}

// Sizes that share most numbers: spread the shared ones into every size.
const withCommon = (
  common: Omit<FrameSize, 'label' | 'stack' | 'reach' | 'ht' | 'st'>,
  sizes: Record<
    string,
    Pick<FrameSize, 'label' | 'stack' | 'reach' | 'ht' | 'st'>
  >,
): Record<string, FrameSize> =>
  Object.fromEntries(
    Object.entries(sizes).map(([k, z]) => [k, {...common, ...z}]),
  );

export const BIKE_DB = {
  // Cannot identify this cassette
  // 'Bike Friday All-Packa 1x9'
  'bike-friday-all-packa-1x11': {
    name: 'Bike Friday All-Packa 1x11',
    drivetrain: {
      tire: 'Kenda Booster Pro 20"x2.4"',
      chainringTeeth: [42],
      cassette: 'SRAM PG-1130 11 Speed 11-42T',
    },
  },
  'bike-friday-all-packa-1x12': {
    name: 'Bike Friday All-Packa 1x12',
    drivetrain: {
      tire: 'Kenda Booster Pro 20"x2.4"',
      chainringTeeth: [42],
      cassette: 'SRAM XPLR PG-1231 12 Speed 11-44T',
    },
  },
  // Cannot identify this cassette, same one probably
  // 'Bike Friday All-Packa 2x'
  // Not sure sprockets
  // 'Bike Friday All-Packa Rohloff'
  'brompton-a-line': {
    name: 'Brompton A Line',
    drivetrain: {
      tire: 'Schwalbe Kojak 16"',
      chainringTeeth: [44],
      cassette: 'Sturmey Archer BSR',
      sprockets: [13],
    },
  },
  'brompton-c-line-3': {
    // Discontinued
    name: 'Brompton C Line 3 speed',
    drivetrain: {
      tire: 'Schwalbe Marathon 16"',
      chainringTeeth: [50],
      cassette: 'Sturmey Archer BSR',
      sprockets: [13],
    },
  },
  'brompton-c-line-6': {
    name: 'Brompton C Line 6 speed',
    drivetrain: {
      tire: 'Schwalbe Marathon Racer 16"',
      chainringTeeth: [50],
      cassette: 'Sturmey Archer BWR',
      sprockets: [13, 16],
    },
  },
  'brompton-g-line': {
    name: 'Brompton G Line',
    drivetrain: {
      tire: 'Schwalbe G-One Allround 20"',
      chainringTeeth: [54],
      cassette: 'Shimano Alfine 8 Speed Hub',
      sprockets: [20],
    },
  },
  'brompton-t-line-12': {
    name: 'Brompton T Line 12 speed',
    drivetrain: {
      tire: 'Schwalbe One 16"',
      chainringTeeth: [50],
      cassette: 'Sturmey Archer BWR',
      sprockets: [11, 13, 15, 18],
    },
  },
  'cranston-r9-max-9': {
    name: 'Cranston R9 Max 9 speed',
    drivetrain: {
      tire: 'Schwalbe Green Marathon 16"',
      chainringTeeth: [53],
      cassette: 'Shimano Alivio CS-HG400 9 Speed 11-32T',
    },
  },
  'cranston-r20-max-9': {
    name: 'Cranston R20 Max 9 speed',
    drivetrain: {
      tire: 'Schwalbe Green Marathon 20"',
      chainringTeeth: [53],
      cassette: 'Shimano Alivio CS-HG400 9 Speed 11-32T',
    },
  },
  'marin-larkspur-1': {
    name: 'Marin Larkspur 1',
    drivetrain: {
      tire: 'Vee GP Vee 27.5"x2.35"',
      chainringTeeth: [38],
      cassette: 'SunRace 10 Speed 11-51T',
    },
  },
  'fuji-feather-cx-plus': {
    name: 'Fuji Feather CX+',
    drivetrain: {
      tire: 'Kenda Flintridge 700x35c',
      chainringTeeth: [48, 36],
      cassette: 'Shimano CS-HG50-8 8 Speed 11-32T',
    },
  },
  'surly-disc-trucker': {
    name: 'Surly Disc Trucker',
    drivetrain: {
      tire: 'Surly ExtraTerrestrial 26"x46',
      chainringTeeth: [48, 36, 26],
      cassette: 'Shimano Alivio CS-HG400 9 Speed 11-34T',
    },
  },

  // Geometry from Bike Insights (Alterr 52, Cross Check 52) and Velo Orange
  // (Polyvalent). Listed in the order the fit visualizer assigns colours.
  'fuji-alterr-2025': {
    name: 'Fuji Alterr',
    short: 'Alterr',
    year: '2025',
    geometry: {
      source: 'Bike Insights',
      defaultSize: '52',
      ring: 82,
      sizes: {
        '52': {
          label: '52cm',
          stack: 494.8,
          reach: 403,
          hta: 70,
          sta: 72,
          ht: 110,
          drop: 38,
          cs: 436.4,
          off: 50,
          st: 520,
          tt: 0,
          bsd: 559,
        },
      },
    },
  },
  'surly-cross-check-2012': {
    name: 'Surly Cross Check',
    short: 'Cross Check',
    year: '2012',
    geometry: {
      source: 'Bike Insights',
      defaultSize: '52',
      ring: 101,
      sizes: {
        '52': {
          label: '52cm',
          stack: 528,
          reach: 389.7,
          hta: 72,
          sta: 73.5,
          ht: 91,
          drop: 66,
          cs: 419.8,
          off: 44,
          st: 520,
          tt: 0.7,
          bsd: 622,
        },
      },
    },
  },
  'velo-orange-polyvalent-2026': {
    name: 'Velo Orange Polyvalent',
    short: 'Polyvalent',
    year: '2026',
    geometry: {
      source: 'Velo Orange',
      defaultSize: 'M',
      ring: 82,
      sizes: withCommon(
        {hta: 73, sta: 72, drop: 67, cs: 429.8, off: 60, tt: 0, bsd: 584},
        {
          S: {label: 'S', stack: 528, reach: 359, ht: 99, st: 510},
          M: {label: 'M', stack: 558, reach: 369, ht: 131, st: 540},
          L: {label: 'L', stack: 589, reach: 379, ht: 163, st: 570},
          XL: {label: 'XL', stack: 619, reach: 399, ht: 195, st: 600},
        },
      ),
    },
  },
} as const satisfies Record<string, Bike>;

export type BikeID = keyof typeof BIKE_DB;

export const bikeIDs = Object.keys(BIKE_DB) as BikeID[];
export const getBike = (id: BikeID): Bike => BIKE_DB[id];
export const shortName = (bike: Bike) => bike.short ?? bike.name;

// The gear calculator draws this frame for bikes without their own geometry.
// It is the same 52cm Cross Check the old three.js view was modelled on.
export const REFERENCE_FRAME = {
  bike: 'surly-cross-check-2012',
  size: '52',
} as const;

export const DEFAULT_GEAR_BIKE: BikeID = 'surly-disc-trucker';
