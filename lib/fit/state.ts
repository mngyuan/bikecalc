import {BAR_DB, STEM_DB, type BarID, type StemID} from '../data';
import {FIT_BIKES, type FitBikeID, geometryOf, isFitBike} from './bikes';
import {isMatched, solve} from './solve';

// Per-bike setup. All stem and bar fields are kept at once; stemType and
// barType decide which apply, so switching type keeps the other's numbers.
export interface BikeSettings {
  show: boolean;
  size: string;
  stemPreset: StemID | '';
  stemType: 'std' | 'goose';
  len: number;
  ang: number;
  stack: number;
  gH: number;
  gE: number;
  gMin: number;
  gMax: number;
  steerLen: number; // steerer above the headset top
  below: number; // spacers below the stem
  hs: number; // headset top stack
  barPreset: BarID | '';
  barType: 'drop' | 'riser';
  dW: number;
  dReach: number;
  dDrop: number;
  dFlare: number;
  dOut: number;
  dSweep: number;
  hoodExt: number;
  hoodUp: number;
  rW: number;
  rRise: number;
  rSweep: number;
  rInboard: number;
  matchTo: FitBikeID | ''; // copy saddle position from this bike
  sH: number; // BB to saddle top, along the seat tube
  sO: number; // seatpost setback
  sN: number; // rail clamp to saddle nose
  tyreW: number;
  crank: number;
  toe: number; // shoe tip ahead of the pedal spindle
  q: number; // Q-factor
  fender: number; // front fender gap
}

export type NumKey = {
  [K in keyof BikeSettings]: BikeSettings[K] extends number ? K : never;
}[keyof BikeSettings];

export interface FitSettings {
  steer: number;
  shoulder: number; // shoulder joint width
  arm: number; // shoulder to hand distance
  bikes: FitBikeID[]; // bikes added, in sidebar order
  bike: Record<FitBikeID, BikeSettings>;
}

// With one bike shown, edits go to a temporary copy drawn dashed until saved.
export interface Stage {
  id: FitBikeID;
  data: BikeSettings;
}

export interface FitState {
  saved: FitSettings;
  stage: Stage | null;
}

export const STEM_KEYS: readonly NumKey[] = ['len', 'ang', 'stack', 'gH', 'gE', 'gMin', 'gMax'];
export const BAR_KEYS: readonly NumKey[] = ['dW', 'dReach', 'dDrop', 'dFlare', 'dOut', 'dSweep', 'hoodExt', 'hoodUp', 'rW', 'rRise', 'rSweep', 'rInboard'];

const GENERIC: BikeSettings = {
  show: true,
  size: '',
  stemPreset: 'vo90_17',
  stemType: 'std',
  len: 90,
  ang: 17,
  stack: 40,
  gH: 145,
  gE: 70,
  gMin: 55,
  gMax: 100,
  steerLen: 60,
  below: 20,
  hs: 10,
  barPreset: 'cowbell44',
  barType: 'drop',
  dW: 440,
  dReach: 68,
  dDrop: 115,
  dFlare: 12,
  dOut: 12,
  dSweep: 0,
  hoodExt: 35,
  hoodUp: 30,
  rW: 640,
  rRise: 80,
  rSweep: 9,
  rInboard: 25,
  matchTo: '',
  sH: 720,
  sO: 0,
  sN: 125,
  tyreW: 40,
  crank: 170,
  toe: 100,
  q: 150,
  fender: 0,
};

// Example setups carried over from v2. Saddle and foot figures are examples.
const OVERRIDES: Partial<Record<FitBikeID, Partial<BikeSettings>>> = {
  'fuji-alterr-2025': {stemPreset: 'happy110', below: 37, steerLen: 87, matchTo: 'surly-cross-check-2012', tyreW: 54, q: 175},
  // measured: 30 below + 40 stem + 10 above
  'surly-cross-check-2012': {stemPreset: 'redshift80', below: 30, steerLen: 80, sO: 25, tyreW: 40, crank: 175, fender: 15},
  'velo-orange-polyvalent-2026': {stemPreset: 'vo90_17', below: 20, steerLen: 60, matchTo: 'surly-cross-check-2012', tyreW: 48, fender: 15},
};

