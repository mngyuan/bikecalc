// Two kinds of entry:
// - derailleur cassettes list `sprockets` (cog teeth, smallest first)
// - internally geared hubs list `ratios`, gear 1 first. A ratio is hub output
//   speed over sprocket speed, so 1 is direct drive and values above 1 are
//   overdrive. Bikes with a hub list their own `sprockets` in bikes.ts.

// prettier-ignore
// sorted by product family or number of sprockets, then smallest sprocket, then largest sprocket, then name
export const CASSETTE_DB = {
  'Microshift Advent X H-Series 10 Speed 11-48T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28, 34, 40, 48],
  },
  'Microshift G-Series 11 Speed 11-46T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28, 32, 36, 40, 46],
  },
  'Microshift H-Series 10 Speed 11-42T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28, 32, 36, 42],
  },
  'Shimano CS-HG50-10 10 Speed 11-36T': {
    sprockets: [11, 13, 15, 17, 19, 21, 24, 28, 32, 36],
  },
  'Shimano CS-HG500-10 10 Speed 11-25T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 23, 25],
  },
  'Shimano CS-HG500-10 10 Speed 11-32T': {
    sprockets: [11, 12, 14, 16, 18, 20, 22, 25, 28, 32],
  },
  'Shimano CS-HG500-10 10 Speed 11-34T': {
    sprockets: [11, 13, 15, 17, 19, 21, 23, 26, 30, 34],
  },
  'Shimano CS-HG500-10 10 Speed 12-28T': {
    sprockets: [12, 13, 14, 15, 17, 19, 21, 23, 25, 28],
  },
  'Shimano CS-M4100-10 10 Speed 11-42T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28, 32, 37, 42],
  },
  'Shimano CS-M4100-10 10 Speed 11-46T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28, 32, 37, 46],
  },
  'Shimano CS-LG300-10 10 Speed 11-39T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 34, 39],
  },
  'Shimano CS-LG300-10 10 Speed 11-48T': {
    sprockets: [11, 13, 15, 17, 20, 23, 28, 34, 41, 48],
  },
  'Shimano CS-LG400-10 10 Speed 11-39T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 34, 39],
  },
  'Shimano CS-LG400-10 10 Speed 11-43T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 36, 43],
  },
  'Shimano CS-LG400-10 10 Speed 11-48T': {
    sprockets: [11, 13, 15, 17, 20, 23, 28, 34, 41, 48],
  },
  'Rohloff Speedhub 500/14': {
    ratios: [
      0.279, 0.316, 0.36, 0.409, 0.464, 0.528, 0.6, 0.682, 0.774, 0.881, 1.0,
      1.135, 1.292, 1.467,
    ],
    isIGH: true,
  },
  'Shimano Alfine 8 Speed Hub': {
    ratios: [0.527, 0.644, 0.748, 0.851, 1, 1.223, 1.419, 1.615],
    isIGH: true,
  },
  'Shimano Alfine 11 Speed Hub': {
    ratios: [
      0.527, 0.681, 0.77, 0.878, 0.995, 1.134, 1.292, 1.462, 1.667, 1.888,
      2.153,
    ],
    isIGH: true,
  },
  'Shimano CS-HG41-7 7 Speed 11-28T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28],
  },
  'Shimano CS-HG400-7 7 Speed 11-28T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28],
  },
  'Shimano CS-HG200-7 7 Speed 12-28T': {
    sprockets: [12, 14, 16, 18, 21, 24, 28],
  },
  'Shimano CS-HG200-7 7 Speed 12-32T': {
    sprockets: [12, 14, 16, 18, 21, 26, 32],
  },
  'Shimano CS-HG210-7 7 Speed 12-28T': {
    sprockets: [12, 14, 16, 18, 21, 24, 28],
  },
  'Shimano CS-HG210-7 7 Speed 12-32T': {
    sprockets: [12, 14, 16, 18, 21, 26, 32],
  },
  'Shimano CS-HG50-8 8 Speed 11-28T': {
    sprockets: [11, 13, 15, 17, 19, 21, 24, 28],
  },
  'Shimano CS-HG50-8 8 Speed 11-30T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30],
  },
  'Shimano CS-HG50-8 8 Speed 11-32T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28, 32],
  },
  'Shimano CS-HG50-8 8 Speed 11-34T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28, 34],
  },
  'Shimano CS-HG50-8 8 Speed 12-23T': {
    sprockets: [12, 13, 14, 15, 17, 19, 21, 23],
  },
  'Shimano CS-HG50-8 8 Speed 12-25T': {
    sprockets: [12, 13, 15, 17, 19, 21, 23, 25],
  },
  'Shimano CS-HG50-8 8 Speed 13-26T': {
    sprockets: [13, 14, 15, 17, 19, 21, 23, 26],
  },
  'Shimano CS-HG200-8 8 Speed 12-32T': {
    sprockets: [12, 14, 16, 18, 21, 24, 28, 32],
  },
  'Shimano CS-HG300-8 8 Speed 11-45T': {
    sprockets: [11, 13, 15, 18, 22, 27, 35, 45],
  },
  'Shimano CS-HG400-8 8 Speed 11-40T': {
    sprockets: [11, 13, 15, 18, 22, 27, 33, 40],
  },
  'Shimano CS-HG400-8 8 Speed 11-45T': {
    sprockets: [11, 13, 15, 18, 22, 27, 35, 45],
  },
  'Shimano Alivio CS-HG400 9 Speed 11-28T': {
    sprockets: [11, 12, 13, 14, 16, 18, 21, 24, 28],
  },
  'Shimano Alivio CS-HG400 9 Speed 11-32T': {
    sprockets: [11, 12, 14, 16, 18, 21, 24, 28, 32],
  },
  'Shimano Alivio CS-HG400 9 Speed 11-34T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 34],
  },
  'Shimano Alivio CS-HG400 9 Speed 11-36T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 36],
  },
  'Shimano Alivio CS-HG400 9 Speed 12-36T': {
    sprockets: [12, 14, 16, 18, 21, 24, 28, 32, 36],
  },
  'Shimano CS-HG201-9 9 Speed 11-32T': {
    sprockets: [11, 13, 15, 17, 19, 21, 24, 28, 32],
  },
  'Shimano CS-HG201-9 9 Speed 11-34T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 34],
  },
  'Shimano CS-HG201-9 9 Speed 11-36T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 36],
  },
  'Shimano CS-LG300-9 9 Speed 11-36T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 36],
  },
  'Shimano CS-LG300-9 9 Speed 11-41T': {
    sprockets: [11, 13, 15, 17, 20, 23, 28, 34, 41],
  },
  'Shimano CS-LG300-9 9 Speed 11-46T': {
    sprockets: [11, 13, 15, 17, 20, 23, 28, 36, 46],
  },
  'Shimano CS-LG400-9 9 Speed 11-36T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 36],
  },
  'Shimano CS-LG400-9 9 Speed 11-41T': {
    sprockets: [11, 13, 15, 17, 20, 23, 28, 34, 41],
  },
  'Shimano CS-LG400-9 9 Speed 11-46T': {
    sprockets: [11, 13, 15, 17, 20, 23, 28, 36, 46],
  },
  'SRAM PG-1130 11 Speed 11-26T': {
    sprockets: [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 26],
  },
  'SRAM PG-1130 11 Speed 11-28T': {
    sprockets: [11, 12, 13, 14, 15, 16, 17, 19, 22, 25, 28],
  },
  'SRAM PG-1130 11 Speed 11-32T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 22, 25, 28, 32],
  },
  'SRAM PG-1130 11 Speed 11-36T': {
    sprockets: [11, 12, 13, 15, 17, 19, 22, 25, 28, 32, 36],
  },
  'SRAM PG-1130 11 Speed 11-42T': {
    sprockets: [11, 13, 15, 17, 19, 22, 25, 28, 32, 36, 42],
  },
  'Shimano CS-HG700-11 11 Speed 11-34T': {
    sprockets: [11, 13, 15, 17, 19, 21, 23, 25, 27, 30, 34],
  },
  'Shimano CS-HG800-11 11 Speed 11-34T': {
    sprockets: [11, 13, 15, 17, 19, 21, 23, 25, 27, 30, 34],
  },
  'Shimano CS-M5100-11 11 Speed 11-42T': {
    sprockets: [11, 13, 15, 17, 19, 21, 24, 28, 32, 37, 42],
  },
  'Shimano CS-M5100-11 11 Speed 11-51T': {
    sprockets: [11, 13, 15, 18, 21, 24, 28, 33, 39, 45, 51],
  },
  'Shimano CS-M8000 11 Speed 11-40T': {
    sprockets: [11, 13, 15, 17, 19, 21, 24, 27, 31, 35, 40],
  },
  'Shimano CS-M8000 11 Speed 11-42T': {
    sprockets: [11, 13, 15, 17, 19, 21, 24, 28, 32, 37, 42],
  },
  'Shimano CS-M8000 11 Speed 11-46T': {
    sprockets: [11, 13, 15, 17, 19, 21, 24, 28, 32, 37, 46],
  },
  'Shimano CS-R7000 11 Speed 11-28T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28],
  },
  'Shimano CS-R7000 11 Speed 11-30T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30],
  },
  'Shimano CS-R7000 11 Speed 11-32T': {
    sprockets: [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32],
  },
  'Shimano CS-R7000 11 Speed 12-25T': {
    sprockets: [12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 25],
  },
  'Shimano CS-R8000 11 Speed 11-25T': {
    sprockets: [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 25],
  },
  'Shimano CS-R8000 11 Speed 11-28T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28],
  },
  'Shimano CS-R8000 11 Speed 11-30T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30],
  },
  'Shimano CS-R8000 11 Speed 11-32T': {
    sprockets: [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32],
  },
  'Shimano CS-R8000 11 Speed 12-25T': {
    sprockets: [12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 25],
  },
  'Shimano CS-R8000 11 Speed 14-28T': {
    sprockets: [14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 28],
  },
  'Shimano CS-LG400-11 11 Speed 11-45T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 34, 39, 45],
  },
  'Shimano CS-LG400-11 11 Speed 11-50T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 36, 43, 50],
  },
  'Shimano CS-LG700-11 11 Speed 11-45T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 34, 39, 45],
  },
  'Shimano CS-LG700-11 11 Speed 11-50T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 36, 43, 50],
  },
  'SRAM XPLR PG-1231 12 Speed 11-44T': {
    sprockets: [11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44],
  },
  'Shimano CS-HG710-12 12 Speed 11-36T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 32, 36],
  },
  'Shimano CS-M6100-12 12 Speed 10-51T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
  },
  'Shimano CS-M7100-12 12 Speed 10-45T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 45],
  },
  'Shimano CS-M7100-12 12 Speed 10-51T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
  },
  'Shimano CS-M8100-12 12 Speed 10-45T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 45],
  },
  'Shimano CS-M8100-12 12 Speed 10-51T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
  },
  'Shimano CS-M8200-12 12 Speed 9-45T': {
    sprockets: [9, 11, 13, 15, 17, 19, 21, 24, 28, 33, 39, 45],
  },
  'Shimano CS-M8200-12 12 Speed 10-51T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
  },
  'Shimano CS-M9101-12 12 Speed 10-45T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 45],
  },
  'Shimano CS-M9101-12 12 Speed 10-51T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
  },
  'Shimano CS-M9200-12 12 Speed 9-45T': {
    sprockets: [9, 11, 13, 15, 17, 19, 21, 24, 28, 33, 39, 45],
  },
  'Shimano CS-M9200-12 12 Speed 10-51T': {
    sprockets: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
  },
  'Shimano CS-R7101-12 12 Speed 11-34T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34],
  },
  'Shimano CS-R8100-12 12 Speed 11-30T': {
    sprockets: [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30],
  },
  'Shimano CS-R8100-12 12 Speed 11-34T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34],
  },
  'Shimano CS-R8101-12 12 Speed 11-30T': {
    sprockets: [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30],
  },
  'Shimano CS-R8101-12 12 Speed 11-34T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34],
  },
  'Shimano CS-R9200-12 12 Speed 11-30T': {
    sprockets: [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30],
  },
  'Shimano CS-R9200-12 12 Speed 11-34T': {
    sprockets: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34],
  },
  'Sturmey Archer BSR': {
    // THink this is the same hub as S-RF3
    ratios: [0.75, 1, 1.3333333],
    isIGH: true,
  },
  'Sturmey Archer BWR': {
    ratios: [0.64, 1, 1.56],
    isIGH: true,
  },
  'Sturmey Archer S-RF3': {
    ratios: [0.75, 1, 1.3333333],
    isIGH: true,
    // TODO: would be nice for IGH to specify maximum sprockets
  },
  'Sturmey Archer S-RF5': {
    ratios: [0.733, 0.885, 1, 1.212, 1.464],
    isIGH: true,
  },
  'Sturmey Archer X-RF8': {
    ratios: [1, 1.3, 1.48, 1.69, 1.92, 2.2, 2.5, 3.25],
    isIGH: true,
  },
  'SunRace 10 Speed 11-51T': {
    sprockets: [11, 13, 15, 18, 23, 28, 33, 39, 45, 51],
  }
} as const;
export type CassetteID = keyof typeof CASSETTE_DB;
export type Cassette = (typeof CASSETTE_DB)[CassetteID];

export const isInternallyGearedHub = (
  cassette: Cassette,
): cassette is Extract<Cassette, {isIGH: true}> => 'isIGH' in cassette;

export const isSprocketCassette = (
  cassette: Cassette,
): cassette is Extract<Cassette, {sprockets: readonly number[]}> =>
  'sprockets' in cassette;
