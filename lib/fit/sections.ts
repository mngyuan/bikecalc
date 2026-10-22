// Sidebar layout for each bike card, ported from v2's SECS table.
import type {FitBikeID} from './bikes';
import {isMatched} from './solve';
import type {BikeSettings, FitSettings, NumKey} from './state';

export const TIPS: Record<string, string> = {
  len: 'Stem extension, steerer centre to bar clamp centre',
  ang: 'Rise from square-on to the steerer; negative points down',
  stack: 'Height of the stem clamp on the steerer',
  gH: 'Height from stem base to bar centre, along steerer',
  gE: 'Forward distance from steerer centre to bar centre',
  gMin: 'Least steerer the stem needs to clamp safely',
  gMax: 'Most steerer that fits inside the stem',
  steerLen: 'Steerer length measured up from the headset top',
  below: 'Spacer stack between headset and stem',
  _above: 'Leftover steerer above the stem, filled with spacers',
  hs: 'Headset top cap height above the head tube',
  dW: 'Stated bar width, centre to centre',
  dWAt: 'Where the brand measures width: at the hoods, or where the tops start to bend forward. On a flared bar the hoods sit wider than the bend.',
  dReach: 'Clamp centre to the furthest-forward point of the bend',
  dDrop: 'Vertical distance from the tops down to the drops',
  dFlare: 'How much the drops lean outward, seen from the front',
  dOut: 'How much the drop ends kick outward, seen from above',
  dSweep: 'How far the tops sweep back towards you',
  hoodExt: 'Where your palm sits, ahead of the bar reach',
  hoodUp: 'Height of your palm above the bar centre',
  rW: 'Riser bar width, end to end',
  rRise: 'Height of the grips above the stem clamp',
  rSweep: 'Angle the grips bend back towards you',
  rInboard: 'Distance from bar end to your palm centre',
  matchTo: 'Copy the saddle position from another bike, or set it',
  sH: 'BB centre to saddle top, measured along the seat tube',
  sO: 'How far the seatpost puts the clamp behind the seat tube',
  sN: 'Distance from the rail clamp to the saddle nose',
  _sH: 'Saddle height this bike needs to match the other',
  _sO: 'Post setback this bike needs to match the other',
  tyreW: 'Actual tyre width; sets the wheel diameter',
  crank: 'Crank arm length, BB centre to pedal spindle',
  toe: 'How far your shoe tip sits ahead of the spindle',
  q: 'Distance between the outer faces of the crank arms',
  fender: 'Gap plus mudguard thickness around the front tyre',
};

type When = (s: BikeSettings, id: FitBikeID, saved: FitSettings) => boolean;

export type SectionItem =
  | {type: 'num'; k: NumKey; label: string; min: number; max: number; step: number; slider?: boolean; when?: When}
  | {type: 'stemPreset'}
  | {type: 'barPreset'}
  | {type: 'stemType'}
  | {type: 'barType'}
  | {type: 'dWAt'; when: When}
  | {type: 'match'}
  | {type: 'above'}
  | {type: 'saddle'; when: When};

export interface Section {
  title: string;
  open: boolean;
  items: SectionItem[];
}

const num = (
  k: NumKey,
  label: string,
  min: number,
  max: number,
  step: number,
  o: {slider?: boolean; when?: When} = {},
): SectionItem => ({type: 'num', k, label, min, max, step, ...o});

const std: When = (s) => s.stemType === 'std';
const goose: When = (s) => s.stemType === 'goose';
const drop: When = (s) => s.barType === 'drop';
const riser: When = (s) => s.barType === 'riser';
const manual: When = (s, id, saved) => !isMatched(saved, id, s);

export const SECTIONS: Section[] = [
  {
    title: 'Stem',
    open: true,
    items: [
      {type: 'stemPreset'},
      {type: 'stemType'},
      num('len', 'Length', 30, 150, 5, {slider: true, when: std}),
      num('ang', 'Rise angle (°)', -20, 70, 1, {slider: true, when: std}),
      num('stack', 'Clamp height', 30, 60, 1, {when: std}),
      num('gH', 'Height, base → bar centre', 60, 220, 5, {slider: true, when: goose}),
      num('gE', 'Extension', 0, 140, 5, {slider: true, when: goose}),
      num('gMin', 'Min steerer insertion', 20, 120, 1, {when: goose}),
      num('gMax', 'Max steerer insertion', 20, 160, 1, {when: goose}),
    ],
  },
  {
    title: 'Steerer & spacers',
    open: true,
    items: [
      num('steerLen', 'Steerer above headset', 20, 220, 1),
      num('below', 'Spacers below stem', 0, 80, 1, {slider: true}),
      {type: 'above'},
      num('hs', 'Headset top stack', 0, 40, 1),
    ],
  },
  {
    title: 'Bars',
    open: true,
    items: [
      {type: 'barPreset'},
      {type: 'barType'},
      num('dW', 'Width (c-c)', 360, 560, 10, {slider: true, when: drop}),
      {type: 'dWAt', when: drop},
      num('dReach', 'Bar reach', 40, 100, 1, {when: drop}),
      num('dDrop', 'Bar drop', 80, 160, 1, {when: drop}),
      num('dFlare', 'Drop flare (°)', 0, 35, 1, {when: drop}),
      num('dOut', 'Drop outsweep / flare-out (°)', 0, 25, 1, {when: drop}),
      num('dSweep', 'Tops backsweep (°)', 0, 15, 1, {when: drop}),
      num('hoodExt', 'Hand ahead of bar reach', 0, 80, 1, {when: drop}),
      num('hoodUp', 'Hand above bar centre', 0, 60, 1, {when: drop}),
      num('rW', 'Width', 500, 800, 10, {slider: true, when: riser}),
      num('rRise', 'Rise', 0, 120, 5, {when: riser}),
      num('rSweep', 'Backsweep (°)', 0, 45, 1, {when: riser}),
      num('rInboard', 'Hand inboard of bar end', 0, 80, 1, {when: riser}),
    ],
  },
  {
    title: 'Saddle',
    open: false,
    items: [
      {type: 'match'},
      num('sH', 'Height, BB → top (along seat tube)', 550, 850, 1, {when: manual}),
      num('sO', 'Seatpost setback', -20, 60, 1, {when: manual}),
      num('sN', 'Clamp → saddle nose', 80, 180, 1),
      {type: 'saddle', when: (s, id, saved) => isMatched(saved, id, s)},
    ],
  },
  {
    title: 'Feet & tyre',
    open: false,
    items: [
      num('tyreW', 'Tyre width', 28, 70, 1),
      num('crank', 'Crank length', 150, 180, 2.5),
      num('toe', 'Shoe toe ahead of spindle', 60, 150, 1),
      num('q', 'Q-factor', 130, 200, 1),
      num('fender', 'Front fender gap', 0, 40, 1),
    ],
  },
];