const DEFAULT_BIKES: FitBikeID[] = ['fuji-alterr-2025', 'surly-cross-check-2012'];

export function stemFields(id: StemID): Partial<BikeSettings> {
  const {label: _label, ...rest} = STEM_DB[id];
  return rest;
}
export function barFields(id: BarID): Partial<BikeSettings> {
  const {label: _label, ...rest} = BAR_DB[id];
  return rest;
}

// Preset numbers always come from the catalog, so catalog fixes reach saved setups.
function applyPresets(s: BikeSettings): BikeSettings {
  return {
    ...s,
    ...(s.stemPreset ? stemFields(s.stemPreset) : {}),
    ...(s.barPreset ? barFields(s.barPreset) : {}),
  };
}

export const defaultsFor = (id: FitBikeID): BikeSettings =>
  applyPresets({...GENERIC, size: geometryOf(id).defaultSize, ...OVERRIDES[id]});

/* ---------- storage ---------- */

const KEY = 'bikecalc:fit';
const VERSION = 1;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

// Keep only known fields of the right type, then fill the rest from defaults.
function normalizeBike(id: FitBikeID, raw: unknown): BikeSettings {
  const s: BikeSettings = defaultsFor(id);
  if (isObj(raw)) {
    for (const k of Object.keys(s) as (keyof BikeSettings)[]) {
      if (typeof raw[k] === typeof s[k]) (s as unknown as Obj)[k] = raw[k];
    }
  }
  const geo = geometryOf(id);
  if (!(s.size in geo.sizes)) s.size = geo.defaultSize;
  if (s.stemPreset && !(s.stemPreset in STEM_DB)) s.stemPreset = '';
  if (s.barPreset && !(s.barPreset in BAR_DB)) s.barPreset = '';
  if (s.stemType !== 'std' && s.stemType !== 'goose') s.stemType = 'std';
  if (s.barType !== 'drop' && s.barType !== 'riser') s.barType = 'drop';
  if (!isFitBike(s.matchTo)) s.matchTo = '';
  return applyPresets(s);
}

export function normalizeSettings(raw: unknown): FitSettings {
  const o = isObj(raw) ? raw : {};
  const bikeIn = isObj(o.bike) ? o.bike : {};
  const bike = Object.fromEntries(
    FIT_BIKES.map((id) => [id, normalizeBike(id, bikeIn[id])]),
  ) as Record<FitBikeID, BikeSettings>;
  const bikes = Array.isArray(o.bikes)
    ? [...new Set(o.bikes.filter(isFitBike))]
    : [...DEFAULT_BIKES];
  return {
    steer: num(o.steer, 0),
    shoulder: num(o.shoulder, 400),
    arm: num(o.arm, 600),
    bikes,
    bike,
  };
}

export function loadSettings(): FitSettings {
  try {
    return normalizeSettings(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return normalizeSettings(null);
  }
}

export function saveSettings(s: FitSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify({version: VERSION, ...s}));
  } catch {
    // storage full or blocked: settings just won't persist
  }
}

/* ---------- reducer ---------- */

export type FitAction =
  | {type: 'set'; id: FitBikeID; key: NumKey; value: number}
  | {type: 'size'; id: FitBikeID; value: string}
  | {type: 'stemPreset'; id: FitBikeID; value: StemID | ''}
  | {type: 'barPreset'; id: FitBikeID; value: BarID | ''}
  | {type: 'stemType'; id: FitBikeID; value: BikeSettings['stemType']}
  | {type: 'barType'; id: FitBikeID; value: BikeSettings['barType']}
  | {type: 'match'; id: FitBikeID; value: FitBikeID | ''}
  | {type: 'toggle'; id: FitBikeID}
  | {type: 'remove'; id: FitBikeID}
  | {type: 'add'; id: FitBikeID}
  | {type: 'global'; key: 'steer' | 'shoulder' | 'arm'; value: number}
  | {type: 'saveStage'}
  | {type: 'resetStage'};

// The settings a sidebar edit applies to: the staged copy if there is one.
export const editTarget = (st: FitState, id: FitBikeID) =>
  st.stage && st.stage.id === id ? st.stage.data : st.saved.bike[id];

