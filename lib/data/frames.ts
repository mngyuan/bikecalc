// Frames with published geometry. The fit visualizer lists these; the gear
// calculator draws one when a bike or the frame picker names it.

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
  bsd: number; // bead seat diameter of the wheels this size is built for
}

export interface Frame {
  name: string;
  short?: string; // compact label for pills and table headers
  year?: string;
  source: string;
  defaultSize: string;
  ring: number; // chainring radius drawn in the fit view
  sizes: Record<string, FrameSize>;
  // Other wheel sizes (bead seat diameters) every size also takes
  altBsd?: readonly number[];
}

// A geometry chart read column by column, the way makers publish them.
// A number is shared by every size; an array gives one value per size.
type Column = number | readonly number[];
function sizeTable(
  sizes: readonly string[],
  cols: Record<Exclude<keyof FrameSize, 'label'>, Column>,
  label: (size: string) => string = (s) => s,
): Record<string, FrameSize> {
  for (const [k, v] of Object.entries(cols)) {
    if (typeof v !== 'number' && v.length !== sizes.length)
      throw new Error(`${k} has ${v.length} values for ${sizes.length} sizes`);
  }
  const at = (v: Column, i: number) => (typeof v === 'number' ? v : v[i]);
  return Object.fromEntries(
    sizes.map((s, i) => [
      s,
      {
        label: label(s),
        ...(Object.fromEntries(
          Object.entries(cols).map(([k, v]) => [k, at(v, i)]),
        ) as Omit<FrameSize, 'label'>),
      },
    ]),
  );
}

export const FRAME_DB = {
  // Geometry from Bike Insights (Alterr 52, Cross Check 52) and Velo Orange
  // (Polyvalent).
  'fuji-alterr-2025': {
    name: 'Fuji Alterr',
    short: 'Alterr',
    year: '2025',
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
  'surly-cross-check-2012': {
    name: 'Surly Cross Check',
    short: 'Cross Check',
    year: '2012',
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
  'velo-orange-polyvalent-2026': {
    name: 'Velo Orange Polyvalent',
    short: 'Polyvalent',
    year: '2026',
    source: 'Velo Orange',
    defaultSize: 'M',
    ring: 82,
    sizes: sizeTable(['S', 'M', 'L', 'XL'], {
      stack: [528, 558, 589, 619],
      reach: [359, 369, 379, 399],
      ht: [99, 131, 163, 195],
      st: [510, 540, 570, 600],
      hta: 73,
      sta: 72,
      drop: 67,
      cs: 429.8,
      off: 60,
      tt: 0,
      bsd: 584,
    }),
  },

  // Geometry copied from the makers' sites. None publish top tube slope, so
  // tt is estimated: the angle from the seat tube top to a point 20 mm down
  // the head tube. The 650b/700c frames are listed as built for 700c; altBsd
  // adds 650b where the maker offers it.
  'fairlight-faran-3-2026': {
    name: 'Fairlight Faran 3.0',
    short: 'Faran 3.0',
    year: '2026',
    source: 'Fairlight Cycles',
    defaultSize: '56R',
    ring: 82,
    altBsd: [584],
    sizes: sizeTable(['51T', '54R', '54T', '56R', '56T', '58R', '58T', '61T'], {
      stack: [570, 558, 590, 576, 611, 594, 630, 650],
      reach: [370, 388, 378, 396, 386, 404, 394, 402],
      ht: [124, 110, 143, 131, 167, 148, 185, 206],
      st: [518, 531, 537, 549, 557, 567, 575, 594],
      hta: [71.5, 72, 72, 72, 72, 72.5, 72.5, 72.5],
      sta: [74, 74, 74, 73.5, 73.5, 73.5, 73.5, 73.5],
      drop: [77, 77, 77, 75, 75, 75, 75, 75],
      cs: 432,
      off: 60,
      tt: [5.8, 3, 5.9, 3.1, 6, 3.1, 6, 6.1],
      bsd: 622,
    }),
  },
  'brother-kepler-2026': {
    name: 'Brother Kepler',
    short: 'Kepler',
    year: '2026',
    source: 'Brother Cycles',
    defaultSize: '54',
    ring: 82,
    sizes: sizeTable(
      ['50', '52', '54', '56', '58', '60'],
      {
        stack: [530, 530, 543, 562, 580, 598],
        reach: [372, 378, 384, 387, 392, 401],
        ht: [95, 95, 105, 124, 142, 161],
        st: [500, 520, 540, 560, 580, 600], // centre to top
        hta: [71, 71, 71.5, 72, 72, 72],
        sta: [74.5, 74, 73.5, 73, 72.5, 72],
        drop: 70,
        cs: [430, 430, 430, 435, 435, 435],
        off: [50, 50, 45, 45, 45, 45],
        tt: [3.3, 1.2, 0.7, 0.8, 0.8, 0.8],
        bsd: 622,
      },
      (s) => `${s}cm`,
    ),
  },
  'singular-peregrine-2026': {
    name: 'Singular Peregrine',
    short: 'Peregrine',
    year: '2026',
    source: 'Singular Cycles',
    defaultSize: 'M',
    ring: 70,
    // S and M take 650b wheels, L and XL take 29er
    sizes: sizeTable(['S', 'M', 'L', 'XL'], {
      stack: [535, 552, 586, 605],
      reach: [372, 397, 401, 420],
      ht: [112, 130, 135, 155],
      st: [540, 560, 595, 615],
      hta: 72,
      sta: [74, 74, 73, 73],
      drop: [65, 65, 75, 75],
      cs: [435, 435, 445, 445],
      off: [50, 50, 55, 55],
      tt: [-0.3, -0.5, -0.2, -0.2],
      bsd: [584, 584, 622, 622],
    }),
  },
  'temple-adventure-disc-2026': {
    name: 'Temple Adventure Disc',
    short: 'Adventure Disc',
    year: '2026',
    source: 'Temple Cycles',
    defaultSize: 'M',
    ring: 82,
    sizes: sizeTable(['XS', 'S', 'M', 'L', 'XL'], {
      stack: [547, 559, 568, 589, 617],
      reach: [366, 377, 385, 388, 395],
      ht: [125, 135, 145, 167, 195],
      st: [490, 520, 540, 565, 595],
      hta: [71, 71, 71.5, 71.5, 72],
      sta: [73.5, 73.5, 73, 72.5, 72.5],
      drop: 71,
      cs: 430,
      off: 45,
      tt: [6.5, 4.5, 3.4, 3.2, 3],
      bsd: 622,
    }),
  },
} as const satisfies Record<string, Frame>;

export type FrameID = keyof typeof FRAME_DB;

export const frameIDs = Object.keys(FRAME_DB) as FrameID[];
export const getFrame = (id: FrameID): Frame => FRAME_DB[id];
export const isFrameID = (v: unknown): v is FrameID =>
  typeof v === 'string' && v in FRAME_DB;

// A size of a frame, falling back to its default size.
export function frameSizeOf(id: FrameID, size: string): FrameSize {
  const f = getFrame(id);
  return f.sizes[size] ?? f.sizes[f.defaultSize];
}

// Wheel sizes a frame size takes, the one it's built for first
export function wheelsOf(id: FrameID, size: string): number[] {
  const f = getFrame(id);
  return [frameSizeOf(id, size).bsd, ...(f.altBsd ?? [])];
}

// The gear calculator draws this frame when no frame is chosen.
// It is the same 52cm Cross Check the old three.js view was modelled on.
export const REFERENCE_FRAME = {
  frame: 'surly-cross-check-2012',
  size: '52',
} as const satisfies {frame: FrameID; size: string};
