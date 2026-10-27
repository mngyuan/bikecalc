// Google Forms for suggesting catalog additions, prefilled from the current config.

const form = (id: string, entries: Record<string, string | number>) =>
  `https://docs.google.com/forms/d/e/${id}/viewform?` +
  new URLSearchParams({
    usp: 'pp_url',
    ...Object.fromEntries(
      Object.entries(entries).map(([k, v]) => [k, String(v)]),
    ),
  });

export const tireFormURL = (width: number, bsd: number) =>
  form('1FAIpQLSdS4NBfBk0IQzMqWQmZAiXVB6gVFUQMV0RltprMolS2PQldzg', {
    'entry.596176511': width,
    'entry.233968638': bsd,
  });

const CASSETTE_FORM =
  '1FAIpQLSdSh3Y0tpJTfAZOjLuBVre508ZaTbL2fC1HtGmr8pqh-v16hw';

export const cassetteFormURL = (sprockets: number[]) =>
  form(CASSETTE_FORM, {
    'entry.818217627': 'Cassette',
    'entry.1849128967': sprockets.length,
    'entry.583801447': sprockets.join(','),
  });

export const hubFormURL = (ratios: number[], sprockets: number[]) =>
  form(CASSETTE_FORM, {
    'entry.818217627': 'Internal Geared Hub',
    'entry.1849128967': ratios.length,
    'entry.583801447': ratios.join(','),
    'entry.2043344245': sprockets.join(','),
  });

export const bikeFormURL = (chainrings: number[]) =>
  form('1FAIpQLSeFA22GlMWRsEBvg0faIXLl07CCplp-EYlbZ2mHjTGFaWGuBg', {
    'entry.1276123081': chainrings.length,
    'entry.379143291': chainrings.join(','),
  });
