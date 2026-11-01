import type {BarID} from './cockpit';
import type {DrivetrainID} from './drivetrains';
import {FRAME_DB, type FrameID} from './frames';
import {TIRE_DB, type TireID} from './tires';

// A complete bike as sold: a drivetrain and tires, and the frame when its
// geometry is in the catalog. The gear calculator lists these; the fit
// visualizer lists frames. Without a frame, the gear calculator draws
// REFERENCE_FRAME.
export interface Bike {
  name: string;
  year?: string;
  // With a frame, the bike comes in all its sizes; `size` is the one shown first
  frame?: {id: FrameID; size: string};
  // Stock options; the first of each is shown first
  drivetrains: readonly DrivetrainID[];
  tires: readonly TireID[];
  // The maker's cockpit for each frame size, used by the fit visualizer
  setup?: {
    stemAng: number;
    sizes: Record<string, SizeSetup>;
  };
}

export interface SizeSetup {
  stemLen: number;
  bar: BarID;
  crank: number;
}

export const BIKE_DB = {
  // Cannot identify this cassette
  // 'Bike Friday All-Packa 1x9'
  'bike-friday-all-packa-1x11': {
    name: 'Bike Friday All-Packa 1x11',
    drivetrains: ['42-sram-pg1130-11-42'],
    tires: ['Kenda Booster Pro 20"x2.4"'],
  },
  'bike-friday-all-packa-1x12': {
    name: 'Bike Friday All-Packa 1x12',
    drivetrains: ['42-sram-xplr-pg1231-11-44'],
    tires: ['Kenda Booster Pro 20"x2.4"'],
  },
  // Cannot identify this cassette, same one probably
  // 'Bike Friday All-Packa 2x'
  // Not sure sprockets
  // 'Bike Friday All-Packa Rohloff'
  'brompton-a-line': {
    name: 'Brompton A Line',
    drivetrains: ['44-sturmey-bsr-13'],
    tires: ['Schwalbe Kojak 16"'],
  },
  'brompton-c-line-3': {
    // Discontinued
    name: 'Brompton C Line 3 speed',
    drivetrains: ['50-sturmey-bsr-13'],
    tires: ['Schwalbe Marathon 16"'],
  },
  'brompton-c-line-6': {
    name: 'Brompton C Line 6 speed',
    drivetrains: ['50-sturmey-bwr-13-16'],
    tires: ['Schwalbe Marathon Racer 16"'],
  },
  'brompton-g-line': {
    name: 'Brompton G Line',
    drivetrains: ['54-alfine-8-20'],
    tires: ['Schwalbe G-One Allround 20"'],
  },
  'brompton-t-line-12': {
    name: 'Brompton T Line 12 speed',
    drivetrains: ['50-sturmey-bwr-11-13-15-18'],
    tires: ['Schwalbe One 16"'],
  },
  'cranston-r9-max-9': {
    name: 'Cranston R9 Max 9 speed',
    drivetrains: ['53-alivio-hg400-11-32'],
    tires: ['Schwalbe Green Marathon 16"'],
  },
  'cranston-r20-max-9': {
    name: 'Cranston R20 Max 9 speed',
    drivetrains: ['53-alivio-hg400-11-32'],
    tires: ['Schwalbe Green Marathon 20"'],
  },
  'marin-larkspur-1': {
    name: 'Marin Larkspur 1',
    drivetrains: ['38-sunrace-10-11-51'],
    tires: ['Vee GP Vee 27.5"x2.35"'],
  },
  'fuji-feather-cx-plus': {
    name: 'Fuji Feather CX+',
    drivetrains: ['48-36-hg50-8-11-32'],
    tires: ['Kenda Flintridge 700x35c'],
  },
  'fairlight-faran-3': {
    name: 'Fairlight Faran 3.0',
    year: '2026',
    frame: {id: 'fairlight-faran-3-2026', size: '56R'},
    drivetrains: [
      'grx-rx610-1x12',
      'grx-rx610-2x12',
      'grx-rx820-1x12',
      'grx-rx820-2x12',
      'sram-force-e1-xplr-1x13',
    ],
    tires: [
      'Panaracer GravelKing X1 TLR 700x45',
      'Panaracer GravelKing X1 TLR 700x50',
      'Panaracer GravelKing Slick TLR 700x40',
      'Hutchinson BlackBird AS 700x34',
      'Continental Terra Speed ProTection 700x45',
    ],
    // Fairlight's typical setup by size. They don't name the stem, so its
    // angle is a guess: a common 6° stem, rising.
    setup: {
      stemAng: 6,
      sizes: {
        '51T': {stemLen: 80, bar: 'fsaAdventure38', crank: 165},
        '54R': {stemLen: 90, bar: 'fsaAdventure40', crank: 170},
        '54T': {stemLen: 90, bar: 'fsaAdventure40', crank: 170},
        '56R': {stemLen: 100, bar: 'fsaAdventure42', crank: 172.5},
        '56T': {stemLen: 100, bar: 'fsaAdventure42', crank: 172.5},
        '58R': {stemLen: 100, bar: 'fsaAdventure44', crank: 172.5},
        '58T': {stemLen: 100, bar: 'fsaAdventure44', crank: 172.5},
        '61T': {stemLen: 110, bar: 'fsaAdventure44', crank: 175},
      },
    },
  },
  'surly-disc-trucker': {
    name: 'Surly Disc Trucker',
    drivetrains: ['48-36-26-alivio-hg400-11-34'],
    tires: ['Surly ExtraTerrestrial 26"x46'],
  },
} as const satisfies Record<string, Bike>;

export type BikeID = keyof typeof BIKE_DB;

export const bikeIDs = Object.keys(BIKE_DB) as BikeID[];
export const getBike = (id: BikeID): Bike => BIKE_DB[id];

// Every stock tire must fit every size of the bike's frame.
for (const id of bikeIDs) {
  const {frame, tires} = getBike(id);
  if (!frame) continue;
  const sizes: Record<string, {bsd: number}> = FRAME_DB[frame.id].sizes;
  if (!(frame.size in sizes))
    throw new Error(`${id}: ${frame.id} has no size ${frame.size}`);
  for (const [k, z] of Object.entries(sizes))
    for (const tire of tires)
      if (z.bsd !== TIRE_DB[tire].ETRTOSize[1])
        throw new Error(`${id}: ${tire} does not fit ${frame.id} ${k}`);
}

// The stock setup for a frame size, from the first bike built on that frame
export function stockSetup(
  frameID: FrameID,
  size: string,
): {stemAng: number; size: SizeSetup} | null {
  for (const id of bikeIDs) {
    const b = getBike(id);
    if (b.frame?.id !== frameID || !b.setup) continue;
    const z = b.setup.sizes[size];
    return z ? {stemAng: b.setup.stemAng, size: z} : null;
  }
  return null;
}

export const DEFAULT_GEAR_BIKE: BikeID = 'surly-disc-trucker';
