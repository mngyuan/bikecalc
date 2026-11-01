import {CASSETTE_DB, type CassetteID, isInternallyGearedHub} from './cassettes';

// Chainrings plus a cassette or hub. Bikes name one of these, and the gear
// calculator offers them as presets for any frame.
export interface Drivetrain {
  name?: string; // groupset, when the gearing comes from one
  chainringTeeth: readonly number[];
  cassette: CassetteID;
  // The sprockets fitted to an internally geared hub
  sprockets?: readonly number[];
}

export const DRIVETRAIN_DB = {
  '42-sram-pg1130-11-42': {
    chainringTeeth: [42],
    cassette: 'SRAM PG-1130 11 Speed 11-42T',
  },
  '42-sram-xplr-pg1231-11-44': {
    chainringTeeth: [42],
    cassette: 'SRAM XPLR PG-1231 12 Speed 11-44T',
  },
  '44-sturmey-bsr-13': {
    chainringTeeth: [44],
    cassette: 'Sturmey Archer BSR',
    sprockets: [13],
  },
  '50-sturmey-bsr-13': {
    chainringTeeth: [50],
    cassette: 'Sturmey Archer BSR',
    sprockets: [13],
  },
  '50-sturmey-bwr-13-16': {
    chainringTeeth: [50],
    cassette: 'Sturmey Archer BWR',
    sprockets: [13, 16],
  },
  '50-sturmey-bwr-11-13-15-18': {
    chainringTeeth: [50],
    cassette: 'Sturmey Archer BWR',
    sprockets: [11, 13, 15, 18],
  },
  '54-alfine-8-20': {
    chainringTeeth: [54],
    cassette: 'Shimano Alfine 8 Speed Hub',
    sprockets: [20],
  },
  '53-alivio-hg400-11-32': {
    chainringTeeth: [53],
    cassette: 'Shimano Alivio CS-HG400 9 Speed 11-32T',
  },
  '38-sunrace-10-11-51': {
    chainringTeeth: [38],
    cassette: 'SunRace 10 Speed 11-51T',
  },
  '48-36-hg50-8-11-32': {
    chainringTeeth: [48, 36],
    cassette: 'Shimano CS-HG50-8 8 Speed 11-32T',
  },
  '48-36-26-alivio-hg400-11-34': {
    chainringTeeth: [48, 36, 26],
    cassette: 'Shimano Alivio CS-HG400 9 Speed 11-34T',
  },
  // Groupsets with the same gearing share an entry
  'grx-rx610-1x12': {
    name: 'Shimano GRX RX610 1x12',
    chainringTeeth: [40],
    cassette: 'Shimano CS-M7100-12 12 Speed 10-51T',
  },
  'grx-rx610-2x12': {
    name: 'Shimano GRX RX610 2x12',
    chainringTeeth: [46, 30],
    cassette: 'Shimano CS-HG710-12 12 Speed 11-36T',
  },
  'grx-rx820-1x12': {
    name: 'Shimano GRX RX820 / RX825 Di2 1x12',
    chainringTeeth: [40],
    cassette: 'Shimano CS-M8100-12 12 Speed 10-51T',
  },
  'grx-rx820-2x12': {
    name: 'Shimano GRX RX820 / RX825 Di2 2x12',
    chainringTeeth: [48, 31],
    cassette: 'Shimano CS-R8100-12 12 Speed 11-34T',
  },
  'sram-force-e1-xplr-1x13': {
    name: 'SRAM Force E1 XPLR AXS 1x13',
    chainringTeeth: [40],
    cassette: 'SRAM XPLR XG-1371 13 Speed 10-46T',
  },
} as const satisfies Record<string, Drivetrain>;

export type DrivetrainID = keyof typeof DRIVETRAIN_DB;

export const drivetrainIDs = Object.keys(DRIVETRAIN_DB) as DrivetrainID[];
export const getDrivetrain = (id: DrivetrainID): Drivetrain =>
  DRIVETRAIN_DB[id];

// e.g. "48/36/26T · Shimano Alivio CS-HG400 9 Speed 11-34T", with the
// groupset name first when there is one
export function drivetrainLabel(id: DrivetrainID): string {
  const d = getDrivetrain(id);
  const parts = [`${d.chainringTeeth.join('/')}T`, d.cassette];
  if (d.name) parts.unshift(d.name);
  if (d.sprockets && isInternallyGearedHub(CASSETTE_DB[d.cassette]))
    parts.push(`${d.sprockets.join('/')}T`);
  return parts.join(' · ');
}