export function isDirty(st: FitState): boolean {
  if (!st.stage) return false;
  const a = st.saved.bike[st.stage.id],
    b = st.stage.data;
  return (Object.keys(b) as (keyof BikeSettings)[]).some(
    (k) => k !== 'show' && a[k] !== b[k],
  );
}

// After structural changes: keep a dirty stage, otherwise stage the bike
// when exactly one is shown.
export function syncStage(st: FitState): FitState {
  let stage = st.stage;
  if (stage && !st.saved.bikes.includes(stage.id)) stage = null;
  if (stage && isDirty({...st, stage})) return {...st, stage};
  const vis = st.saved.bikes.filter((k) => st.saved.bike[k].show);
  stage = vis.length === 1 ? {id: vis[0], data: {...st.saved.bike[vis[0]]}} : null;
  return {...st, stage};
}

function patch(
  st: FitState,
  id: FitBikeID,
  fn: (s: BikeSettings) => BikeSettings,
): FitState {
  if (st.stage && st.stage.id === id) {
    return {...st, stage: {id, data: fn(st.stage.data)}};
  }
  return patchSaved(st, id, fn);
}

const patchSaved = (
  st: FitState,
  id: FitBikeID,
  fn: (s: BikeSettings) => BikeSettings,
): FitState => ({
  ...st,
  saved: {...st.saved, bike: {...st.saved.bike, [id]: fn(st.saved.bike[id])}},
});

export const initFitState = (saved: FitSettings): FitState =>
  syncStage({saved, stage: null});

export function fitReducer(st: FitState, a: FitAction): FitState {
  switch (a.type) {
    case 'set':
      return patch(st, a.id, (s) => ({
        ...s,
        [a.key]: a.value,
        stemPreset: STEM_KEYS.includes(a.key) ? '' : s.stemPreset,
        barPreset: BAR_KEYS.includes(a.key) ? '' : s.barPreset,
      }));
    case 'global':
      return {...st, saved: {...st.saved, [a.key]: a.value}};
    case 'size':
      return syncStage(patch(st, a.id, (s) => ({...s, size: a.value})));
    case 'stemPreset':
      return syncStage(
        patch(st, a.id, (s) => ({...s, stemPreset: a.value, ...(a.value ? stemFields(a.value) : {})})),
      );
    case 'barPreset':
      return syncStage(
        patch(st, a.id, (s) => ({...s, barPreset: a.value, ...(a.value ? barFields(a.value) : {})})),
      );
    case 'stemType':
      return syncStage(patch(st, a.id, (s) => ({...s, stemType: a.value, stemPreset: ''})));
    case 'barType':
      return syncStage(patch(st, a.id, (s) => ({...s, barType: a.value, barPreset: ''})));
    case 'match':
      return syncStage(
        patch(st, a.id, (s) => {
          // unmatching: keep the saddle where it was by writing out its numbers
          if (!a.value && isMatched(st.saved, a.id, s)) {
            const G = solve(st.saved, a.id, s);
            return {...s, matchTo: '', sH: Math.round(G.sH), sO: Math.round(G.sO)};
          }
          return {...s, matchTo: a.value};
        }),
      );
    case 'toggle':
      return syncStage(patchSaved(st, a.id, (s) => ({...s, show: !s.show})));
    case 'remove':
      return syncStage({
        stage: st.stage?.id === a.id ? null : st.stage,
        saved: {...st.saved, bikes: st.saved.bikes.filter((k) => k !== a.id)},
      });
    case 'add': {
      if (st.saved.bikes.includes(a.id)) return st;
      const next = patchSaved(st, a.id, (s) => ({...s, show: true}));
      return syncStage({...next, saved: {...next.saved, bikes: [...next.saved.bikes, a.id]}});
    }
    case 'saveStage': {
      if (!st.stage) return st;
      const {show: _show, ...rest} = st.stage.data;
      return syncStage({...patchSaved(st, st.stage.id, (s) => ({...s, ...rest})), stage: null});
    }
    case 'resetStage':
      return syncStage({...st, stage: null});
  }
}
